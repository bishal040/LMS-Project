'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBookOpen, FiPlus, FiEdit3, FiTrash2, FiUsers,
  FiList, FiAward, FiEye, FiEyeOff, FiX, FiCheck, FiArrowRight
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { getCourses, createCourse, updateCourse, deleteCourse, createLesson, createQuiz } from '@/lib/api';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

/**
 * Instructor Dashboard
 * 
 * DATA FLOW:
 * 1. Fetches all courses from /api/courses (the backend auto-filters to show only this instructor's courses)
 * 2. Allows creating new courses via a modal form
 * 3. Allows toggling course status between draft/published
 * 4. Provides quick actions to add lessons and quizzes to each course
 */
export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(null); // courseId
  const [showQuizModal, setShowQuizModal] = useState(null); // courseId
  const [formData, setFormData] = useState({ title: '', description: '', category: '', coverImageUrl: '' });
  const [lessonData, setLessonData] = useState({ title: '', content: '', videoUrl: '', order: 0 });
  const [quizData, setQuizData] = useState({ title: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }] });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data?.data || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }
    setSubmitting(true);
    try {
      await createCourse({ ...formData, status: 'draft' });
      toast.success('Course created successfully!');
      setShowCreateModal(false);
      setFormData({ title: '', description: '', category: '', coverImageUrl: '' });
      fetchCourses();
    } catch (err) {
      toast.error(err.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (course) => {
    const attrs = course.attributes || course;
    const newStatus = attrs.status === 'published' ? 'draft' : 'published';
    try {
      await updateCourse(course.documentId || course.id, { status: newStatus });
      toast.success(`Course ${newStatus === 'published' ? 'published' : 'set to draft'}!`);
      fetchCourses();
    } catch (err) {
      toast.error('Failed to update course status');
    }
  };

  const handleDeleteCourse = async (course) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse(course.documentId || course.id);
      toast.success('Course deleted');
      fetchCourses();
    } catch (err) {
      toast.error('Failed to delete course');
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!lessonData.title) {
      toast.error('Lesson title is required');
      return;
    }
    setSubmitting(true);
    try {
      await createLesson({ ...lessonData, course: showLessonModal });
      toast.success('Lesson added!');
      setShowLessonModal(null);
      setLessonData({ title: '', content: '', videoUrl: '', order: 0 });
      fetchCourses();
    } catch (err) {
      toast.error(err.message || 'Failed to add lesson');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddQuiz = async (e) => {
    e.preventDefault();
    if (!quizData.title || quizData.questions.length === 0) {
      toast.error('Quiz title and at least one question are required');
      return;
    }
    setSubmitting(true);
    try {
      await createQuiz({ ...quizData, course: showQuizModal });
      toast.success('Quiz added!');
      setShowQuizModal(null);
      setQuizData({ title: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }] });
      fetchCourses();
    } catch (err) {
      toast.error(err.message || 'Failed to add quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }],
    });
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...quizData.questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuizData({ ...quizData, questions: updated });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...quizData.questions];
    const opts = [...updated[qIndex].options];
    opts[oIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options: opts };
    setQuizData({ ...quizData, questions: updated });
  };

  if (loading) return <LoadingSpinner label="Loading instructor dashboard..." />;

  return (
    <ProtectedRoute roles={['instructor', 'content_manager', 'admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <FiBookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Instructor Dashboard</h1>
              <p className="text-sm text-muted">Manage your courses, lessons, and quizzes.</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95"
          >
            <FiPlus /> New Course
          </button>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border border-border rounded-[2rem] p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><FiBookOpen className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest mb-1">My Courses</p>
              <p className="text-3xl font-black">{courses.length}</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface border border-border rounded-[2rem] p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-success/10 text-success flex items-center justify-center"><FiEye className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Published</p>
              <p className="text-3xl font-black">{courses.filter(c => (c.attributes || c).status === 'published').length}</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface border border-border rounded-[2rem] p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-warning/10 text-warning flex items-center justify-center"><FiEyeOff className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Drafts</p>
              <p className="text-3xl font-black">{courses.filter(c => (c.attributes || c).status === 'draft').length}</p>
            </div>
          </motion.div>
        </div>

        {/* Course List */}
        {courses.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border rounded-[2rem]">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4">
              <FiBookOpen className="w-6 h-6 text-muted" />
            </div>
            <h3 className="text-lg font-black mb-2">No courses yet</h3>
            <p className="text-muted mb-6">Create your first course to get started.</p>
            <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg transition-all active:scale-95">
              <FiPlus /> Create Course
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course, i) => {
              const attrs = course.attributes || course;
              const courseId = course.documentId || course.id;
              const lessonCount = attrs.lessons?.data?.length || attrs.lessons?.length || 0;
              const quizCount = attrs.quizzes?.data?.length || attrs.quizzes?.length || 0;

              return (
                <motion.div
                  key={courseId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-surface border border-border rounded-[2rem] p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                    {/* Cover Image */}
                    <img
                      src={attrs.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&q=80'}
                      alt={attrs.title}
                      className="w-full lg:w-28 h-20 object-cover rounded-xl flex-shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-black tracking-tight truncate">{attrs.title}</h3>
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full flex-shrink-0 ${
                          attrs.status === 'published' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}>
                          {attrs.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted line-clamp-1 mb-2">{attrs.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted">
                        <span className="flex items-center gap-1"><FiList className="w-3 h-3" /> {lessonCount} Lessons</span>
                        <span className="flex items-center gap-1"><FiAward className="w-3 h-3" /> {quizCount} Quizzes</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setShowLessonModal(courseId)}
                        className="p-3 bg-background border border-border rounded-xl hover:border-primary/30 hover:text-primary transition-all"
                        title="Add Lesson"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowQuizModal(courseId)}
                        className="p-3 bg-background border border-border rounded-xl hover:border-primary/30 hover:text-primary transition-all"
                        title="Add Quiz"
                      >
                        <FiAward className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(course)}
                        className="p-3 bg-background border border-border rounded-xl hover:border-success/30 hover:text-success transition-all"
                        title={attrs.status === 'published' ? 'Set to Draft' : 'Publish'}
                      >
                        {attrs.status === 'published' ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course)}
                        className="p-3 bg-background border border-border rounded-xl hover:border-error/30 hover:text-error transition-all"
                        title="Delete Course"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ===== CREATE COURSE MODAL ===== */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-surface border border-border rounded-[2rem] p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black tracking-tight">Create New Course</h2>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-background rounded-xl transition-colors"><FiX className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">Title</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Course title" className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Course description" rows={4} className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium resize-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">Category</label>
                    <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Web Development" className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">Cover Image URL</label>
                    <input type="text" value={formData.coverImageUrl} onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })} placeholder="https://example.com/image.jpg" className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium" />
                  </div>
                  <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]">
                    {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiCheck /> Create Course</>}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== ADD LESSON MODAL ===== */}
        <AnimatePresence>
          {showLessonModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowLessonModal(null)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-[2rem] p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black tracking-tight">Add Lesson</h2>
                  <button onClick={() => setShowLessonModal(null)} className="p-2 hover:bg-background rounded-xl transition-colors"><FiX className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleAddLesson} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">Lesson Title</label>
                    <input type="text" value={lessonData.title} onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })} placeholder="Lesson title" className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">Content</label>
                    <textarea value={lessonData.content} onChange={(e) => setLessonData({ ...lessonData, content: e.target.value })} placeholder="Lesson content (supports markdown)" rows={5} className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">Video URL (Optional)</label>
                    <input type="text" value={lessonData.videoUrl} onChange={(e) => setLessonData({ ...lessonData, videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">Order</label>
                    <input type="number" value={lessonData.order} onChange={(e) => setLessonData({ ...lessonData, order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium" />
                  </div>
                  <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]">
                    {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiCheck /> Add Lesson</>}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== ADD QUIZ MODAL ===== */}
        <AnimatePresence>
          {showQuizModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowQuizModal(null)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-[2rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black tracking-tight">Create Quiz</h2>
                  <button onClick={() => setShowQuizModal(null)} className="p-2 hover:bg-background rounded-xl transition-colors"><FiX className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleAddQuiz} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">Quiz Title</label>
                    <input type="text" value={quizData.title} onChange={(e) => setQuizData({ ...quizData, title: e.target.value })} placeholder="Quiz title" className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium" required />
                  </div>

                  {/* Questions */}
                  {quizData.questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-background border border-border rounded-2xl p-6 space-y-3">
                      <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Question {qIndex + 1}</p>
                      <input type="text" value={q.question} onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)} placeholder="Enter question" className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm" required />
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={q.correctAnswer === oIndex}
                            onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                            className="accent-primary w-4 h-4"
                          />
                          <input type="text" value={opt} onChange={(e) => updateOption(qIndex, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} className="flex-grow px-4 py-2.5 bg-surface border border-border rounded-xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm" required />
                        </div>
                      ))}
                      <p className="text-[10px] text-muted uppercase tracking-widest mt-1">Select the radio button next to the correct answer</p>
                    </div>
                  ))}

                  <button type="button" onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-border rounded-2xl text-sm font-bold text-muted hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                    <FiPlus /> Add Another Question
                  </button>

                  <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]">
                    {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiCheck /> Create Quiz</>}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
