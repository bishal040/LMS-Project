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
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('You must be logged in');

      // Content managers or admins only
      const role = user.role?.type || '';
      if (!['admin', 'content_manager'].includes(role)) {
        return ctx.forbidden('You do not have permission to create blog posts');
      }

      const inputData = ctx.request.body.data || {};

      // Create directly via document service to avoid REST API body format issues
      const entry = await strapi.documents('api::blog-post.blog-post').create({
        data: {
          title: inputData.title,
          body: inputData.body,
          coverImageUrl: inputData.coverImageUrl || '',
          status: inputData.status || 'draft',
          author: user.documentId,
          publishedAt: inputData.status === 'published' ? new Date().toISOString() : null,
        },
        populate: ['author'],
      });

      const sanitizedEntity = await this.sanitizeOutput(entry, ctx);
      return this.transformResponse(sanitizedEntity);
    } catch (err) {
      strapi.log.error('Blog create error:', err);
      return ctx.badRequest(err.message || 'Failed to create blog post');
    }
  },

  // Override update to handle publishedAt timestamp
  async update(ctx) {
    try {
      const inputData = ctx.request.body.data || {};

      // Check current status to set publishedAt
      if (inputData.status === 'published') {
        const existing = await strapi.documents('api::blog-post.blog-post').findOne({
          documentId: ctx.params.id,
        });
        if (existing && existing.status !== 'published') {
          inputData.publishedAt = new Date().toISOString();
        }
      }

      const entry = await strapi.documents('api::blog-post.blog-post').update({
        documentId: ctx.params.id,
        data: inputData,
        populate: ['author'],
      });

      const sanitizedEntity = await this.sanitizeOutput(entry, ctx);
      return this.transformResponse(sanitizedEntity);
    } catch (err) {
      strapi.log.error('Blog update error:', err);
      return ctx.badRequest(err.message || 'Failed to update blog post');
    }
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
