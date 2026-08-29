'use strict';

/**
 * course controller
 * 
 * Permission Matrix enforcement:
 * - Admin + Content Manager: CRUD any course (see all including drafts)
 * - Instructor: CRUD own courses only (see own drafts + all published)
 * - Student/Public: Browse published courses only
 */
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::course.course', ({ strapi }) => ({
  // Override create to auto-assign instructor
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    // Set instructor to current user
    ctx.request.body.data = {
      ...ctx.request.body.data,
      instructor: user.id,
    };

    const response = await super.create(ctx);
    return response;
  },

  // Override find: role-based filtering
  async find(ctx) {
    const user = ctx.state.user;
    const role = user?.role?.type || '';

    if (['admin', 'content_manager'].includes(role)) {
      // Admin & CM see ALL courses (including drafts)
      // No filter applied
    } else if (role === 'instructor') {
      // Instructors see: all published courses + their own drafts
      ctx.query = {
        ...ctx.query,
        filters: {
          ...ctx.query.filters,
          $or: [
            { status: { $eq: 'published' } },
            { instructor: { id: user.id } },
          ],
        },
      };
    } else {
      // Students & Public: only published courses
      ctx.query = {
        ...ctx.query,
        filters: {
          ...ctx.query.filters,
          status: { $eq: 'published' },
        },
      };
    }

    const response = await super.find(ctx);
    return response;
  },

  // Override update to check ownership for instructors
  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.type || '';

    // Instructors can only update their own courses
    if (role === 'instructor') {
      const course = await strapi.documents('api::course.course').findOne({
        documentId: ctx.params.id,
        populate: ['instructor'],
      });

      if (!course || course.instructor?.id !== user.id) {
        return ctx.forbidden('You can only edit your own courses');
      }
    }

    const response = await super.update(ctx);
    return response;
  },

  // Override delete to check ownership for instructors
  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.type || '';

    if (role === 'instructor') {
      const course = await strapi.documents('api::course.course').findOne({
        documentId: ctx.params.id,
        populate: ['instructor'],
      });

      if (!course || course.instructor?.id !== user.id) {
        return ctx.forbidden('You can only delete your own courses');
      }
    }

    const response = await super.delete(ctx);
    return response;
  },
}));
