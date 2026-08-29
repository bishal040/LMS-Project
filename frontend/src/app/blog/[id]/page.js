'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiArrowLeft, FiBookOpen } from 'react-icons/fi';
import { getBlog } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

/**
 * Blog Detail Page — Renders a single published blog post
 */
export default function BlogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const data = await getBlog(id);
      setPost(data?.data || data);
    } catch (err) {
      console.error('Failed to fetch post:', err);
      toast.error('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading article..." />;

  if (!post) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-black mb-2">Article Not Found</h2>
        <p className="text-muted">This article doesn&apos;t exist or has been removed.</p>
      </div>
    );
  }

  const attrs = post.attributes || post;
  const title = attrs.title || 'Untitled';
  const body = attrs.body || '';
  const coverImage = attrs.coverImageUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80';
  const authorName = attrs.author?.data?.attributes?.username || attrs.author?.username || 'Team';
  const publishDate = attrs.publishedAt
    ? new Date(attrs.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted hover:text-primary transition-colors mb-8"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </motion.div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-[2rem] overflow-hidden h-[300px] sm:h-[400px] mb-10"
      >
        <img src={coverImage} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex items-center gap-4 text-sm text-white/80 mb-3">
            <span className="flex items-center gap-1"><FiUser className="w-4 h-4" /> {authorName}</span>
            {publishDate && <span className="flex items-center gap-1"><FiCalendar className="w-4 h-4" /> {publishDate}</span>}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            {title}
          </h1>
        </div>
      </motion.div>

      {/* Body */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-surface border border-border rounded-[2rem] p-8 sm:p-12"
      >
        <div className="prose prose-lg max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
          {body}
        </div>
      </motion.article>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-10 text-center"
      >
        <p className="text-muted mb-4">Enjoyed this article? Explore our courses.</p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95"
        >
          <FiBookOpen /> Browse Courses
        </Link>
      </motion.div>
    </div>
  );
}
