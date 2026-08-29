'use strict';

/**
 * quiz-attempt controller
 * 
 * AUTO-GRADING LOGIC:
 * ===================
 * When a student submits a quiz:
 * 
 * 1. Fetch the quiz from the database (which has the correct answers)
 * 2. For each question, compare the student's selected option index
 *    with the stored correctAnswer index
 * 3. Count how many are correct
 * 4. Score = number of correct answers
 * 5. Store the attempt with score, totalQuestions, and all answers
 * 6. Return the result immediately for instant feedback
 * 
 * Quiz questions format (stored in quiz.questions JSON field):
 * [
 *   {
 *     "question": "What is JavaScript?",
 *     "options": ["A language", "A framework", "A database", "A server"],
 *     "correctAnswer": 0   // index of the correct option
 *   }
 * ]
 * 
 * Student answers format (sent from frontend):
 * [
 *   { "questionIndex": 0, "selectedOption": 0 },
 *   { "questionIndex": 1, "selectedOption": 2 }
 * ]
 */
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::quiz-attempt.quiz-attempt', ({ strapi }) => ({
  // Submit quiz answers and auto-grade
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const { quiz: quizId, answers } = ctx.request.body.data || {};

    if (!quizId) return ctx.badRequest('Quiz ID is required');
    if (!answers || !Array.isArray(answers)) {
      return ctx.badRequest('Answers must be an array');
    }

    // Step 1: Fetch the quiz with correct answers
    const quiz = await strapi.documents('api::quiz.quiz').findOne({
      documentId: quizId,
    });

    if (!quiz) return ctx.notFound('Quiz not found');

    const questions = quiz.questions || [];
    const totalQuestions = questions.length;

    // Step 2: Grade each answer by comparing with correct answer
    let correctCount = 0;
    const gradedAnswers = answers.map((answer) => {
      const questionIndex = answer.questionIndex;
      const selectedOption = answer.selectedOption;
      const question = questions[questionIndex];

      if (!question) {
        return { ...answer, correct: false, correctAnswer: null };
      }

      // Compare student's selection with the correct answer index
      const isCorrect = selectedOption === question.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        questionIndex,
        selectedOption,
        correct: isCorrect,
        correctAnswer: question.correctAnswer,
      };
    });

    // Step 3: Calculate score
    // score = number of correct answers (out of totalQuestions)
    const score = correctCount;

    // Step 4: Store the attempt
    const attempt = await strapi.documents('api::quiz-attempt.quiz-attempt').create({
      data: {
        student: user.id,
        quiz: quizId,
        score,
        totalQuestions,
        answers: gradedAnswers,
        submittedAt: new Date().toISOString(),
      },
    });

    // Step 5: Return result immediately
    return {
      data: {
        ...attempt,
        score,
        totalQuestions,
        percentage: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0,
        gradedAnswers,
      },
    };
  },

  // Get current student's attempts for a specific quiz
  async me(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const quizId = ctx.query.quizId;

    const filters = { student: { id: user.id } };
    if (quizId) {
      filters.quiz = { documentId: quizId };
    }

    const attempts = await strapi.documents('api::quiz-attempt.quiz-attempt').findMany({
      filters,
      populate: ['quiz'],
      sort: { submittedAt: 'desc' },
    });

    return { data: attempts };
  },
}));
