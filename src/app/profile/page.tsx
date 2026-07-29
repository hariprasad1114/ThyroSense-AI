'use client';

import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-[600px] mx-auto px-6 py-8 w-full">
        <h1 className="font-[family-name:var(--font-heading)] font-semibold text-2xl text-text mb-6">Profile Settings</h1>

        <div className="bg-surface p-8 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-5">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Name</label>
            <p className="px-3.5 py-2.5 rounded-lg border border-border bg-gray-50 text-text text-sm">
              {user?.name || 'Not set'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Email</label>
            <p className="px-3.5 py-2.5 rounded-lg border border-border bg-gray-50 text-text text-sm">
              {user?.email || 'Not set'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">User ID</label>
            <p className="px-3.5 py-2.5 rounded-lg border border-border bg-gray-50 text-text text-sm font-mono text-xs">
              {user?.id || 'Not set'}
            </p>
          </div>
          <div className="pt-2 text-xs text-text-secondary leading-relaxed">
            Account management features (password change, email preferences) are coming soon.
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
