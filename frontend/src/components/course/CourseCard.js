'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiClock, FiUsers, FiArrowRight, FiBookOpen } from 'react-icons/fi';

/**
 * CourseCard — Premium course card with hover lift animation
 * Inspired by RiseOn's CourseCard design
 * 
 * Props:
 * - course: { id, title, description, coverImageUrl, category, instructor, lessons }
 * - showActions: show edit/delete buttons (for instructors/admins)
 */
export default function CourseCard({ course }) {
  const attrs = course?.attributes || course;
  const id = course?.documentId || course?.id;
  const title = attrs?.title || 'Untitled Course';
  const description = attrs?.description || '';
  const coverImage = attrs?.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';
  const category = attrs?.category || 'General';
  const instructorName = attrs?.instructor?.data?.attributes?.username || attrs?.instructor?.username || 'Instructor';
  const lessonCount = attrs?.lessons?.data?.length || attrs?.lessons?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative bg-surface border border-border rounded-[2rem] overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-500"
    >
      {/* Full-card link overlay */}
      <Link href={`/courses/${id}`} className="absolute inset-0 z-10" aria-label={`View ${title}`} />

      {/* Cover Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-primary/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-black leading-tight tracking-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-muted line-clamp-2">{description}</p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 py-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-muted">
            <FiBookOpen className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold">{lessonCount} Lessons</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted">
            <FiUsers className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold">{instructorName}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-black text-primary uppercase tracking-widest">Free</span>
          <Link
            href={`/courses/${id}`}
            className="relative z-20 px-5 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md shadow-primary/20 flex items-center gap-2 transition-all hover:shadow-lg hover:gap-3 active:scale-95"
          >
            Explore <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
