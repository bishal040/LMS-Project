'use strict';

/**
 * enrollment routes
 * 
 * Custom routes for student enrollment operations
 */
module.exports = {
  routes: [
    // Standard CRUD routes
    {
      method: 'GET',
      path: '/enrollments',
      handler: 'enrollment.find',
      config: {
        policies: [],
        auth: { scope: ['api::enrollment.enrollment.find'] },
      },
    },
    {
      method: 'POST',
      path: '/enrollments',
      handler: 'enrollment.create',
      config: {
        policies: [],
        auth: { scope: ['api::enrollment.enrollment.create'] },
      },
    },
    // Custom: Get current student's enrollments
    {
      method: 'GET',
      path: '/enrollments/me',
      handler: 'enrollment.me',
      config: {
        policies: [],
        auth: { scope: ['api::enrollment.enrollment.me'] },
      },
    },
    // Custom: Check enrollment for a course
    {
      method: 'GET',
      path: '/enrollments/check/:courseId',
      handler: 'enrollment.check',
      config: {
        policies: [],
        auth: { scope: ['api::enrollment.enrollment.check'] },
      },
    },
    // Custom: Get all enrolled students with progress for a course (instructor/content manager)
    {
      method: 'GET',
      path: '/enrollments/course-students/:courseId',
      handler: 'enrollment.courseStudents',
      config: {
        policies: [],
        auth: { scope: ['api::enrollment.enrollment.courseStudents'] },
      },
    },
  ],
};
