'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  FiSun, FiMoon, FiMenu, FiX, FiLogOut, FiUser,
  FiBookOpen, FiGrid, FiEdit3, FiShield, FiChevronDown
} from 'react-icons/fi';

/**
 * Navbar — Glassmorphism navigation bar with:
 * - Logo + nav links
 * - Theme toggle (sun/moon)
 * - Role-aware user menu
 * - Animated mobile drawer
 * 
 * Inspired by the RiseOn Navbar design
 */
export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin, isContentManager, isInstructor } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

  // Track scroll position for glass effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
  };

  // Navigation links
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/courses', label: 'Courses' },
    { href: '/blog', label: 'Blog' },
  ];

  // Get dashboard link based on role
  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isContentManager) return '/content-manager';
    if (isInstructor) return '/instructor';
    return '/dashboard';
  };

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Role badge color
  const getRoleBadge = () => {
    const roleName = user?.role?.type || user?.role?.name || 'student';
    const badges = {
      admin: { label: 'Admin', color: 'bg-error/10 text-error' },
      content_manager: { label: 'Content Manager', color: 'bg-info/10 text-info' },
      instructor: { label: 'Instructor', color: 'bg-accent/10 text-accent' },
      authenticated: { label: 'Student', color: 'bg-success/10 text-success' },
      student: { label: 'Student', color: 'bg-success/10 text-success' },
    };
    return badges[roleName] || badges.authenticated;
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass shadow-lg shadow-primary/5'
            : 'bg-background/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                <FiBookOpen className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-foreground hidden sm:block">
                Learn<span className="text-primary">Hub</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
                    isActive(link.href)
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-foreground/60 hover:text-foreground hover:bg-surface-hover'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  href={getDashboardLink()}
                  className={`px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
                    isActive(getDashboardLink())
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-foreground/60 hover:text-foreground hover:bg-surface-hover'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Right Side: Theme Toggle + Auth */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-surface text-foreground hover:bg-surface-hover hover:text-primary transition-all duration-300 active:scale-90"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </button>

              {/* Desktop Auth */}
              {isAuthenticated ? (
                <div className="hidden md:block relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface hover:bg-surface-hover transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <FiUser className="text-primary w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-foreground max-w-[120px] truncate">
                      {user?.username || 'User'}
                    </span>
                    <FiChevronDown
                      className={`w-4 h-4 text-muted transition-transform duration-300 ${
                        profileOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-14 w-64 bg-surface border border-border rounded-2xl shadow-xl p-2 z-50"
                      >
                        {/* User Info */}
                        <div className="px-3 py-3 border-b border-border mb-2">
                          <p className="text-sm font-bold text-foreground truncate">{user?.username}</p>
                          <p className="text-xs text-muted truncate">{user?.email}</p>
                          <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full ${getRoleBadge().color}`}>
                            {getRoleBadge().label}
                          </span>
                        </div>

                        <Link
                          href={getDashboardLink()}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-surface-hover rounded-xl transition-all"
                        >
                          <FiGrid className="w-4 h-4" /> Dashboard
                        </Link>

                        {(isAdmin || isContentManager) && (
                          <Link
                            href="/content-manager"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-surface-hover rounded-xl transition-all"
                          >
                            <FiEdit3 className="w-4 h-4" /> Manage Blog
                          </Link>
                        )}

                        {(isAdmin || isContentManager || isInstructor) && (
                          <Link
                            href="/instructor"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-surface-hover rounded-xl transition-all"
                          >
                            <FiBookOpen className="w-4 h-4" /> Manage Courses
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-surface-hover rounded-xl transition-all"
                          >
                            <FiShield className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-black text-error hover:bg-error/10 rounded-xl transition-all mt-1 uppercase tracking-widest"
                        >
                          <FiLogOut className="w-4 h-4" /> Log Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2 bg-surface border border-border p-1 rounded-2xl">
                  <Link
                    href="/login"
                    className={`px-5 py-2.5 text-xs font-black tracking-widest uppercase rounded-xl transition-all duration-300 ${
                      isActive('/login')
                        ? 'bg-primary text-white shadow-md'
                        : 'text-foreground/60 hover:text-foreground hover:bg-surface-hover'
                    }`}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className={`px-5 py-2.5 text-xs font-black tracking-widest uppercase rounded-xl transition-all duration-300 ${
                      isActive('/register')
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    Join Now
                  </Link>
                </div>
              )}

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 md:hidden text-foreground hover:text-primary transition-all duration-300 rounded-xl hover:bg-surface-hover active:scale-90"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mobileOpen ? 'close' : 'open'}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 md:hidden"
                style={{ top: '80px' }}
              />

              {/* Menu */}
              <motion.div
                initial={{ opacity: 0, y: -30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="absolute top-[85px] left-4 right-4 bg-surface border border-border shadow-2xl rounded-[2rem] p-6 md:hidden z-50"
              >
                <div className="flex flex-col gap-4">
                  {/* Nav Links */}
                  <div className="flex flex-col gap-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`px-4 py-3 rounded-2xl text-sm font-black tracking-wide transition-all ${
                          isActive(link.href)
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'hover:bg-surface-hover text-foreground/80'
                        }`}
                      >
                        {link.label.toUpperCase()}
                      </Link>
                    ))}
                    {isAuthenticated && (
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setMobileOpen(false)}
                        className={`px-4 py-3 rounded-2xl text-sm font-black tracking-wide transition-all ${
                          isActive(getDashboardLink())
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'hover:bg-surface-hover text-foreground/80'
                        }`}
                      >
                        DASHBOARD
                      </Link>
                    )}
                  </div>

                  <div className="w-full h-px bg-border" />

                  {/* Auth Actions */}
                  <div className="flex flex-col gap-2">
                    {!isAuthenticated ? (
                      <>
                        <Link
                          href="/login"
                          onClick={() => setMobileOpen(false)}
                          className="w-full py-3 text-center text-sm font-black bg-surface-hover text-foreground rounded-2xl transition-all active:scale-95"
                        >
                          LOG IN
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setMobileOpen(false)}
                          className="w-full py-3 text-center text-sm font-black bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                          JOIN NOW
                        </Link>
                      </>
                    ) : (
                      <button
                        onClick={handleLogout}
                        className="w-full py-3 flex items-center justify-center gap-3 text-sm font-black bg-error/10 text-error rounded-2xl transition-all active:scale-95 tracking-widest"
                      >
                        <FiLogOut className="w-5 h-5" /> LOG OUT
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer to prevent content from going under the fixed navbar */}
      <div className="h-20" />
    </>
  );
}
