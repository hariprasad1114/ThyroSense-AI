'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import RiskBadge from '@/components/RiskBadge';
import { insforge } from '@/lib/insforge';
import { formatDate, RISK_COLORS } from '@/lib/utils';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

interface Assessment {
  id: string;
  age: number;
  gender: string;
  tsh: number; t3: number; t4: number;
  free_t3: number; free_t4: number;
  symptoms: string[];
  prediction: string;
  confidence: number;
  created_at: string;
}

const LAB_FIELDS = [
  { key: 'tsh', label: 'TSH', unit: 'mIU/L' },
  { key: 't3', label: 'T3', unit: 'ng/dL' },
  { key: 't4', label: 'T4', unit: 'µg/dL' },
  { key: 'free_t3', label: 'Free T3', unit: 'pg/mL' },
  { key: 'free_t4', label: 'Free T4', unit: 'ng/dL' },
];

export default function ComparePage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await insforge.database
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && data) setAssessments(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse-soft text-text-secondary text-sm">Loading comparison data...</div>
        </div>
      </AuthGuard>
    );
  }

  if (assessments.length < 2) {
    return (
      <AuthGuard>
        <Navbar />
        <main className="max-w-[1000px] mx-auto px-6 py-8 w-full text-center">
          <p className="text-text-secondary text-sm">Need at least 2 assessments to compare trends.</p>
          <Link href="/assessment" className="inline-block mt-3 text-primary text-sm font-medium hover:underline">
            Take another assessment
          </Link>
        </main>
      </AuthGuard>
    );
  }

  const labels = assessments.map((a) => formatDate(a.created_at).split(',')[0]);
  const predictions = assessments.map((a) => a.prediction);
  const confidences = assessments.map((a) => a.confidence);

  const labChartData = {
    labels,
    datasets: LAB_FIELDS.map((field, i) => ({
      label: field.label,
      data: assessments.map((a) => (a as any)[field.key] as number),
      borderColor: ['#0F6E6A', '#E8836B', '#4C9A72', '#D9A441', '#6B7280'][i],
      backgroundColor: ['#0F6E6A20', '#E8836B20', '#4C9A7220', '#D9A44120', '#6B728020'][i],
      borderWidth: 2,
      fill: false,
      tension: 0.3,
      pointRadius: 4,
    })),
  };

  const confidenceChartData = {
    labels,
    datasets: [
      {
        label: 'Confidence %',
        data: confidences,
        backgroundColor: confidences.map((_, i) => {
          const p = predictions[i];
          return p === 'Normal' ? RISK_COLORS.Normal : p === 'Hypothyroidism' ? RISK_COLORS.Hypothyroidism : RISK_COLORS.Hyperthyroidism;
        }),
        borderRadius: 4,
      },
    ],
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#6B7280', font: { size: 11 } } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9CA3AF', maxRotation: 45 } },
      y: { beginAtZero: true, grid: { color: '#F3F4F6' }, ticks: { color: '#9CA3AF' } },
    },
  };

  const first = assessments[0];
  const last = assessments[assessments.length - 1];
  const improved = last.confidence > first.confidence;
  const trend = last.prediction !== first.prediction ? 'changed' : 'stable';

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-[1000px] mx-auto px-6 py-8 w-full">
        <h1 className="font-[family-name:var(--font-heading)] font-semibold text-2xl text-text mb-1">Trend Comparison</h1>
        <p className="text-sm text-text-secondary mb-6">Track how your thyroid health is changing over time</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface p-5 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <p className="text-xs text-text-secondary uppercase tracking-wider">Assessments</p>
            <p className="mt-1 font-[family-name:var(--font-heading)] font-bold text-2xl text-text">{assessments.length}</p>
          </div>
          <div className="bg-surface p-5 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <p className="text-xs text-text-secondary uppercase tracking-wider">First Result</p>
            <p className="mt-1"><RiskBadge prediction={first.prediction} /></p>
          </div>
          <div className="bg-surface p-5 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <p className="text-xs text-text-secondary uppercase tracking-wider">Latest Result</p>
            <p className="mt-1"><RiskBadge prediction={last.prediction} /></p>
          </div>
          <div className="bg-surface p-5 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <p className="text-xs text-text-secondary uppercase tracking-wider">Status</p>
            <p className="mt-1 text-sm font-medium" style={{ color: trend === 'changed' ? '#D9A441' : '#4C9A72' }}>
              {trend === 'changed' ? 'Condition changed' : 'Stable'}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <h3 className="font-semibold text-text text-sm mb-4">Lab Values Over Time</h3>
            <div className="h-72"><Bar data={labChartData} options={chartOpts} /></div>
          </div>
          <div className="bg-surface p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <h3 className="font-semibold text-text text-sm mb-4">Confidence Trend</h3>
            <div className="h-72"><Bar data={confidenceChartData} options={chartOpts} /></div>
          </div>
        </div>

        <div className="bg-surface rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-text">All Assessments Timeline</h3>
          </div>
          <div className="divide-y divide-border">
            {[...assessments].reverse().map((a, idx) => {
              const prev = idx < assessments.length - 1 ? [...assessments].reverse()[idx + 1] : null;
              let change = '';
              if (prev) {
                const diff = ((a as any).tsh as number) - (prev as any).tsh;
                change = diff > 0 ? `TSH +${diff.toFixed(1)}` : diff < 0 ? `TSH ${diff.toFixed(1)}` : '';
              }
              return (
                <div key={a.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-text-secondary w-24 shrink-0">{formatDate(a.created_at)}</span>
                    <RiskBadge prediction={a.prediction} />
                    <span className="text-sm font-mono text-text-secondary">{a.confidence}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {change && <span className="text-xs text-text-secondary">{change}</span>}
                    <Link href={`/history/${a.id}`} className="text-xs text-primary font-medium hover:underline">View</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
          <strong>Disclaimer:</strong> This is an educational tool and not a substitute for professional medical diagnosis.
        </div>
      </main>
    </AuthGuard>
  );
}
