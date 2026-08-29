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
      config: { policies: [] },
    },
    {
      method: 'POST',
      path: '/enrollments',
      handler: 'enrollment.create',
      config: { policies: [] },
    },
    // Custom: Get current student's enrollments
    {
      method: 'GET',
      path: '/enrollments/me',
      handler: 'enrollment.me',
      config: { policies: [] },
    },
    // Custom: Check enrollment for a course
    {
      method: 'GET',
      path: '/enrollments/check/:courseId',
      handler: 'enrollment.check',
      config: { policies: [] },
    },
  ],
};
