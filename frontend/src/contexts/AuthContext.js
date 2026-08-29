'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, loginUser, registerUser, logoutUser, getToken } from '@/lib/api';

// Create the auth context
const AuthContext = createContext(null);

/**
 * AuthProvider wraps the entire app and provides:
 * - user: current user object (with role)
 * - login: authenticate with identifier + password
 * - register: create new account
 * - logout: clear session
 * - loading: initial auth check in progress
 * - isAuthenticated: boolean shorthand
 * 
 * Role helpers:
 * - isAdmin, isContentManager, isInstructor, isStudent
 * - hasRole(roleName): check against user's role
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if we have a valid token and fetch user data
  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await getMe();
      setUser(userData);
    } catch (err) {
      // Token invalid or expired — clear it
      console.error('Auth check failed:', err);
      logoutUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Login with email/username and password
   * On success, fetches full user profile with role
   */
  const login = async (identifier, password) => {
    const data = await loginUser({ identifier, password });
    // Fetch full user with role populated
    const userData = await getMe();
    setUser(userData);
    return userData;
  };

  /**
   * Register a new user account
   * On success, fetches full user profile with role
   */
  const register = async (username, email, password) => {
    const data = await registerUser({ username, email, password });
    const userData = await getMe();
    setUser(userData);
    return userData;
  };

  /**
   * Logout — clear token and reset state
   */
  const logout = () => {
    logoutUser();
    setUser(null);
  };

  // Role name extraction — Strapi returns role as an object { id, name, type }
  const roleName = user?.role?.type || user?.role?.name || '';

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    // Role checks — compare against Strapi role 'type' field
    isAdmin: roleName === 'admin',
    isContentManager: roleName === 'content_manager',
    isInstructor: roleName === 'instructor',
    isStudent: roleName === 'authenticated' || roleName === 'student',
    /**
     * Check if the user has a specific role
     * @param {string|string[]} roles - role type(s) to check
     */
    hasRole: (roles) => {
      if (Array.isArray(roles)) return roles.includes(roleName);
      return roleName === roles;
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * Must be used within <AuthProvider>
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
