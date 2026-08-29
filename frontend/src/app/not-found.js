'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiHome, FiArrowRight } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-16">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg text-center"
      >
        <div className="bg-surface border border-border rounded-[2rem] p-10 sm:p-14 shadow-2xl relative overflow-hidden">
          {/* Inner Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-primary/20 blur-xl shadow-[0_0_50px_20px_rgba(var(--primary),0.3)]" />
          
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-primary/20">
            <FiAlertTriangle className="text-primary w-12 h-12 animate-pulse" />
          </div>
          
          <h1 className="text-6xl font-black tracking-tighter mb-4 text-foreground">
            404
          </h1>
          <h2 className="text-2xl font-black tracking-tight mb-4">
            Page Not Found
          </h2>
          <p className="text-muted mb-10 leading-relaxed max-w-sm mx-auto">
            We searched everywhere, but the page you are looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-6 py-4 bg-surface border border-border text-foreground text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-surface-hover hover:border-primary/30 transition-all active:scale-95"
            >
              Go Back
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <FiHome className="w-4 h-4" /> Go Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
