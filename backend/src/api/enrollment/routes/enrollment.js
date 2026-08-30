'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/enrollments',
      handler: 'enrollment.find',
      config: { auth: false, policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/enrollments',
      handler: 'enrollment.create',
      config: { auth: false, policies: ['global::is-authenticated'] },
    },
    {
      method: 'GET',
      path: '/enrollments/me',
      handler: 'enrollment.me',
      config: { auth: false, policies: ['global::is-authenticated'] },
    },
    {
      method: 'GET',
      path: '/enrollments/check/:courseId',
      handler: 'enrollment.check',
      config: { auth: false, policies: ['global::is-authenticated'] },
    },
    {
      method: 'GET',
      path: '/enrollments/course-students/:courseId',
      handler: 'enrollment.courseStudents',
      config: { auth: false, policies: ['global::is-authenticated'] },
    },
  ],
};
