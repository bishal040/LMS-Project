'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiFileText, FiCalendar, FiUser, FiArrowRight, FiSearch } from 'react-icons/fi';
import { getBlogs } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

/**
 * Blog Listing Page — Public page showing all published blog posts
 */
export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await getBlogs();
      setPosts(data?.data || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const attrs = post.attributes || post;
    const title = (attrs.title || '').toLowerCase();
    const body = (attrs.body || '').toLowerCase();
    return title.includes(search.toLowerCase()) || body.includes(search.toLowerCase());
  });

  if (loading) return <LoadingSpinner label="Loading blog..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full mb-6">
          <FiFileText className="w-3 h-3" /> Blog
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
          Latest Articles
        </h1>
        <p className="text-lg text-muted max-w-2xl">
          Insights, tutorials, and updates from our content team.
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-8"
      >
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="w-full max-w-md pl-12 pr-4 py-3.5 bg-surface border border-border rounded-2xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium"
        />
      </motion.div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
            <FiFileText className="w-8 h-8 text-muted" />
          </div>
          <h3 className="text-xl font-black mb-2">No Articles Found</h3>
          <p className="text-muted">
            {search ? 'Try a different search term.' : 'Blog posts will appear here once published.'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post, i) => {
            const attrs = post.attributes || post;
            const postId = post.documentId || post.id;
            const coverImage = attrs.coverImageUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80';
            const authorName = attrs.author?.data?.attributes?.username || attrs.author?.username || 'Team';
            const publishDate = attrs.publishedAt
              ? new Date(attrs.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : '';

            return (
              <motion.div
                key={postId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="group bg-surface border border-border rounded-[2rem] overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-500"
              >
                {/* Cover Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={coverImage}
                    alt={attrs.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1"><FiUser className="w-3 h-3" /> {authorName}</span>
                    {publishDate && <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" /> {publishDate}</span>}
                  </div>
                  <h3 className="text-lg font-black tracking-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {attrs.title}
                  </h3>
                  <p className="text-sm text-muted line-clamp-3">{attrs.body?.substring(0, 150)}...</p>
                  <Link
                    href={`/blog/${postId}`}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:gap-3 transition-all mt-2"
                  >
                    Read More <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
