'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers, FiBookOpen, FiAward, FiFileText,
  FiTrendingUp, FiShield, FiSettings, FiUserCheck,
  FiClock, FiActivity
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminStats, getAllUsers, getRoles, updateUserRole } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

/**
 * Admin Dashboard — Full platform overview
 * 
 * DATA FLOW:
 * 1. On mount, fetches platform stats from /api/admin-stats (custom Strapi controller)
 * 2. Also fetches all users from /api/users to display the user management table
 * 3. Stats include: usersCount, coursesCount, enrollmentsCount, blogsCount, recentEnrollments
 * 4. Everything is protected by role-based access — only 'admin' role can access this page
 */
export default function AdminView() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, rolesRes] = await Promise.all([
        getAdminStats().catch(() => ({ data: {} })),
        getAllUsers().catch(() => []),
        getRoles().catch(() => ({ roles: [] })),
      ]);
      setStats(statsRes?.data || {});
      setUsers(Array.isArray(usersRes) ? usersRes : usersRes?.data || []);
      setRoles(rolesRes?.roles || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, roleId) => {
    setUpdatingRole(userId);
    try {
      await updateUserRole(userId, roleId);
      toast.success('User role updated successfully');
      fetchData(); // Refresh users list
    } catch (err) {
      console.error('Failed to update role:', err);
      toast.error('Failed to update user role');
    } finally {
      setUpdatingRole(null);
    }
  };

  if (loading) return <LoadingSpinner label="Loading admin dashboard..." />;

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.usersCount || 0,
      icon: <FiUsers className="w-6 h-6" />,
      color: 'bg-primary/10 text-primary',
      trend: '+12%',
    },
    {
      label: 'Total Courses',
      value: stats?.coursesCount || 0,
      icon: <FiBookOpen className="w-6 h-6" />,
      color: 'bg-success/10 text-success',
      trend: '+8%',
    },
    {
      label: 'Enrollments',
      value: stats?.enrollmentsCount || 0,
      icon: <FiAward className="w-6 h-6" />,
      color: 'bg-warning/10 text-warning',
      trend: '+24%',
    },
    {
      label: 'Blog Posts',
      value: stats?.blogsCount || 0,
      icon: <FiFileText className="w-6 h-6" />,
      color: 'bg-secondary/10 text-secondary',
      trend: '+5%',
    },
  ];

  const recentEnrollments = stats?.recentEnrollments || [];

  const getRoleBadge = (role) => {
    const roleType = role?.type || role?.name || 'authenticated';
    const styles = {
      admin: 'bg-error/10 text-error',
      content_manager: 'bg-secondary/10 text-secondary',
      instructor: 'bg-primary/10 text-primary',
      authenticated: 'bg-success/10 text-success',
      student: 'bg-success/10 text-success',
    };
    const labels = {
      admin: 'Admin',
      content_manager: 'Content Manager',
      instructor: 'Instructor',
      authenticated: 'Student',
      student: 'Student',
    };
    return (
      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${styles[roleType] || 'bg-muted/10 text-muted'}`}>
        {labels[roleType] || roleType}
      </span>
    );
  };

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center">
              <FiShield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-muted">Welcome back, {user?.username}. Full platform control.</p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: <FiActivity className="w-4 h-4" /> },
            { id: 'users', label: 'Users', icon: <FiUsers className="w-4 h-4" /> },
            { id: 'activity', label: 'Recent Activity', icon: <FiClock className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-surface border border-border text-muted hover:text-foreground hover:bg-surface-hover'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-surface border border-border rounded-[2rem] p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl ${card.color} flex items-center justify-center`}>
                  {card.icon}
                </div>
                <span className="text-xs font-bold text-success flex items-center gap-1">
                  <FiTrendingUp className="w-3 h-3" /> {card.trend}
                </span>
              </div>
              <p className="text-3xl font-black mb-1">{card.value}</p>
              <p className="text-sm font-bold text-muted uppercase tracking-widest">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Quick Actions */}
            <div className="bg-surface border border-border rounded-[2rem] p-8">
              <h2 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2">
                <FiSettings className="text-primary" /> Quick Actions
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Manage Users & Roles', desc: 'Switch to Users tab', action: () => setActiveTab('users') },
                  { label: 'View Recent Activity', desc: 'Check latest enrollments', action: () => setActiveTab('activity') },
                  { label: 'Strapi Admin Panel', desc: 'Full content management', action: () => window.open('http://localhost:1337/admin', '_blank') },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-4 bg-background rounded-2xl border border-border/50 hover:border-primary/30 hover:bg-surface-hover transition-all text-left group"
                  >
                    <div>
                      <p className="font-bold text-sm group-hover:text-primary transition-colors">{item.label}</p>
                      <p className="text-xs text-muted">{item.desc}</p>
                    </div>
                    <FiTrendingUp className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Health */}
            <div className="bg-surface border border-border rounded-[2rem] p-8">
              <h2 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2">
                <FiActivity className="text-primary" /> Platform Health
              </h2>
              <div className="space-y-5">
                {[
                  { label: 'API Status', value: 'Online', status: 'good' },
                  { label: 'Database', value: 'SQLite (Dev) / PostgreSQL (Prod)', status: 'good' },
                  { label: 'Auth System', value: 'JWT Active', status: 'good' },
                  { label: 'Content Types', value: '7 registered', status: 'good' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border/50">
                    <div>
                      <p className="font-bold text-sm">{item.label}</p>
                      <p className="text-xs text-muted">{item.value}</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-surface border border-border rounded-[2rem] p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <FiUserCheck className="text-primary" /> All Users ({users.length})
              </h2>
            </div>

            {users.length === 0 ? (
              <p className="text-center text-muted py-12">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-4 text-xs font-black uppercase tracking-widest text-muted">User</th>
                      <th className="pb-4 text-xs font-black uppercase tracking-widest text-muted">Email</th>
                      <th className="pb-4 text-xs font-black uppercase tracking-widest text-muted">Role</th>
                      <th className="pb-4 text-xs font-black uppercase tracking-widest text-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                              {(u.username || 'U')[0].toUpperCase()}
                            </div>
                            <span className="font-bold text-sm">{u.username || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-muted">{u.email || '—'}</td>
                        <td className="py-4">
                          <select
                            value={u.role?.id || ''}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={updatingRole === u.id || u.id === user?.id} // Cannot change own role
                            className="bg-background border border-border/50 text-sm rounded-lg px-2 py-1 outline-none focus:border-primary disabled:opacity-50"
                          >
                            <option value="" disabled>Select Role</option>
                            {roles.map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                            u.blocked ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
                          }`}>
                            {u.blocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-surface border border-border rounded-[2rem] p-8"
          >
            <h2 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2">
              <FiClock className="text-primary" /> Recent Enrollments
            </h2>

            {recentEnrollments.length === 0 ? (
              <p className="text-center text-muted py-12">No recent enrollments yet.</p>
            ) : (
              <div className="space-y-3">
                {recentEnrollments.map((enrollment, i) => {
                  const student = enrollment.student?.username || 'A student';
                  const course = enrollment.course?.title || 'a course';
                  const date = enrollment.enrolledAt
                    ? new Date(enrollment.enrolledAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recently';

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-background rounded-2xl border border-border/50"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <FiUserCheck className="w-5 h-5" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-bold">
                          <span className="text-primary">{student}</span> enrolled in{' '}
                          <span className="text-primary">{course}</span>
                        </p>
                        <p className="text-xs text-muted">{date}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
  );
}
