'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiBookOpen, FiUsers, FiAward,
  FiCheckCircle, FiPlay, FiBarChart2, FiEdit3, FiShield
} from 'react-icons/fi';

/**
 * Home Page — Landing page with hero, features, stats, and CTA
 * Premium design inspired by RiseOn's style
 */
export default function HomePage() {
  const features = [
    {
      icon: <FiBookOpen className="w-6 h-6" />,
      title: 'Rich Course Library',
      description: 'Browse and enroll in courses with video lessons, text content, and quizzes.',
    },
    {
      icon: <FiBarChart2 className="w-6 h-6" />,
      title: 'Progress Tracking',
      description: 'Track your learning journey with real-time progress bars and completion status.',
    },
    {
      icon: <FiCheckCircle className="w-6 h-6" />,
      title: 'Auto-Graded Quizzes',
      description: 'Take MCQ quizzes and get instant scores with detailed result breakdowns.',
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: 'Role-Based Access',
      description: 'Four distinct roles — Admin, Content Manager, Instructor, and Student.',
    },
    {
      icon: <FiEdit3 className="w-6 h-6" />,
      title: 'Blog & Content',
      description: 'Read blog posts from content managers. Draft-to-publish workflow included.',
    },
    {
      icon: <FiUsers className="w-6 h-6" />,
      title: 'Admin Dashboard',
      description: 'Full platform management with user roles, stats, and content control.',
    },
  ];

  const stats = [
    { value: '50+', label: 'Courses' },
    { value: '1K+', label: 'Students' },
    { value: '100+', label: 'Lessons' },
    { value: '4', label: 'User Roles' },
  ];

  return (
    <div className="overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full mb-8">
                <FiPlay className="w-3 h-3" /> Modern Learning Platform
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6"
            >
              Learn Without{' '}
              <span className="text-gradient">Limits</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              A premium learning management system with courses, quizzes, progress tracking, 
              and role-based access. Built with Next.js and powered by Strapi.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/courses"
                className="group px-8 py-4 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 flex items-center gap-2 hover:gap-4"
              >
                Explore Courses
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 bg-surface border border-border text-foreground text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-surface-hover transition-all duration-300"
              >
                Get Started Free
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-16 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-black text-gradient mb-2">{stat.value}</div>
                <div className="text-sm font-bold text-muted uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full mb-6">
              <FiAward className="w-3 h-3" /> Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              A complete LMS packed with features for learners, instructors, and administrators.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group bg-surface border border-border rounded-[2rem] p-8 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
              >
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black tracking-tight mb-3 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-primary rounded-[2rem] p-12 sm:p-16 text-center overflow-hidden"
          >
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-xl" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
                Join LearnHub today and access courses, track your progress, and achieve your learning goals.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Create Free Account <FiArrowRight />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
