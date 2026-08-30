'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/quiz-attempts',
      handler: 'quiz-attempt.create',
      config: { auth: false, policies: ['global::is-authenticated'] },
    },
    {
      method: 'GET',
      path: '/quiz-attempts/me',
      handler: 'quiz-attempt.me',
      config: { auth: false, policies: ['global::is-authenticated'] },
    },
  ],
};
