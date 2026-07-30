'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/assessment', label: 'New Assessment' },
  { href: '/history', label: 'History' },
  { href: '/compare', label: 'Compare' },
  { href: '/analytics', label: 'Analytics' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke="#0F6E6A" strokeWidth="2.5" />
              <path d="M14 6v8l5 3" stroke="#0F6E6A" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span className="font-[family-name:var(--font-heading)] font-semibold text-lg text-primary">ThyroSense AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-primary-light text-primary'
                    : 'text-text-secondary hover:text-text hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/profile" className="text-sm text-text-secondary hover:text-text transition-colors">
            {user?.name || user?.email || 'Profile'}
          </Link>
          <button
            onClick={signOut}
            className="text-sm text-text-secondary hover:text-danger transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
