'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiBookOpen, FiFilter } from 'react-icons/fi';
import CourseCard from '@/components/course/CourseCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getCourses } from '@/lib/api';
import { toast } from 'react-toastify';

/**
 * Courses Page — Browse all published courses
 * Features: Search, category filter, grid layout
 */
export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

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

  // Get unique categories from courses
  const categories = ['all', ...new Set(
    courses.map((c) => c?.attributes?.category || c?.category || 'General').filter(Boolean)
  )];

  // Filter courses by search and category
  const filteredCourses = courses.filter((course) => {
    const attrs = course?.attributes || course;
    const title = (attrs?.title || '').toLowerCase();
    const desc = (attrs?.description || '').toLowerCase();
    const cat = attrs?.category || 'General';

    const matchesSearch = title.includes(search.toLowerCase()) || desc.includes(search.toLowerCase());
    const matchesCategory = category === 'all' || cat === category;

    return matchesSearch && matchesCategory;
  });

  if (loading) return <LoadingSpinner label="Loading courses..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full mb-6">
          <FiBookOpen className="w-3 h-3" /> Course Library
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
          Explore Courses
        </h1>
        <p className="text-lg text-muted max-w-2xl">
          Browse our collection of courses. Enroll and start learning at your own pace.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        {/* Search */}
        <div className="relative flex-grow">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-12 pr-4 py-3.5 bg-surface border border-border rounded-2xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="pl-12 pr-8 py-3.5 bg-surface border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-bold appearance-none min-w-[180px]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24"
        >
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
            <FiBookOpen className="w-8 h-8 text-muted" />
          </div>
          <h3 className="text-xl font-black mb-2">No Courses Found</h3>
          <p className="text-muted">
            {search || category !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Courses will appear here once they are published.'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
