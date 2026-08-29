'use strict';

/**
 * blog-post controller
 * 
 * Custom logic:
 * - Auto-assign author on create
 * - Filter non-published posts for students/guests
 */
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  // Override create to auto-assign author
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    // Content managers or admins only
    const role = user.role?.type || '';
    if (!['admin', 'content_manager'].includes(role)) {
      return ctx.forbidden('You do not have permission to create blog posts');
    }

    ctx.request.body.data = {
      ...ctx.request.body.data,
      author: user.id,
      publishedAt: ctx.request.body.data?.status === 'published' ? new Date().toISOString() : null,
    };

    const response = await super.create(ctx);
    return response;
  },

  // Override update to handle publishedAt timestamp
  async update(ctx) {
    const data = ctx.request.body.data || {};
    
    if (data.status === 'published') {
      const existing = await strapi.documents('api::blog-post.blog-post').findOne({
        documentId: ctx.params.id,
      });
      if (existing && existing.status !== 'published') {
        data.publishedAt = new Date().toISOString();
      }
    }

    const response = await super.update(ctx);
    return response;
  },

  // Override find to only show published posts to non-staff
  async find(ctx) {
    const user = ctx.state.user;
    const role = user?.role?.type || '';

    // If not admin or content_manager, only show published
    if (!['admin', 'content_manager'].includes(role)) {
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
}));
