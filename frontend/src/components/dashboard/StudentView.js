'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiBookOpen, FiPlay, FiAward, FiClock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { getMyEnrollments, getCourseProgress } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

export default function StudentView() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get enrollments
      console.log('Fetching enrollments...');
      const enrollRes = await getMyEnrollments();
      console.log('Enrollments response:', enrollRes);
      const courses = enrollRes?.data || [];
      setEnrollments(courses);

      // Fetch progress for each enrolled course
      const progressMap = {};
      for (const enroll of courses) {
        const courseId = enroll.course?.documentId;
        if (courseId) {
          try {
            const prog = await getCourseProgress(courseId);
            progressMap[courseId] = prog?.data;
          } catch (e) {
            console.error(`Failed to load progress for ${courseId}`, e?.response?.status, e?.response?.data);
          }
        }
      }
      setProgressData(progressMap);

    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.error?.message || err.message;
      console.error('Failed to load dashboard:', status, msg, err);
      toast.error(`Failed to load dashboard data (${status}: ${msg})`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;

  // Calculate overall stats
  const totalCourses = enrollments.length;
  let completedCourses = 0;
  let totalLessons = 0;
  let completedLessons = 0;

  Object.values(progressData).forEach((prog) => {
    totalLessons += prog?.totalLessons || 0;
    completedLessons += prog?.completedLessons || 0;
    if (prog?.percentage === 100) completedCourses++;
  });

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Welcome back, <span className="text-primary">{user?.username}</span>! 👋
          </h1>
          <p className="text-muted">Here is your learning progress.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border rounded-[2rem] p-6 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <FiBookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Enrolled</p>
              <p className="text-3xl font-black">{totalCourses}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface border border-border rounded-[2rem] p-6 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-success/10 text-success flex items-center justify-center">
              <FiAward className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Completed</p>
              <p className="text-3xl font-black">{completedCourses}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface border border-border rounded-[2rem] p-6 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
              <FiPlay className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Lessons Done</p>
              <p className="text-3xl font-black">{completedLessons} <span className="text-sm font-medium text-muted">/ {totalLessons}</span></p>
            </div>
          </motion.div>
        </div>

        {/* Enrolled Courses */}
        <h2 className="text-2xl font-black tracking-tight mb-6 flex items-center gap-2">
          <FiClock className="text-primary" /> My Courses
        </h2>

        {enrollments.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border rounded-[2rem]">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4">
              <FiBookOpen className="w-6 h-6 text-muted" />
            </div>
            <h3 className="text-lg font-black mb-2">No courses yet</h3>
            <p className="text-muted mb-6">Explore our library and enroll in your first course.</p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
            >
              Browse Courses <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              if (!course) return null;
              
              const attrs = course.attributes || course;
              const courseId = course.documentId || course.id;
              const prog = progressData[courseId] || { percentage: 0 };
              
              return (
                <div key={courseId} className="bg-surface border border-border rounded-[2rem] overflow-hidden hover:shadow-xl transition-all">
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={attrs.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'}
                      alt={attrs.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                    
                    {/* Progress Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg ${
                        prog.percentage === 100 ? 'bg-success text-white' : 'bg-background/90 text-foreground backdrop-blur-md'
                      }`}>
                        {prog.percentage}% Done
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-black tracking-tight mb-4 line-clamp-1">{attrs.title}</h3>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-background rounded-full overflow-hidden mb-6 border border-border/50">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${prog.percentage}%` }}
                      />
                    </div>

                    <Link
                      href={`/dashboard/course/${courseId}`}
                      className="w-full py-3 bg-background border border-border text-foreground text-xs font-black uppercase tracking-widest rounded-xl hover:bg-surface-hover transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      {prog.percentage === 100 ? 'Review Course' : 'Continue Learning'} <FiArrowRight />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
  );
}
