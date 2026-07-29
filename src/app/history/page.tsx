'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import RiskBadge from '@/components/RiskBadge';
import { insforge } from '@/lib/insforge';
import { formatDate } from '@/lib/utils';

interface Assessment {
  id: string;
  prediction: string;
  confidence: number;
  created_at: string;
}

type Filter = 'All' | 'Normal' | 'Hypothyroidism' | 'Hyperthyroidism';

export default function HistoryPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filter, setFilter] = useState<Filter>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      let query = insforge.database
        .from('assessments')
        .select('id, prediction, confidence, created_at')
        .order('created_at', { ascending: false });

      if (filter !== 'All') query = query.eq('prediction', filter);

      const { data, error } = await query;
      if (!error && data) setAssessments(data);
      setLoading(false);
    };
    fetch();
  }, [filter]);

  const filters: Filter[] = ['All', 'Normal', 'Hypothyroidism', 'Hyperthyroidism'];

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-[1000px] mx-auto px-6 py-8 w-full">
        <h1 className="font-[family-name:var(--font-heading)] font-semibold text-2xl text-text mb-1">Assessment History</h1>
        <p className="text-sm text-text-secondary mb-6">View all your past assessments</p>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-primary text-white' : 'bg-surface text-text-secondary hover:text-text border border-border'
              }`}
            >
              {f === 'All' ? 'All Results' : f}
            </button>
          ))}
        </div>

        <div className="bg-surface rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          {loading ? (
            <div className="p-12 text-center text-text-secondary text-sm animate-pulse-soft">Loading...</div>
          ) : assessments.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-text-secondary text-sm">No assessments found</p>
              <Link href="/assessment" className="inline-block mt-3 text-primary text-sm font-medium hover:underline">
                Start a new assessment
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {assessments.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <RiskBadge prediction={a.prediction} />
                    <span className="text-sm font-mono text-text-secondary">{a.confidence}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary">{formatDate(a.created_at)}</span>
                    <Link href={`/history/${a.id}`} className="text-xs text-primary font-medium hover:underline">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
          <strong>Disclaimer:</strong> This is an educational tool and not a substitute for professional medical diagnosis.
        </div>
      </main>
    </AuthGuard>
  );
}
