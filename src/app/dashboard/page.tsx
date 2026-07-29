'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import RiskBadge from '@/components/RiskBadge';
import { insforge } from '@/lib/insforge';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';

interface Assessment {
  id: string;
  prediction: string;
  confidence: number;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [stats, setStats] = useState({ total: 0, avgConfidence: 0, mostCommon: '-' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      const { data, error } = await insforge.database
        .from('assessments')
        .select('id, prediction, confidence, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setAssessments(data);
        const total = data.length;
        const avg = total > 0 ? Math.round(data.reduce((s, a) => s + a.confidence, 0) / total) : 0;
        const counts: Record<string, number> = {};
        data.forEach((a) => { counts[a.prediction] = (counts[a.prediction] || 0) + 1; });
        const most = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
        setStats({ total, avgConfidence: avg, mostCommon: most });
      }
      setLoading(false);
    };
    fetchAssessments();
  }, []);

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] font-semibold text-2xl text-text">
              Welcome{user?.name ? `, ${user.name}` : ''}
            </h1>
            <p className="text-sm text-text-secondary mt-1">Your thyroid assessment dashboard</p>
          </div>
          <Link
            href="/assessment"
            className="px-5 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors text-sm"
          >
            New Assessment
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Total Assessments</p>
            <p className="mt-2 font-[family-name:var(--font-heading)] font-bold text-3xl text-text">
              {loading ? '...' : stats.total}
            </p>
          </div>
          <div className="bg-surface p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Avg Confidence</p>
            <p className="mt-2 font-[family-name:var(--font-heading)] font-bold text-3xl text-text">
              {loading ? '...' : `${stats.avgConfidence}%`}
            </p>
          </div>
          <div className="bg-surface p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Most Common Result</p>
            <p className="mt-2">
              {loading ? (
                <span className="text-text-secondary">...</span>
              ) : stats.mostCommon !== '-' ? (
                <RiskBadge prediction={stats.mostCommon} />
              ) : (
                <span className="text-text-secondary text-sm">No results yet</span>
              )}
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-text">Recent Assessments</h2>
            <Link href="/history" className="text-sm text-primary font-medium hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="p-12 text-center text-text-secondary text-sm animate-pulse-soft">Loading...</div>
          ) : assessments.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p className="text-text-secondary text-sm">No assessments yet</p>
              <p className="text-text-secondary text-xs mt-1">Start a new assessment to see your results here</p>
              <Link href="/assessment" className="inline-block mt-4 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors">
                Start Assessment
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {assessments.map((a) => (
                <Link key={a.id} href={`/history/${a.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <RiskBadge prediction={a.prediction} />
                    <span className="text-sm font-mono text-text-secondary">{a.confidence}% confidence</span>
                  </div>
                  <span className="text-xs text-text-secondary">{formatDate(a.created_at)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
          <strong>Disclaimer:</strong> This is an educational decision-support tool and not a substitute for professional medical diagnosis. Always consult a qualified healthcare provider.
        </div>
      </main>
    </AuthGuard>
  );
}
