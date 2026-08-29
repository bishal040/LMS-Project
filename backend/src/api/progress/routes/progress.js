'use strict';

/**
 * progress routes
 */
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/progresses',
      handler: 'progress.create',
      config: { policies: [] },
    },
    {
      method: 'GET',
      path: '/progresses/course/:courseId',
      handler: 'progress.courseProgress',
      config: { policies: [] },
    },
  ],
};
