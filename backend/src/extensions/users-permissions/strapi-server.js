'use strict';

module.exports = (plugin) => {
  const originalMe = plugin.controllers.user.me;

  plugin.controllers.user.me = async (ctx) => {
    // Run the original controller logic
    await originalMe(ctx);

    // If a user was successfully returned, fetch and attach their role
    if (ctx.body && ctx.body.id) {
      /** @type {any} */
      const userWithRole = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        ctx.body.id,
        { populate: ['role'] }
      );
      
      if (userWithRole && userWithRole.role) {
        ctx.body.role = userWithRole.role;
      }
    }
  };

  return plugin;
};
