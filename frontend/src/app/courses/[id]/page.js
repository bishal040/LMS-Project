'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiBookOpen, FiPlay, FiCheckCircle, FiClock, FiUsers,
  FiArrowRight, FiLock, FiList
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { getCourse, checkEnrollment, enrollInCourse } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

/**
 * Course Detail Page — Shows course info, lesson list, and enroll button
 * Students can enroll and access lessons from here
 */
export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isStudent, isAdmin, isContentManager, isInstructor } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (id) fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      const data = await getCourse(id);
      setCourse(data?.data || data);

      // Check enrollment if user is logged in
      if (isAuthenticated) {
        try {
          const enrollment = await checkEnrollment(id);
          setIsEnrolled(enrollment?.enrolled || false);
        } catch {
          setIsEnrolled(false);
        }
      }
    } catch (err) {
      console.error('Failed to fetch course:', err);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to enroll in courses');
      router.push('/login');
      return;
    }

    if (isAdmin || isContentManager || isInstructor) {
      toast.error('Only students can enroll in courses.');
      return;
    }

    setEnrolling(true);
    try {
      await enrollInCourse(id);
      setIsEnrolled(true);
      toast.success('Successfully enrolled! Start learning now.');
    } catch (err) {
      toast.error(err.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
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

  const attrs = course?.attributes || course;
  const title = attrs?.title || 'Untitled Course';
  const description = attrs?.description || '';
  const coverImage = attrs?.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80';
  const category = attrs?.category || 'General';
  const instructorName = attrs?.instructor?.data?.attributes?.username || attrs?.instructor?.username || 'Instructor';
  const lessons = attrs?.lessons?.data || attrs?.lessons || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-[2rem] overflow-hidden h-[300px] sm:h-[400px]"
          >
            <img src={coverImage} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="px-3 py-1 bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                {category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-3 leading-tight">
                {title}
              </h1>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface border border-border rounded-[2rem] p-8"
          >
            <h2 className="text-xl font-black tracking-tight mb-4">About This Course</h2>
            <p className="text-muted leading-relaxed whitespace-pre-wrap">{description}</p>
          </motion.div>

          {/* Lesson List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface border border-border rounded-[2rem] p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <FiList className="text-primary" /> Course Content
              </h2>
              <span className="text-sm font-bold text-muted">{lessons.length} Lessons</span>
            </div>

            {lessons.length === 0 ? (
              <p className="text-muted text-center py-8">No lessons added yet.</p>
            ) : (
              <div className="space-y-2">
                {lessons.map((lesson, index) => {
                  const lessonAttrs = lesson?.attributes || lesson;
                  return (
                    <div
                      key={lesson.id || index}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        {isEnrolled ? (
                          <FiPlay className="w-4 h-4" />
                        ) : (
                          <FiLock className="w-4 h-4 text-muted" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="font-bold text-sm">
                          Lesson {index + 1}: {lessonAttrs?.title || 'Untitled'}
                        </p>
                      </div>
                      {isEnrolled && (
                        <FiCheckCircle className="w-5 h-5 text-muted flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="sticky top-24 bg-surface border border-border rounded-[2rem] p-8 space-y-6"
          >
            {/* Price */}
            <div className="text-center">
              <span className="text-4xl font-black text-gradient">Free</span>
              <p className="text-sm text-muted mt-1">Full access to all lessons</p>
            </div>

            {/* Enroll / Continue Button */}
            {isEnrolled ? (
              <button
                onClick={() => router.push(`/dashboard/course/${id}`)}
                className="w-full py-4 bg-success text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-success/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                Continue Learning <FiArrowRight />
              </button>
            ) : (!isAdmin && !isContentManager && !isInstructor) ? (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full py-4 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
              >
                {enrolling ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Enroll Now <FiArrowRight /></>
                )}
              </button>
            ) : (
              <div className="w-full py-4 bg-surface-hover border border-border text-muted text-sm font-black uppercase tracking-widest rounded-2xl text-center">
                Preview Mode (Staff)
              </div>
            )}

            {/* Course Info */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FiUsers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">Instructor</p>
                  <p className="text-sm font-bold">{instructorName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FiBookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">Lessons</p>
                  <p className="text-sm font-bold">{lessons.length} Lessons</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FiClock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">Access</p>
                  <p className="text-sm font-bold">Lifetime</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
