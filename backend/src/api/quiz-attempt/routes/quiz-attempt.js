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
      config: {
        policies: [],
        auth: { scope: ['api::quiz-attempt.quiz-attempt.create'] },
      },
    },
    {
      method: 'GET',
      path: '/quiz-attempts/me',
      handler: 'quiz-attempt.me',
      config: {
        policies: [],
        auth: { scope: ['api::quiz-attempt.quiz-attempt.me'] },
      },
    },
  ],
};
