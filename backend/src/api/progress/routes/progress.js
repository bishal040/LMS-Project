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
      config: {
        policies: [],
        auth: { scope: ['api::progress.progress.create'] },
      },
    },
    {
      method: 'GET',
      path: '/progresses/course/:courseId',
      handler: 'progress.courseProgress',
      config: {
        policies: [],
        auth: { scope: ['api::progress.progress.courseProgress'] },
      },
    },
  ],
};
