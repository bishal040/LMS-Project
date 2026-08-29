'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiAward, FiCheckCircle, FiXCircle, FiArrowRight,
  FiArrowLeft, FiClock, FiTarget, FiRefreshCw
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { getQuiz, submitQuiz, getMyQuizAttempts } from '@/lib/api';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

/**
 * Quiz Taking Interface
 * 
 * AUTO-GRADING DATA FLOW:
 * ========================
 * 1. Fetch quiz data from /api/quizzes/:id (includes questions JSON)
 * 2. Render one question at a time with animated transitions
 * 3. Student selects an option (radio button) for each question
 * 4. On submit, send all answers to POST /api/quiz-attempts
 * 5. Backend controller auto-grades by comparing each selectedOption
 *    against the stored correctAnswer index in the quiz questions array
 * 6. Backend returns: { score, totalQuestions, percentage, gradedAnswers }
 * 7. Frontend renders a results screen with score, percentage, and
 *    per-question breakdown showing which were correct/incorrect
 * 
 * Quiz questions format (from Strapi):
 * [
 *   {
 *     "question": "What is JavaScript?",
 *     "options": ["A language", "A framework", "A database", "A server"],
 *     "correctAnswer": 0   // index of correct option
 *   }
 * ]
 */
export default function QuizPage() {
  const { id: courseId, quizId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [previousAttempts, setPreviousAttempts] = useState([]);

  useEffect(() => {
    if (quizId) fetchQuizData();
  }, [quizId]);

  const fetchQuizData = async () => {
    try {
      const data = await getQuiz(quizId);
      setQuiz(data?.data || data);

      // Fetch previous attempts
      try {
        const attemptsRes = await getMyQuizAttempts(quizId);
        setPreviousAttempts(attemptsRes?.data || []);
      } catch {
        setPreviousAttempts([]);
      }
    } catch (err) {
      console.error('Failed to fetch quiz:', err);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIndex, optionIndex) => {
    setAnswers({ ...answers, [questionIndex]: optionIndex });
  };

  const handleSubmitQuiz = async () => {
    const questions = quiz?.attributes?.questions || quiz?.questions || [];

    // Check all questions are answered
    if (Object.keys(answers).length < questions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      // Format answers for the backend:
      // [{ questionIndex: 0, selectedOption: 2 }, ...]
      const formattedAnswers = Object.entries(answers).map(([qIndex, optIndex]) => ({
        questionIndex: parseInt(qIndex),
        selectedOption: optIndex,
      }));

      const res = await submitQuiz(quizId, formattedAnswers);
      setResult(res?.data || res);
      toast.success('Quiz submitted! Check your results.');
    } catch (err) {
      toast.error(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setResult(null);
  };

  if (loading) return <LoadingSpinner label="Loading quiz..." />;

  if (!quiz) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-black mb-2">Quiz Not Found</h2>
        <p className="text-muted">This quiz doesn&apos;t exist or has been removed.</p>
      </div>
    );
  }

  const attrs = quiz.attributes || quiz;
  const quizTitle = attrs.title || 'Untitled Quiz';
  const questions = attrs.questions || [];
  const totalQuestions = questions.length;

  // ===== RESULTS SCREEN =====
  if (result) {
    const score = result.score || 0;
    const total = result.totalQuestions || totalQuestions;
    const percentage = result.percentage || (total > 0 ? Math.round((score / total) * 100) : 0);
    const gradedAnswers = result.gradedAnswers || [];
    const passed = percentage >= 70;

    return (
      <ProtectedRoute roles={['authenticated', 'student']}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-12"
          >
            {/* Score Circle */}
            <div className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center border-4 ${
              passed ? 'border-success bg-success/10' : 'border-error bg-error/10'
            }`}>
              <div>
                <p className={`text-4xl font-black ${passed ? 'text-success' : 'text-error'}`}>{percentage}%</p>
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              {passed ? '🎉 Great Job!' : '📚 Keep Practicing!'}
            </h1>
            <p className="text-muted text-lg">
              You scored <span className="font-black text-foreground">{score}</span> out of{' '}
              <span className="font-black text-foreground">{total}</span> questions
            </p>
          </motion.div>

          {/* Per-Question Breakdown */}
          <div className="space-y-4 mb-10">
            <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
              <FiTarget className="text-primary" /> Detailed Results
            </h2>
            {questions.map((q, i) => {
              const graded = gradedAnswers[i] || {};
              const isCorrect = graded.correct;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-surface border rounded-[2rem] p-6 ${
                    isCorrect ? 'border-success/30' : 'border-error/30'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isCorrect ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                    }`}>
                      {isCorrect ? <FiCheckCircle className="w-4 h-4" /> : <FiXCircle className="w-4 h-4" />}
                    </div>
                    <p className="font-bold text-sm">Q{i + 1}: {q.question}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-11">
                    {q.options.map((opt, oIndex) => {
                      const isSelected = graded.selectedOption === oIndex;
                      const isCorrectOption = q.correctAnswer === oIndex;

                      let optStyle = 'bg-background border-border/50 text-muted';
                      if (isCorrectOption) optStyle = 'bg-success/10 border-success/30 text-success font-bold';
                      if (isSelected && !isCorrect) optStyle = 'bg-error/10 border-error/30 text-error font-bold';

                      return (
                        <div key={oIndex} className={`px-4 py-2.5 rounded-xl border text-sm ${optStyle}`}>
                          {opt}
                          {isCorrectOption && <span className="ml-2 text-[10px]">✓ Correct</span>}
                          {isSelected && !isCorrectOption && <span className="ml-2 text-[10px]">✗ Your answer</span>}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleRetake}
              className="flex-1 py-4 bg-surface border border-border text-foreground text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-surface-hover transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <FiRefreshCw /> Retake Quiz
            </button>
            <button
              onClick={() => router.push(`/courses/${courseId}`)}
              className="flex-1 py-4 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Back to Course <FiArrowRight />
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // ===== QUIZ TAKING SCREEN =====
  const currentQ = questions[currentQuestion];
  const progress = totalQuestions > 0 ? Math.round(((currentQuestion + 1) / totalQuestions) * 100) : 0;

  return (
    <ProtectedRoute roles={['authenticated', 'student']}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quiz Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <FiAward className="text-primary" /> {quizTitle}
            </h1>
            <span className="text-sm font-bold text-muted flex items-center gap-1">
              <FiClock className="w-4 h-4" /> {currentQuestion + 1} / {totalQuestions}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-border/50">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Question Card */}
        {currentQ && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-surface border border-border rounded-[2rem] p-8 mb-8"
            >
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-4">
                Question {currentQuestion + 1}
              </p>
              <h2 className="text-xl font-black tracking-tight mb-8 leading-relaxed">
                {currentQ.question}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option, oIndex) => {
                  const isSelected = answers[currentQuestion] === oIndex;
                  return (
                    <motion.button
                      key={oIndex}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectOption(currentQuestion, oIndex)}
                      className={`w-full text-left px-6 py-4 rounded-2xl border-2 transition-all duration-300 text-sm font-medium ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-md shadow-primary/10'
                          : 'border-border bg-background hover:border-primary/30 text-foreground'
                      }`}
                    >
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg mr-3 text-xs font-black ${
                        isSelected ? 'bg-primary text-white' : 'bg-surface border border-border text-muted'
                      }`}>
                        {String.fromCharCode(65 + oIndex)}
                      </span>
                      {option}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-6 py-3 bg-surface border border-border text-foreground text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-surface-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
          >
            <FiArrowLeft /> Previous
          </button>

          {currentQuestion === totalQuestions - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting || Object.keys(answers).length < totalQuestions}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50 active:scale-95"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Submit Quiz <FiCheckCircle /></>
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(totalQuestions - 1, currentQuestion + 1))}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95"
            >
              Next <FiArrowRight />
            </button>
          )}
        </div>

        {/* Question Indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQuestion(i)}
              className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                i === currentQuestion
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : answers[i] !== undefined
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'bg-background border border-border text-muted hover:border-primary/30'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Previous Attempts */}
        {previousAttempts.length > 0 && (
          <div className="mt-10 bg-surface border border-border rounded-[2rem] p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted mb-4">Previous Attempts</h3>
            <div className="space-y-2">
              {previousAttempts.map((attempt, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border/50">
                  <span className="text-sm font-bold">Attempt {previousAttempts.length - i}</span>
                  <span className="text-sm font-black text-primary">
                    {attempt.score}/{attempt.totalQuestions} ({attempt.totalQuestions > 0 ? Math.round((attempt.score / attempt.totalQuestions) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
