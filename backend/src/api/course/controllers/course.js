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

    // Set instructor to current user. Strapi 5 uses documentId for relations.
    const requestData = ctx.request.body?.data || {};
    ctx.request.body.data = {
      ...requestData,
      instructor: user.documentId,
    };

    return await super.create(ctx);
  },

  // Helper to accurately fetch role
  async getRole(user) {
    if (!user) return '';
    if (user.role && (user.role.type || user.role.name)) {
      return (user.role.type || user.role.name).toLowerCase();
    }
    if (user.documentId) {
      const fullUser = await strapi.documents('plugin::users-permissions.user').findOne({
        documentId: user.documentId,
        populate: ['role'],
      });
      return (fullUser?.role?.type || fullUser?.role?.name || '').toLowerCase();
    }
    return '';
  },

  // Override find: role-based filtering
  async find(ctx) {
    const user = ctx.state.user;
    const role = await this.getRole(user);

    const existingFilters = (typeof ctx.query.filters === 'object' && !Array.isArray(ctx.query.filters)) 
      ? ctx.query.filters 
      : {};

    if (['admin', 'content_manager', 'content manager'].includes(role)) {
      // Admin & CM see ALL courses (including drafts)
      ctx.query.filters = existingFilters;
    } else if (role === 'instructor') {
      // Instructors see: all published courses + their own drafts
      ctx.query.filters = {
        ...existingFilters,
        $or: [
          { status: { $eq: 'published' } },
          { instructor: { documentId: { $eq: user.documentId } } },
        ],
      };
    } else {
      // Students & Public: only published courses
      ctx.query.filters = {
        ...existingFilters,
        status: { $eq: 'published' },
      };
    }

    return await super.find(ctx);
  },

  // Override update to check ownership for instructors
  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = await this.getRole(user);

    // Instructors can only update their own courses
    if (role === 'instructor') {
      const course = await strapi.documents('api::course.course').findOne({
        documentId: ctx.params.id,
        populate: ['instructor'],
      });

      if (!course || course.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only edit your own courses');
      }
    }

    return await super.update(ctx);
  },

  // Override delete to check ownership for instructors
  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = await this.getRole(user);

    if (role === 'instructor') {
      const course = await strapi.documents('api::course.course').findOne({
        documentId: ctx.params.id,
        populate: ['instructor'],
      });

      if (!course || course.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only delete your own courses');
      }
    }

    return await super.delete(ctx);
  }
}));
