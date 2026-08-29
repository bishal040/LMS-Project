'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFileText, FiPlus, FiEdit3, FiTrash2, FiEye,
  FiEyeOff, FiX, FiCheck, FiCalendar, FiUser, FiBookOpen
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { getBlogs, createBlog, updateBlog, deleteBlog } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

/**
 * Content Manager Dashboard
 * 
 * DATA FLOW:
 * 1. Fetches all blog posts from /api/blog-posts (backend shows all posts for content_manager/admin)
 * 2. Allows creating new blog posts with draft/published status
 * 3. Toggle posts between draft ↔ published
 * 4. Edit existing posts inline via a modal
 * 5. Delete posts with confirmation
 */
export default function ContentManagerView() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    coverImageUrl: '',
    status: 'draft',
  });
  const [submitting, setSubmitting] = useState(false);

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

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData({ title: '', body: '', coverImageUrl: '', status: 'draft' });
    setShowModal(true);
  };

  const openEditModal = (post) => {
    const attrs = post.attributes || post;
    setEditingPost(post);
    setFormData({
      title: attrs.title || '',
      body: attrs.body || '',
      coverImageUrl: attrs.coverImageUrl || '',
      status: attrs.status || 'draft',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.body) {
      toast.error('Title and body are required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingPost) {
        await updateBlog(editingPost.documentId || editingPost.id, formData);
        toast.success('Blog post updated!');
      } else {
        await createBlog(formData);
        toast.success('Blog post created!');
      }
      setShowModal(false);
      fetchPosts();
    } catch (err) {
      toast.error(err.message || 'Failed to save post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (post) => {
    const attrs = post.attributes || post;
    const newStatus = attrs.status === 'published' ? 'draft' : 'published';
    try {
      await updateBlog(post.documentId || post.id, { status: newStatus });
      toast.success(`Post ${newStatus === 'published' ? 'published' : 'set to draft'}!`);
      fetchPosts();
    } catch (err) {
      toast.error('Failed to update post status');
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteBlog(post.documentId || post.id);
      toast.success('Post deleted');
      fetchPosts();
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  if (loading) return <LoadingSpinner label="Loading content manager..." />;

  const publishedCount = posts.filter(p => (p.attributes || p).status === 'published').length;
  const draftCount = posts.filter(p => (p.attributes || p).status === 'draft').length;

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
              <FiFileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Content Manager</h1>
              <p className="text-sm text-muted">Create and manage blog posts and platform content.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95"
            >
              <FiPlus /> New Post
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border border-border rounded-[2rem] p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center"><FiFileText className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Total Posts</p>
              <p className="text-3xl font-black">{posts.length}</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface border border-border rounded-[2rem] p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-success/10 text-success flex items-center justify-center"><FiEye className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Published</p>
              <p className="text-3xl font-black">{publishedCount}</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface border border-border rounded-[2rem] p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-warning/10 text-warning flex items-center justify-center"><FiEyeOff className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Drafts</p>
              <p className="text-3xl font-black">{draftCount}</p>
            </div>
          </motion.div>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border rounded-[2rem]">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4">
              <FiFileText className="w-6 h-6 text-muted" />
            </div>
            <h3 className="text-lg font-black mb-2">No blog posts yet</h3>
            <p className="text-muted mb-6">Create your first blog post to get started.</p>
            <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg transition-all active:scale-95">
              <FiPlus /> Create Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => {
              const attrs = post.attributes || post;
              return (
                <motion.div
                  key={post.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-surface border border-border rounded-[2rem] p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Image */}
                    {attrs.coverImageUrl && (
                      <img src={attrs.coverImageUrl} alt={attrs.title} className="w-full sm:w-24 h-16 object-cover rounded-xl flex-shrink-0" />
                    )}

                    {/* Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-black tracking-tight truncate">{attrs.title}</h3>
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full flex-shrink-0 ${
                          attrs.status === 'published' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}>
                          {attrs.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted line-clamp-1 mb-2">{attrs.body?.substring(0, 120)}...</p>
                      <div className="flex items-center gap-4 text-xs text-muted">
                        <span className="flex items-center gap-1"><FiUser className="w-3 h-3" /> {attrs.author?.data?.attributes?.username || attrs.author?.username || user?.username}</span>
                        {attrs.publishedAt && (
                          <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" /> {new Date(attrs.publishedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openEditModal(post)} className="p-3 bg-background border border-border rounded-xl hover:border-primary/30 hover:text-primary transition-all" title="Edit">
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleToggleStatus(post)} className="p-3 bg-background border border-border rounded-xl hover:border-success/30 hover:text-success transition-all" title={attrs.status === 'published' ? 'Unpublish' : 'Publish'}>
                        {attrs.status === 'published' ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDelete(post)} className="p-3 bg-background border border-border rounded-xl hover:border-error/30 hover:text-error transition-all" title="Delete">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ===== CREATE/EDIT MODAL ===== */}
        <AnimatePresence>
          {showModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-surface border border-border rounded-[2rem] p-5 sm:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <FiEdit3 className="w-5 h-5" />
                      </div>
                      {editingPost ? 'Edit Blog Post' : 'Create New Post'}
                    </h2>
                    <p className="text-sm text-muted mt-1">{editingPost ? 'Update your existing blog content.' : 'Write something amazing for your audience.'}</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-background border border-transparent hover:border-border rounded-xl transition-all"><FiX className="w-5 h-5" /></button>
                </div>

                <div className="bg-background border border-border rounded-[1.5rem] p-5 sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2">Post Title</label>
                      <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter a catchy title..." className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium transition-all" required />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2">Content Body</label>
                      <textarea value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} placeholder="Start writing your post here..." rows={12} className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium resize-none transition-all custom-scrollbar" required />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2">Cover Image URL (Optional)</label>
                        <input type="text" value={formData.coverImageUrl} onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })} placeholder="https://example.com/image.jpg" className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium transition-all" />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2">Visibility Status</label>
                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold appearance-none transition-all cursor-pointer">
                          <option value="draft">Draft (Hidden)</option>
                          <option value="published">Published (Visible)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="pt-4 mt-4 border-t border-border flex items-center justify-end gap-3">
                      <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-background border border-border text-foreground text-xs font-black uppercase tracking-widest rounded-xl hover:bg-surface transition-all">
                        Cancel
                      </button>
                      <button type="submit" disabled={submitting} className="px-8 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]">
                        {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiCheck className="w-4 h-4" /> {editingPost ? 'Save Changes' : 'Publish Post'}</>}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
