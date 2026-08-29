'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * ProtectedRoute — wraps pages that require authentication
 * Optionally checks for specific roles
 * 
 * Usage:
 *   <ProtectedRoute>            → requires login
 *   <ProtectedRoute roles={['admin']}>  → requires admin role
 *   <ProtectedRoute roles={['admin', 'content_manager']}>  → admin OR CM
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth check to complete

    // Not logged in → redirect to login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Role check — if roles are specified, verify user has one of them
    if (roles.length > 0 && !hasRole(roles)) {
      // User is logged in but doesn't have the right role
      router.push('/unauthorized');
    }
  }, [loading, isAuthenticated, user, roles, hasRole, router]);

  // Show loading spinner during auth check
  if (loading) {
    return <LoadingSpinner />;
  }

  // Not authenticated — show nothing (redirect will happen via useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // Role check failed — show nothing (redirect will happen)
  if (roles.length > 0 && !hasRole(roles)) {
    return null;
  }

  // All checks passed — render children
  return <>{children}</>;
}
