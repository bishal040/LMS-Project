'use strict';

/**
 * quiz controller
 * 
 * Enforces Permission Matrix:
 * - Admin + Content Manager: Can CRUD any quiz
 * - Instructor: Can only CRUD quizzes belonging to their own courses
 */
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::quiz.quiz', ({ strapi }) => ({
  // Helper to check if user owns the course
  async verifyCourseOwnership(user, courseId) {
    if (!user) return false;
    const role = user.role?.type || '';
    if (['admin', 'content_manager'].includes(role)) return true; // Bypass for admins/CMs
    if (role !== 'instructor') return false;

    if (!courseId) return false;

    const course = await strapi.documents('api::course.course').findOne({
      documentId: courseId,
      populate: ['instructor'],
    });

    return course?.instructor?.id === user.id;
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const courseId = ctx.request.body.data?.course;
    
    // Check ownership
    const isOwner = await this.verifyCourseOwnership(user, courseId);
    if (!isOwner) {
      return ctx.forbidden('You can only add quizzes to your own courses');
    }

    return super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    // Find the quiz to get its course
    const quiz = await strapi.documents('api::quiz.quiz').findOne({
      documentId: ctx.params.id,
      populate: ['course'],
    });

    if (!quiz) return ctx.notFound();

    // Check ownership
    const courseId = quiz.course?.documentId;
    const isOwner = await this.verifyCourseOwnership(user, courseId);
    if (!isOwner) {
      return ctx.forbidden('You can only edit quizzes in your own courses');
    }

    // If they are trying to move the quiz to a different course, check that too
    const newCourseId = ctx.request.body.data?.course;
    if (newCourseId && newCourseId !== courseId) {
      const isNewCourseOwner = await this.verifyCourseOwnership(user, newCourseId);
      if (!isNewCourseOwner) {
        return ctx.forbidden('You cannot move a quiz to a course you do not own');
      }
    }

    return super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const quiz = await strapi.documents('api::quiz.quiz').findOne({
      documentId: ctx.params.id,
      populate: ['course'],
    });

    if (!quiz) return ctx.notFound();

    const isOwner = await this.verifyCourseOwnership(user, quiz.course?.documentId);
    if (!isOwner) {
      return ctx.forbidden('You can only delete quizzes from your own courses');
    }

    return super.delete(ctx);
  }
}));
