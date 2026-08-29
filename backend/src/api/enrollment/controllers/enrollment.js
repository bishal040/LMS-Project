'use strict';

/**
 * enrollment controller
 * 
 * Custom endpoints:
 * - POST /enrollments: Enroll current student (with duplicate check)
 * - GET /enrollments/me: Get current student's enrollments
 * - GET /enrollments/check/:courseId: Check if student is enrolled
 */
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    // Only students can enroll
    const role = user.role?.type || 'authenticated';
    if (!['authenticated', 'student'].includes(role)) {
      return ctx.forbidden('Only students can enroll in courses');
    }

    const courseId = ctx.request.body.data?.course;
    if (!courseId) return ctx.badRequest('Course ID is required');

    // Check if already enrolled (prevent duplicates)
    const existing = await strapi.documents('api::enrollment.enrollment').findMany({
      filters: {
        student: { id: user.id },
        course: { documentId: courseId },
      },
    });

    if (existing && existing.length > 0) {
      return ctx.badRequest('You are already enrolled in this course');
    }

    // Create enrollment
    const enrollment = await strapi.documents('api::enrollment.enrollment').create({
      data: {
        student: user.id,
        course: courseId,
        enrolledAt: new Date().toISOString(),
      },
    });

    return { data: enrollment };
  },

  // Custom: Get current student's enrollments with course data
  async me(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const enrollments = await strapi.documents('api::enrollment.enrollment').findMany({
      filters: { student: { id: user.id } },
      populate: {
        course: {
          populate: ['instructor', 'lessons'],
        },
      },
      sort: { enrolledAt: 'desc' },
    });

    return { data: enrollments };
  },

  // Custom: Check if student is enrolled in a specific course
  async check(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const courseId = ctx.params.courseId;

    const enrollments = await strapi.documents('api::enrollment.enrollment').findMany({
      filters: {
        student: { id: user.id },
        course: { documentId: courseId },
      },
    });

    return { enrolled: enrollments && enrollments.length > 0 };
  },

  /**
   * Get all enrolled students for a specific course with their progress.
   * Used by instructors and content managers to see student progress.
   * 
   * GET /enrollments/course-students/:courseId
   */
  async courseStudents(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const courseId = ctx.params.courseId;

    // Get the course with its lessons to know the total count
    const course = await strapi.documents('api::course.course').findOne({
      documentId: courseId,
      populate: ['lessons', 'instructor'],
    });

    if (!course) return ctx.notFound('Course not found');

    const totalLessons = course.lessons?.length || 0;

    // Get all enrollments for this course with student info
    const enrollments = await strapi.documents('api::enrollment.enrollment').findMany({
      filters: {
        course: { documentId: courseId },
      },
      populate: {
        student: {
          populate: ['role'],
        },
      },
    });

    // For each enrolled student, fetch their progress
    const studentsWithProgress = await Promise.all(
      (enrollments || []).map(async (enrollment) => {
        const student = enrollment.student;
        if (!student) return null;

        // Count completed lessons for this student in this course
        const completedProgress = await strapi.documents('api::progress.progress').findMany({
          filters: {
            student: { id: student.id },
            course: { documentId: courseId },
            completed: true,
          },
          populate: ['lesson'],
        });

        const completedCount = completedProgress?.length || 0;
        const percentage = totalLessons > 0
          ? Math.round((completedCount / totalLessons) * 100)
          : 0;

        // Get completed lesson IDs
        const completedLessonIds = completedProgress
          ?.map((p) => p.lesson?.documentId)
          .filter(Boolean) || [];

        // Also get this student's total enrollments across all courses (for content manager view)
        const allEnrollments = await strapi.documents('api::enrollment.enrollment').findMany({
          filters: { student: { id: student.id } },
          populate: { course: true },
        });

        // Get quiz attempts for this student in this course
        const quizAttempts = await strapi.documents('api::quiz-attempt.quiz-attempt').findMany({
          filters: {
            student: { id: student.id },
          },
          populate: ['quiz'],
        });

        return {
          id: student.id,
          username: student.username,
          email: student.email,
          enrolledAt: enrollment.enrolledAt,
          progress: {
            totalLessons,
            completedLessons: completedCount,
            percentage,
            completedLessonIds,
          },
          totalEnrollments: allEnrollments?.length || 0,
          enrolledCourses: (allEnrollments || []).map(e => ({
            documentId: e.course?.documentId,
            title: e.course?.title,
          })).filter(c => c.title),
          quizAttempts: (quizAttempts || []).length,
        };
      })
    );

    return {
      data: {
        courseTitle: course.title,
        totalLessons,
        instructor: course.instructor ? {
          id: course.instructor.id,
          username: course.instructor.username,
        } : null,
        students: studentsWithProgress.filter(Boolean),
      },
    };
  },
}));
