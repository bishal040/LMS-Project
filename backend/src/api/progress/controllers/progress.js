'use strict';

/**
 * progress controller
 * 
 * Custom endpoints:
 * - POST /progresses: Mark a lesson complete for current student
 * - GET /progresses/course/:courseId: Get progress % for current student
 * 
 * PROGRESS TRACKING LOGIC:
 * ========================
 * 1. When student clicks "Mark Complete" on a lesson:
 *    - We check if a progress record already exists for this student+lesson
 *    - If not, we create one with completed=true and completedAt=now
 *    - If it already exists, we skip (idempotent)
 * 
 * 2. To calculate progress percentage for a course:
 *    - Count total lessons in the course
 *    - Count completed progress records for this student in this course
 *    - Percentage = (completed / total) * 100
 *    - This is accurate per student, per course
 *    - It persists in the database, so it survives page refreshes
 */
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::progress.progress', ({ strapi }) => ({
  // Mark a lesson as complete
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const { lesson, course } = ctx.request.body.data || {};
    if (!lesson || !course) {
      return ctx.badRequest('Both lesson and course IDs are required');
    }

    // Check if already marked complete (idempotent operation)
    const existing = await strapi.documents('api::progress.progress').findMany({
      filters: {
        student: { id: user.id },
        lesson: { documentId: lesson },
        course: { documentId: course },
      },
    });

    if (existing && existing.length > 0) {
      // Already completed — return existing record
      return { data: existing[0], message: 'Lesson already completed' };
    }

    // Create progress record
    const progress = await strapi.documents('api::progress.progress').create({
      data: {
        student: user.id,
        lesson: lesson,
        course: course,
        completed: true,
        completedAt: new Date().toISOString(),
      },
    });

    return { data: progress };
  },

  // Get progress for a specific course (current student)
  async courseProgress(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const courseId = ctx.params.courseId;

    // Step 1: Count total lessons in the course
    const course = await strapi.documents('api::course.course').findOne({
      documentId: courseId,
      populate: ['lessons'],
    });

    if (!course) return ctx.notFound('Course not found');

    const totalLessons = course.lessons?.length || 0;

    // Step 2: Count completed lessons for this student in this course
    const completedProgress = await strapi.documents('api::progress.progress').findMany({
      filters: {
        student: { id: user.id },
        course: { documentId: courseId },
        completed: true,
      },
      populate: ['lesson'],
    });

    const completedCount = completedProgress?.length || 0;

    // Step 3: Calculate percentage
    // percentage = (completedLessons / totalLessons) * 100
    const percentage = totalLessons > 0
      ? Math.round((completedCount / totalLessons) * 100)
      : 0;

    // Step 4: Get list of completed lesson IDs for the frontend
    const completedLessonIds = completedProgress
      ?.map((p) => p.lesson?.documentId)
      .filter(Boolean) || [];

    return {
      data: {
        courseId,
        totalLessons,
        completedLessons: completedCount,
        percentage,
        completedLessonIds,
      },
    };
  },
}));
