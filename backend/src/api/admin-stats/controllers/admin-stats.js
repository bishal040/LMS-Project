'use strict';

module.exports = {
  async getStats(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.type || '';
    if (role !== 'admin') {
      return ctx.forbidden('Only admins can access platform stats');
    }

    try {
      // Get total users
      const usersCount = await strapi.db.query('plugin::users-permissions.user').count();
      
      // Get total courses
      const coursesCount = await strapi.db.query('api::course.course').count();
      
      // Get total enrollments
      const enrollmentsCount = await strapi.db.query('api::enrollment.enrollment').count();
      
      // Get total blog posts
      const blogsCount = await strapi.db.query('api::blog-post.blog-post').count();

      // Recent enrollments for activity feed
      const recentEnrollments = await strapi.documents('api::enrollment.enrollment').findMany({
        sort: { enrolledAt: 'desc' },
        limit: 5,
        populate: ['student', 'course'],
      });

      return {
        data: {
          usersCount,
          coursesCount,
          enrollmentsCount,
          blogsCount,
          recentEnrollments,
        },
      };
    } catch (err) {
      ctx.throw(500, err);
    }
  },
};
