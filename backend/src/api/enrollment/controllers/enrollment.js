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
}));
