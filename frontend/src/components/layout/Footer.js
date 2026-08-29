'use client';

import Link from 'next/link';
import { FiBookOpen, FiGithub, FiMail, FiHeart } from 'react-icons/fi';

/**
 * Footer — Matching footer with links, socials, and branding
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { href: '/courses', label: 'Browse Courses' },
        { href: '/blog', label: 'Blog' },
        { href: '/register', label: 'Get Started' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { href: '#', label: 'Documentation' },
        { href: '#', label: 'API Reference' },
        { href: '#', label: 'Support' },
      ],
    },
    {
      title: 'Company',
      links: [
        { href: '#', label: 'About Us' },
        { href: '#', label: 'Privacy Policy' },
        { href: '#', label: 'Terms of Service' },
      ],
    },
  ];

  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <FiBookOpen className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-foreground">
                Learn<span className="text-primary">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed">
              A modern learning management system built with Next.js and Strapi. Empowering educators and students.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-4">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted hover:text-primary transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted flex items-center gap-1">
            © {currentYear} LearnHub. Built with <FiHeart className="text-error w-3 h-3" /> using Next.js & Strapi
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted hover:text-primary transition-colors">
              <FiGithub className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted hover:text-primary transition-colors">
              <FiMail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
