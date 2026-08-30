'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/progresses',
      handler: 'progress.create',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/progresses/course/:courseId',
      handler: 'progress.courseProgress',
      config: { auth: false },
    },
  ],
};
