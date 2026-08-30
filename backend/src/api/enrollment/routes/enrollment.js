'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/enrollments',
      handler: 'enrollment.find',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/enrollments',
      handler: 'enrollment.create',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/enrollments/me',
      handler: 'enrollment.me',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/enrollments/check/:courseId',
      handler: 'enrollment.check',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/enrollments/course-students/:courseId',
      handler: 'enrollment.courseStudents',
      config: { auth: false },
    },
  ],
};
