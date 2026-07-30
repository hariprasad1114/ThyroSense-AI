'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import RiskBadge from '@/components/RiskBadge';
import ShapChart from '@/components/ShapChart';
import { insforge } from '@/lib/insforge';
import { formatDate } from '@/lib/utils';
import { generateAssessmentPdf } from '@/lib/pdf';

interface Assessment {
  id: string;
  prediction: string;
  confidence: number;
  created_at: string;
}

type Filter = 'All' | 'Normal' | 'Hypothyroidism' | 'Hyperthyroidism';

export default function HistoryPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [allData, setAllData] = useState<Record<string, any>>({});
  const [filter, setFilter] = useState<Filter>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const chartRefs = useRef<Record<string, HTMLDivElement>>({});

  const fetchData = async () => {
    setLoading(true);
    let query = insforge.database
      .from('assessments')
      .select('id, prediction, confidence, created_at')
      .order('created_at', { ascending: false });

    if (filter !== 'All') query = query.eq('prediction', filter);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo + 'T23:59:59Z');

    const { data, error } = await query;
    if (!error && data) setAssessments(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filter, dateFrom, dateTo]);

  const downloadPdf = async (id: string) => {
    setPdfLoading(id);
    if (!allData[id]) {
      const { data } = await insforge.database.from('assessments').select('*').eq('id', id).single();
      if (data) setAllData((prev) => ({ ...prev, [id]: data }));
    }
    const assmt = allData[id];
    if (!assmt) { setPdfLoading(null); return; }
    const chartEl = chartRefs.current[id];
    await generateAssessmentPdf(assmt, chartEl);
    setPdfLoading(null);
  };

  const filters: Filter[] = ['All', 'Normal', 'Hypothyroidism', 'Hyperthyroidism'];

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-[1000px] mx-auto px-6 py-8 w-full">
        <h1 className="font-[family-name:var(--font-heading)] font-semibold text-2xl text-text mb-1">Assessment History</h1>
        <p className="text-sm text-text-secondary mb-6">View all your past assessments</p>

        <div className="flex flex-wrap items-center gap-3 mb-6">
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
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-secondary">From:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-border text-sm text-text bg-white"
            />
            <label className="text-xs text-text-secondary">To:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-border text-sm text-text bg-white"
            />
          </div>
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
                  <Link href={`/history/${a.id}`} className="flex items-center gap-4 flex-1 hover:opacity-80">
                    <RiskBadge prediction={a.prediction} />
                    <span className="text-sm font-mono text-text-secondary">{a.confidence}%</span>
                  </Link>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary">{formatDate(a.created_at)}</span>
                    <Link href={`/history/${a.id}`} className="text-xs text-primary font-medium hover:underline">View</Link>
                    <button
                      onClick={() => downloadPdf(a.id)}
                      disabled={pdfLoading === a.id}
                      className="text-xs text-primary font-medium hover:underline disabled:opacity-50"
                    >
                      {pdfLoading === a.id ? 'Generating...' : 'Download PDF'}
                    </button>
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
