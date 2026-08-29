'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiArrowRight, FiCheckCircle, FiPlay,
  FiBookOpen, FiList, FiAward
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { getCourse, getCourseProgress, markLessonComplete } from '@/lib/api';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

/**
 * Course Learning Page — Where enrolled students consume content
 * 
 * DATA FLOW:
 * 1. Fetches course + lessons from /api/courses/:id
 * 2. Fetches progress from /api/progresses/course/:id
 * 3. Student navigates lessons via sidebar
 * 4. "Mark Complete" button creates a progress record via POST /api/progresses
 * 5. Progress bar updates in real-time as lessons are completed
 */
export default function CourseLearningPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [progress, setProgress] = useState(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (id) fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      const courseData = await getCourse(id);
      setCourse(courseData?.data || courseData);

      const progData = await getCourseProgress(id);
      setProgress(progData?.data || null);
    } catch (err) {
      console.error('Failed to fetch course:', err);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    const lessons = getLessons();
    const currentLesson = lessons[currentLessonIndex];
    if (!currentLesson) return;

    const lessonId = currentLesson.documentId || currentLesson.id;
    setMarking(true);
    try {
      await markLessonComplete(id, lessonId);
      toast.success('Lesson marked as complete!');
      // Refresh progress
      const progData = await getCourseProgress(id);
      setProgress(progData?.data || null);
    } catch (err) {
      toast.error(err.message || 'Failed to mark lesson complete');
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading course..." />;
  if (!course) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-black mb-2">Course Not Found</h2>
        <p className="text-muted">This course doesn&apos;t exist or has been removed.</p>
      </div>
    );
  }

  const attrs = course.attributes || course;
  const getLessons = () => {
    const raw = attrs.lessons?.data || attrs.lessons || [];
    return raw.sort((a, b) => {
      const aOrder = (a.attributes || a).order || 0;
      const bOrder = (b.attributes || b).order || 0;
      return aOrder - bOrder;
    });
  };
  const lessons = getLessons();
  const quizzes = attrs.quizzes?.data || attrs.quizzes || [];
  const currentLesson = lessons[currentLessonIndex];
  const lessonAttrs = currentLesson?.attributes || currentLesson || {};
  const completedIds = progress?.completedLessonIds || [];
  const percentage = progress?.percentage || 0;

  const isCurrentCompleted = completedIds.includes(currentLesson?.documentId || currentLesson?.id);

  return (
    <ProtectedRoute roles={['authenticated', 'student']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ===== SIDEBAR ===== */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-surface border border-border rounded-[2rem] p-6 space-y-6">
              {/* Course Title */}
              <div>
                <Link href={`/courses/${id}`} className="text-xs font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1 mb-2">
                  <FiArrowLeft className="w-3 h-3" /> Course
                </Link>
                <h2 className="text-lg font-black tracking-tight line-clamp-2">{attrs.title}</h2>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted uppercase tracking-widest">Progress</span>
                  <span className="text-xs font-black text-primary">{percentage}%</span>
                </div>
                <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-border/50">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
                </div>
              </div>

              {/* Lesson List */}
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-muted mb-3 flex items-center gap-1"><FiList className="w-3 h-3" /> Lessons</p>
                {lessons.map((lesson, i) => {
                  const la = lesson.attributes || lesson;
                  const lessonDocId = lesson.documentId || lesson.id;
                  const completed = completedIds.includes(lessonDocId);
                  return (
                    <button
                      key={lessonDocId || i}
                      onClick={() => setCurrentLessonIndex(i)}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        i === currentLessonIndex
                          ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                          : 'hover:bg-background text-muted hover:text-foreground'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black ${
                        completed ? 'bg-success text-white' : 'bg-background border border-border'
                      }`}>
                        {completed ? <FiCheckCircle className="w-3 h-3" /> : i + 1}
                      </div>
                      <span className="truncate">{la.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quizzes */}
              {quizzes.length > 0 && (
                <div className="space-y-1 pt-4 border-t border-border">
                  <p className="text-xs font-black uppercase tracking-widest text-muted mb-3 flex items-center gap-1"><FiAward className="w-3 h-3" /> Quizzes</p>
                  {quizzes.map((quiz) => {
                    const qa = quiz.attributes || quiz;
                    const quizDocId = quiz.documentId || quiz.id;
                    return (
                      <Link
                        key={quizDocId}
                        href={`/courses/${id}/quiz/${quizDocId}`}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-primary hover:bg-primary/5 transition-all"
                      >
                        <FiAward className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{qa.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ===== MAIN CONTENT ===== */}
          <div className="lg:col-span-3">
            {!currentLesson ? (
              <div className="text-center py-24 bg-surface border border-border rounded-[2rem]">
                <FiBookOpen className="w-10 h-10 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-black mb-2">No Lessons Available</h3>
                <p className="text-muted">This course doesn&apos;t have any lessons yet.</p>
              </div>
            ) : (
              <motion.div
                key={currentLessonIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Lesson Header */}
                <div className="bg-surface border border-border rounded-[2rem] p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-widest text-primary">
                      Lesson {currentLessonIndex + 1} of {lessons.length}
                    </span>
                    {isCurrentCompleted && (
                      <span className="flex items-center gap-1 text-xs font-black text-success uppercase tracking-widest">
                        <FiCheckCircle className="w-4 h-4" /> Completed
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-6">{lessonAttrs.title}</h1>

                  {/* Video */}
                  {lessonAttrs.videoUrl && (
                    <div className="relative rounded-2xl overflow-hidden bg-black mb-6 aspect-video">
                      <iframe
                        src={lessonAttrs.videoUrl.replace('watch?v=', 'embed/')}
                        title={lessonAttrs.title}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {/* Content */}
                  {lessonAttrs.content && (
                    <div className="prose prose-lg max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                      {lessonAttrs.content}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => setCurrentLessonIndex(Math.max(0, currentLessonIndex - 1))}
                    disabled={currentLessonIndex === 0}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-border text-foreground text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-surface-hover transition-all disabled:opacity-30 active:scale-95"
                  >
                    <FiArrowLeft /> Previous
                  </button>

                  {!isCurrentCompleted && (
                    <button
                      onClick={handleMarkComplete}
                      disabled={marking}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-success text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-success/20 hover:shadow-xl transition-all disabled:opacity-50 active:scale-95"
                    >
                      {marking ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><FiCheckCircle /> Mark Complete</>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => setCurrentLessonIndex(Math.min(lessons.length - 1, currentLessonIndex + 1))}
                    disabled={currentLessonIndex === lessons.length - 1}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-30 active:scale-95"
                  >
                    Next <FiArrowRight />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
