'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiShield, FiArrowLeft } from 'react-icons/fi';

/**
 * Unauthorized Page — Shown when a user tries to access a route
 * they don't have permission for
 */
export default function UnauthorizedPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
          <FiShield className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-3">Access Denied</h1>
        <p className="text-muted mb-8 leading-relaxed">
          You don&apos;t have permission to access this page. If you believe this is an error,
          please contact an administrator.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95"
        >
          <FiArrowLeft /> Go Home
        </Link>
      </motion.div>
    </div>
  );
}
