'use strict';

/**
 * Custom authentication policy.
 * 
 * Manually verifies the JWT token and populates ctx.state.user,
 * bypassing Strapi's built-in permission system which fails on custom routes.
 */
module.exports = async (policyContext, config, { strapi }) => {
  try {
    const authHeader = policyContext.request.header.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT using Strapi's own JWT service
    const decoded = await strapi
      .plugin('users-permissions')
      .service('jwt')
      .verify(token);

    if (!decoded || !decoded.id) {
      return false;
    }

    // Fetch the full user with role
    const user = await strapi
      .query('plugin::users-permissions.user')
      .findOne({
        where: { id: decoded.id },
        populate: ['role'],
      });

    if (!user) {
      return false;
    }

    // Set user on context so controllers can access it
    policyContext.state.user = user;
    return true;
  } catch (err) {
    strapi.log.error('Auth policy error:', err.message);
    return false;
  }
};
