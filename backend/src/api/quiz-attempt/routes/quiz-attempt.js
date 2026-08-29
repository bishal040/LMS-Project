'use strict';

/**
 * quiz-attempt routes
 */
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/quiz-attempts',
      handler: 'quiz-attempt.create',
      config: { policies: [] },
    },
    {
      method: 'GET',
      path: '/quiz-attempts/me',
      handler: 'quiz-attempt.me',
      config: { policies: [] },
    },
  ],
};
