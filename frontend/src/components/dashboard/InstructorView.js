'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBookOpen, FiPlus, FiEdit3, FiTrash2, FiUsers,
  FiList, FiAward, FiEye, FiEyeOff, FiX, FiCheck, FiArrowRight,
  FiBarChart2, FiMail, FiCalendar, FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { getCourses, createCourse, updateCourse, deleteCourse, createLesson, createQuiz, updateLesson, updateQuiz, getCourseStudents } from '@/lib/api';
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
export default function InstructorView() {
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
  const [editingCourseId, setEditingCourseId] = useState(null);

  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editingQuizId, setEditingQuizId] = useState(null);

  // Student progress tracking
  const [showStudentsModal, setShowStudentsModal] = useState(null); // courseId
  const [studentsData, setStudentsData] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      let filters = '';
      if (!isContentManager && userRole === 'instructor') {
        filters = `filters[instructor][documentId][$eq]=${user.documentId || user.id}`;
      }
      const data = await getCourses(filters);
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
      if (editingCourseId) {
        await updateCourse(editingCourseId, formData);
        toast.success('Course updated successfully!');
      } else {
        await createCourse({ ...formData, status: 'draft' });
        toast.success('Course created successfully!');
      }
      setShowCreateModal(false);
      setEditingCourseId(null);
      setFormData({ title: '', description: '', category: '', coverImageUrl: '' });
      fetchCourses();
    } catch (err) {
      toast.error(err.message || 'Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCourseSetup = (course) => {
    const attrs = course.attributes || course;
    setEditingCourseId(course.documentId || course.id);
    setFormData({
      title: attrs.title || '',
      description: attrs.description || '',
      category: attrs.category || '',
      coverImageUrl: attrs.coverImageUrl || '',
    });
    setShowCreateModal(true);
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
      if (editingLessonId) {
        await updateLesson(editingLessonId, lessonData);
        toast.success('Lesson updated!');
      } else {
        await createLesson({ ...lessonData, course: showLessonModal });
        toast.success('Lesson added!');
      }
      setShowLessonModal(null);
      setEditingLessonId(null);
      setLessonData({ title: '', content: '', videoUrl: '', order: 0 });
      fetchCourses();
    } catch (err) {
      toast.error(err.message || 'Failed to save lesson');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditLessonSetup = (lesson) => {
    const attrs = lesson.attributes || lesson;
    setEditingLessonId(lesson.documentId || lesson.id);
    setLessonData({
      title: attrs.title || '',
      content: attrs.content || '',
      videoUrl: attrs.videoUrl || '',
      order: attrs.order || 0,
    });
  };

  const handleClearLesson = () => {
    setEditingLessonId(null);
    setLessonData({ title: '', content: '', videoUrl: '', order: 0 });
  };

  const handleAddQuiz = async (e) => {
    e.preventDefault();
    if (!quizData.title || quizData.questions.length === 0) {
      toast.error('Quiz title and at least one question are required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingQuizId) {
        await updateQuiz(editingQuizId, quizData);
        toast.success('Quiz updated!');
      } else {
        await createQuiz({ ...quizData, course: showQuizModal });
        toast.success('Quiz added!');
      }
      setShowQuizModal(null);
      setEditingQuizId(null);
      setQuizData({ title: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }] });
      fetchCourses();
    } catch (err) {
      toast.error(err.message || 'Failed to save quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditQuizSetup = (quiz) => {
    const attrs = quiz.attributes || quiz;
    setEditingQuizId(quiz.documentId || quiz.id);
    setQuizData({
      title: attrs.title || '',
      questions: attrs.questions || [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
  };

  const handleClearQuiz = () => {
    setEditingQuizId(null);
    setQuizData({ title: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }] });
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

  const handleViewStudents = async (courseId) => {
    setShowStudentsModal(courseId);
    setSelectedStudent(null);
    setLoadingStudents(true);
    try {
      const res = await getCourseStudents(courseId);
      setStudentsData(res.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      toast.error('Failed to load student data');
    } finally {
      setLoadingStudents(false);
    }
  };

  const getProgressColor = (pct) => {
    if (pct >= 80) return 'bg-success';
    if (pct >= 50) return 'bg-primary';
    if (pct >= 25) return 'bg-warning';
    return 'bg-error';
  };

  const getProgressBgColor = (pct) => {
    if (pct >= 80) return 'bg-success/10';
    if (pct >= 50) return 'bg-primary/10';
    if (pct >= 25) return 'bg-warning/10';
    return 'bg-error/10';
  };

  // Determine if user is content_manager (sees more details) vs instructor
  const userRole = user?.role?.type || '';
  const isContentManager = userRole === 'content_manager' || userRole === 'admin';

  if (loading) return <LoadingSpinner label="Loading course management..." />;

  return (
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
              <h1 className="text-3xl font-black tracking-tight">Course Management</h1>
              <p className="text-sm text-muted">Manage courses, lessons, and quizzes.</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingCourseId(null);
              setFormData({ title: '', description: '', category: '', coverImageUrl: '' });
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 hover:-translate-y-1 transition-all shadow-lg shadow-primary/25"
          >
            <FiPlus /> New Course
          </button>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border border-border rounded-[2rem] p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><FiBookOpen className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Total Courses</p>
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
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <button
                        onClick={() => handleViewStudents(courseId)}
                        className="p-3 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 text-primary transition-all"
                        title="View Students"
                      >
                        <FiBarChart2 className="w-4 h-4" />
                      </button>
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
                        onClick={() => handleEditCourseSetup(course)}
                        className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 transition-colors"
                        title="Edit Course"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course)}
                        className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-muted hover:text-error hover:border-error/30 transition-colors"
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
              onClick={() => { setShowCreateModal(false); setEditingCourseId(null); }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-surface border border-border rounded-[2rem] p-5 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl font-black tracking-tight">{editingCourseId ? 'Edit Course' : 'Create New Course'}</h2>
                  <button onClick={() => { setShowCreateModal(false); setEditingCourseId(null); }} className="p-2 hover:bg-background rounded-xl transition-colors"><FiX className="w-5 h-5" /></button>
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
                    {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiCheck /> {editingCourseId ? 'Save Changes' : 'Create Course'}</>}
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
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-[2rem] p-5 sm:p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">Add Lesson</h2>
                  <button onClick={() => setShowLessonModal(null)} className="p-2 hover:bg-background rounded-xl transition-colors"><FiX className="w-5 h-5" /></button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Context Section for Existing Lessons */}
                  {(() => {
                    const course = courses.find(c => (c.documentId || c.id) === showLessonModal);
                    const attrs = course?.attributes || course;
                    const existingLessons = attrs?.lessons?.data || attrs?.lessons || [];
                    return (
                      <div className="bg-background/50 border border-border rounded-2xl p-4 sm:p-6 flex flex-col max-h-64 lg:max-h-[65vh]">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted mb-4 flex items-center gap-2"><FiList className="w-4 h-4" /> Existing Lessons</h3>
                        {existingLessons.length > 0 ? (
                          <div className="space-y-3 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                            {existingLessons.sort((a, b) => ((a.attributes || a).order || 0) - ((b.attributes || b).order || 0)).map((l, idx) => (
                              <div
                                key={l.id || idx}
                                onClick={() => handleEditLessonSetup(l)}
                                className={`p-3 border rounded-xl text-sm font-medium text-foreground flex items-start gap-3 cursor-pointer transition-all ${
                                  editingLessonId === (l.documentId || l.id) ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'bg-surface border-border hover:border-primary/50'
                                }`}
                              >
                                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black flex-shrink-0">{(l.attributes || l).order || idx + 1}</span>
                                <div>
                                  <p className="font-bold tracking-tight truncate">{(l.attributes || l).title}</p>
                                  {((l.attributes || l).content) && <p className="text-xs text-muted mt-1 line-clamp-1">{((l.attributes || l).content)}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted border-2 border-dashed border-border rounded-xl">
                            <FiBookOpen className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm font-bold">No lessons yet.</p>
                            <p className="text-xs mt-1">This will be the first lesson for this course.</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Form Section */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-muted flex items-center gap-2">
                        {editingLessonId ? <FiEdit3 className="w-4 h-4 text-primary" /> : <FiPlus className="w-4 h-4 text-success" />}
                        {editingLessonId ? 'Edit Lesson Details' : 'New Lesson Details'}
                      </h3>
                      {editingLessonId && (
                        <button onClick={handleClearLesson} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                          + Add New Instead
                        </button>
                      )}
                    </div>
                    <form onSubmit={handleAddLesson} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">Lesson Title</label>
                        <input type="text" value={lessonData.title} onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })} placeholder="Lesson title" className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">Content</label>
                        <textarea value={lessonData.content} onChange={(e) => setLessonData({ ...lessonData, content: e.target.value })} placeholder="Lesson content (supports markdown)" rows={6} className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium resize-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">Video URL (Optional)</label>
                        <input type="text" value={lessonData.videoUrl} onChange={(e) => setLessonData({ ...lessonData, videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">Order</label>
                        <input type="number" value={lessonData.order} onChange={(e) => setLessonData({ ...lessonData, order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium" />
                      </div>
                      <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] mt-2">
                        {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiCheck /> {editingLessonId ? 'Update Lesson' : 'Save Lesson'}</>}
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== ADD QUIZ MODAL ===== */}
        <AnimatePresence>
          {showQuizModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowQuizModal(null)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-[2rem] p-5 sm:p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">Create Quiz</h2>
                  <button onClick={() => setShowQuizModal(null)} className="p-2 hover:bg-background rounded-xl transition-colors"><FiX className="w-5 h-5" /></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Context Section for Existing Quizzes */}
                  {(() => {
                    const course = courses.find(c => (c.documentId || c.id) === showQuizModal);
                    const attrs = course?.attributes || course;
                    const existingQuizzes = attrs?.quizzes?.data || attrs?.quizzes || [];
                    return (
                      <div className="bg-background/50 border border-border rounded-2xl p-4 sm:p-6 flex flex-col max-h-64 lg:max-h-[65vh]">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted mb-4 flex items-center gap-2"><FiAward className="w-4 h-4" /> Existing Quizzes in this Course</h3>
                        {existingQuizzes.length > 0 ? (
                          <div className="space-y-3 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                            {existingQuizzes.map((q, idx) => {
                              const questions = (q.attributes || q).questions || [];
                              return (
                                <div
                                  key={q.id || idx}
                                  onClick={() => handleEditQuizSetup(q)}
                                  className={`p-4 border rounded-xl text-sm font-medium text-foreground cursor-pointer transition-all ${
                                    editingQuizId === (q.documentId || q.id) ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'bg-surface border-border hover:border-primary/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black flex-shrink-0">{idx + 1}</span>
                                    <p className="font-bold tracking-tight truncate">{(q.attributes || q).title}</p>
                                  </div>
                                  {questions.length > 0 && (
                                    <p className="text-xs text-muted pl-10">{questions.length} Question{questions.length !== 1 ? 's' : ''} in this quiz</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted border-2 border-dashed border-border rounded-xl">
                            <FiAward className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm font-bold">No quizzes yet.</p>
                            <p className="text-xs mt-1">Add the first quiz for this course.</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Form Section */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-muted flex items-center gap-2">
                        {editingQuizId ? <FiEdit3 className="w-4 h-4 text-primary" /> : <FiPlus className="w-4 h-4 text-success" />}
                        {editingQuizId ? 'Edit Quiz Details' : 'New Quiz Details'}
                      </h3>
                      {editingQuizId && (
                        <button onClick={handleClearQuiz} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                          + Add New Instead
                        </button>
                      )}
                    </div>
                    <form onSubmit={handleAddQuiz} className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">Quiz Title</label>
                        <input type="text" value={quizData.title} onChange={(e) => setQuizData({ ...quizData, title: e.target.value })} placeholder="Quiz title" className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium" required />
                      </div>

                      {/* Questions */}
                      <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        {quizData.questions.map((q, qIndex) => (
                          <div key={qIndex} className="bg-background border border-border rounded-2xl p-5 space-y-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-black uppercase tracking-widest text-primary">Question {qIndex + 1}</p>
                            </div>
                            <input type="text" value={q.question} onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)} placeholder="Enter question" className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm" required />
                            <div className="space-y-2 mt-2">
                              {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct-${qIndex}`}
                                    checked={q.correctAnswer === oIndex}
                                    onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                    className="accent-primary w-4 h-4"
                                  />
                                  <input type="text" value={opt} onChange={(e) => updateOption(qIndex, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} className="flex-grow px-3 py-2 bg-surface border border-border rounded-lg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm" required />
                                </div>
                              ))}
                            </div>
                            <p className="text-[10px] text-muted uppercase tracking-widest mt-2">Select the radio button next to the correct answer</p>
                          </div>
                        ))}
                      </div>

                      <button type="button" onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-border rounded-2xl text-sm font-bold text-muted hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                        <FiPlus /> Add Another Question
                      </button>

                      <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]">
                        {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiCheck /> {editingQuizId ? 'Update Quiz' : 'Create Quiz'}</>}
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== STUDENT PROGRESS MODAL ===== */}
        <AnimatePresence>
          {showStudentsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => { setShowStudentsModal(null); setSelectedStudent(null); setStudentsData(null); }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-surface border border-border rounded-[2rem] p-5 sm:p-8 w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                      <FiBarChart2 className="w-5 h-5 text-primary" /> Student Progress
                    </h2>
                    {studentsData && (
                      <p className="text-sm text-muted mt-1">{studentsData.courseTitle} — {studentsData.students?.length || 0} student{studentsData.students?.length !== 1 ? 's' : ''} enrolled</p>
                    )}
                  </div>
                  <button
                    onClick={() => { setShowStudentsModal(null); setSelectedStudent(null); setStudentsData(null); }}
                    className="p-2 hover:bg-background rounded-xl transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {loadingStudents ? (
                  <div className="flex-1 flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : studentsData?.students?.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4">
                      <FiUsers className="w-7 h-7 text-muted" />
                    </div>
                    <h3 className="text-lg font-black mb-2">No students enrolled yet</h3>
                    <p className="text-sm text-muted">Students will appear here once they enroll in this course.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 overflow-hidden">
                    {/* Student List (left) */}
                    <div className="lg:col-span-3 flex flex-col overflow-hidden">
                      {/* Summary bar */}
                      {studentsData && (() => {
                        const students = studentsData.students || [];
                        const avgProgress = students.length > 0
                          ? Math.round(students.reduce((sum, s) => sum + s.progress.percentage, 0) / students.length)
                          : 0;
                        const completedAll = students.filter(s => s.progress.percentage === 100).length;
                        return (
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-background border border-border rounded-xl p-3 text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted">Enrolled</p>
                              <p className="text-xl font-black text-foreground">{students.length}</p>
                            </div>
                            <div className="bg-background border border-border rounded-xl p-3 text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted">Avg Progress</p>
                              <p className="text-xl font-black text-primary">{avgProgress}%</p>
                            </div>
                            <div className="bg-background border border-border rounded-xl p-3 text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted">Completed</p>
                              <p className="text-xl font-black text-success">{completedAll}</p>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="overflow-y-auto flex-1 space-y-2 pr-2 custom-scrollbar">
                        {(studentsData?.students || []).map((student) => (
                          <div
                            key={student.id}
                            onClick={() => setSelectedStudent(student)}
                            className={`p-4 border rounded-xl cursor-pointer transition-all ${
                              selectedStudent?.id === student.id
                                ? 'bg-primary/5 border-primary shadow-sm'
                                : 'bg-background border-border hover:border-primary/40'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-black flex-shrink-0">
                                  {student.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold truncate">{student.username}</p>
                                  <p className="text-[10px] text-muted truncate">{student.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${getProgressBgColor(student.progress.percentage)} ${
                                  student.progress.percentage >= 80 ? 'text-success' : student.progress.percentage >= 50 ? 'text-primary' : student.progress.percentage >= 25 ? 'text-warning' : 'text-error'
                                }`}>
                                  {student.progress.percentage}%
                                </span>
                                <FiChevronRight className="w-4 h-4 text-muted" />
                              </div>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${student.progress.percentage}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={`h-full rounded-full ${getProgressColor(student.progress.percentage)}`}
                              />
                            </div>
                            <p className="text-[10px] text-muted mt-1">
                              {student.progress.completedLessons} / {student.progress.totalLessons} lessons completed
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Student Detail Panel (right) */}
                    <div className="lg:col-span-2 bg-background border border-border rounded-2xl p-5 overflow-y-auto max-h-64 lg:max-h-full">
                      {selectedStudent ? (
                        <div className="space-y-5">
                          {/* Student Header */}
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-black mx-auto mb-3">
                              {selectedStudent.username?.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="text-lg font-black tracking-tight">{selectedStudent.username}</h3>
                            <p className="text-xs text-muted flex items-center justify-center gap-1 mt-1">
                              <FiMail className="w-3 h-3" /> {selectedStudent.email}
                            </p>
                          </div>

                          {/* Progress Visual */}
                          <div className="bg-surface border border-border rounded-xl p-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">Course Progress</p>
                            <div className="flex items-center gap-3">
                              <div className="relative w-16 h-16 flex-shrink-0">
                                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" className="text-border" strokeWidth="3" />
                                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" className={selectedStudent.progress.percentage >= 80 ? 'text-success' : selectedStudent.progress.percentage >= 50 ? 'text-primary' : 'text-warning'} strokeWidth="3" strokeDasharray={`${selectedStudent.progress.percentage}, 100`} strokeLinecap="round" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-black">{selectedStudent.progress.percentage}%</span>
                              </div>
                              <div>
                                <p className="text-sm font-bold">{selectedStudent.progress.completedLessons} of {selectedStudent.progress.totalLessons}</p>
                                <p className="text-[10px] text-muted">Lessons Completed</p>
                              </div>
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-surface border border-border rounded-xl p-3 text-center">
                              <p className="text-lg font-black">{selectedStudent.quizAttempts}</p>
                              <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Quiz Attempts</p>
                            </div>
                            <div className="bg-surface border border-border rounded-xl p-3 text-center">
                              <p className="text-lg font-black">{selectedStudent.enrolledAt ? new Date(selectedStudent.enrolledAt).toLocaleDateString() : '—'}</p>
                              <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Enrolled</p>
                            </div>
                          </div>

                          {/* Content Manager gets extra info */}
                          {isContentManager && (
                            <div className="bg-surface border border-border rounded-xl p-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">All Enrolled Courses ({selectedStudent.totalEnrollments})</p>
                              {selectedStudent.enrolledCourses?.length > 0 ? (
                                <div className="space-y-2">
                                  {selectedStudent.enrolledCourses.map((c, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                      <FiBookOpen className="w-3 h-3 text-primary flex-shrink-0" />
                                      <span className="truncate font-medium">{c.title}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-muted">No other courses</p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                          <div className="w-14 h-14 bg-surface border border-border rounded-full flex items-center justify-center mb-4">
                            <FiUsers className="w-6 h-6 text-muted" />
                          </div>
                          <p className="text-sm font-bold text-muted">Select a student</p>
                          <p className="text-xs text-muted mt-1">Click on a student to view their details and progress</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
