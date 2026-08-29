'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiBookOpen, FiEdit3, FiShield } from 'react-icons/fi';

// Import all role-specific views
import AdminView from '@/components/dashboard/AdminView';
import ContentManagerView from '@/components/dashboard/ContentManagerView';
import InstructorView from '@/components/dashboard/InstructorView';
import StudentView from '@/components/dashboard/StudentView';

export default function UnifiedDashboard() {
  const { user, loading, isAdmin, isContentManager, isInstructor } = useAuth();
  const [activeTab, setActiveTab] = useState('student');

  // Set default tab based on highest privilege
  useEffect(() => {
    if (isAdmin) setActiveTab('admin');
    else if (isContentManager) setActiveTab('content_manager');
    else if (isInstructor) setActiveTab('instructor');
    else setActiveTab('student');
  }, [isAdmin, isContentManager, isInstructor]);

  if (loading) {
    return <LoadingSpinner label="Checking role..." />;
  }

  // Determine available tabs strictly based on Permission Matrix
  const availableTabs = [
    { id: 'admin', label: 'Admin Panel', icon: FiShield, show: isAdmin },
    { id: 'content_manager', label: 'Manage Blog', icon: FiEdit3, show: isAdmin || isContentManager },
    { id: 'instructor', label: 'Manage Courses', icon: FiBookOpen, show: isAdmin || isContentManager || isInstructor },
    { id: 'student', label: 'My Learning', icon: FiGrid, show: !isAdmin && !isContentManager && !isInstructor }, // Only standard students see this
  ].filter(tab => tab.show);

  const renderDashboardView = () => {
    switch (activeTab) {
      case 'admin':
        return <AdminView />;
      case 'content_manager':
        return <ContentManagerView />;
      case 'instructor':
        return <InstructorView />;
      case 'student':
      default:
        return <StudentView />;
    }
  };

  return (
    <ProtectedRoute roles={['authenticated', 'student', 'instructor', 'content_manager', 'admin']}>
      {/* Tab Navigation if user has multiple views available */}
      {availableTabs.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-border/50">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all relative ${
                  activeTab === tab.id
                    ? 'text-primary'
                    : 'text-muted hover:text-foreground hover:bg-surface-hover'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(var(--primary),0.5)]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Active View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderDashboardView()}
        </motion.div>
      </AnimatePresence>
    </ProtectedRoute>
  );
}
