'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import RiskBadge from '@/components/RiskBadge';
import { insforge } from '@/lib/insforge';

import { COLORS, RISK_COLORS } from '@/lib/utils';
import {
  Chart as ChartJS,
  ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface Assessment {
  prediction: string;
  confidence: number;
  age: number;
  gender: string;
  symptoms: string[];
  created_at: string;
}

const AGE_BANDS = ['0-18', '19-35', '36-50', '51+'];

export default function AnalyticsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await insforge.database
        .from('assessments')
        .select('prediction, confidence, age, gender, symptoms, created_at');
      if (!error && data) setAssessments(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const total = assessments.length;
  const avgConfidence = total > 0 ? Math.round(assessments.reduce((s, a) => s + a.confidence, 0) / total) : 0;

  const counts: Record<string, number> = {};
  assessments.forEach((a) => { counts[a.prediction] = (counts[a.prediction] || 0) + 1; });
  const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  const riskDistribution = {
    labels: ['Normal', 'Hypothyroidism', 'Hyperthyroidism'],
    datasets: [{
      data: [
        assessments.filter((a) => a.prediction === 'Normal').length,
        assessments.filter((a) => a.prediction === 'Hypothyroidism').length,
        assessments.filter((a) => a.prediction === 'Hyperthyroidism').length,
      ],
      backgroundColor: [RISK_COLORS.Normal, RISK_COLORS.Hypothyroidism, RISK_COLORS.Hyperthyroidism],
      borderWidth: 0,
    }],
  };

  const ageDist = AGE_BANDS.map((band) => {
    const [min, max] = band === '51+' ? [51, 200] : band.split('-').map(Number);
    return assessments.filter((a) => a.age >= min && a.age <= max).length;
  });

  const ageChart = {
    labels: AGE_BANDS,
    datasets: [{
      label: 'Assessments',
      data: ageDist,
      backgroundColor: COLORS.primary,
      borderRadius: 4,
    }],
  };

  const genderDist = {
    labels: ['Male', 'Female', 'Other'],
    datasets: [{
      label: 'Assessments',
      data: ['Male', 'Female', 'Other'].map((g) => assessments.filter((a) => a.gender === g).length),
      backgroundColor: [COLORS.primary, COLORS.secondary, '#9CA3AF'],
      borderRadius: 4,
    }],
  };

  const symptomCounts: Record<string, number> = {};
  assessments.forEach((a) => a.symptoms?.forEach((s) => { symptomCounts[s] = (symptomCounts[s] || 0) + 1; }));
  const sortedSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const _symptomChart = {
    labels: sortedSymptoms.map(([s]) => s),
    datasets: [{
      label: 'Frequency',
      data: sortedSymptoms.map(([, c]) => c),
      backgroundColor: COLORS.primary,
      borderRadius: 4,
    }],
  };

  const volumeByDate: Record<string, number> = {};
  assessments.forEach((a) => {
    const day = a.created_at?.slice(0, 10);
    if (day) volumeByDate[day] = (volumeByDate[day] || 0) + 1;
  });
  const sortedDays = Object.entries(volumeByDate).sort((a, b) => a[0].localeCompare(b[0]));
  const volumeChart = {
    labels: sortedDays.map(([d]) => d.slice(5)),
    datasets: [{
      label: 'Predictions',
      data: sortedDays.map(([, c]) => c),
      borderColor: COLORS.primary,
      backgroundColor: `${COLORS.primary}20`,
      fill: true,
      tension: 0.3,
      pointRadius: 3,
    }],
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#6B7280', font: { size: 11 } } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9CA3AF' } },
      y: { beginAtZero: true, grid: { color: '#F3F4F6' }, ticks: { color: '#9CA3AF', stepSize: 1 } },
    },
  };

  if (loading) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse-soft text-text-secondary text-sm">Loading analytics...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 py-8 w-full">
        <h1 className="font-[family-name:var(--font-heading)] font-semibold text-2xl text-text mb-6">Analytics Dashboard</h1>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Total Predictions</p>
            <p className="mt-2 font-[family-name:var(--font-heading)] font-bold text-3xl text-text">{total}</p>
          </div>
          <div className="bg-surface p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Avg Confidence</p>
            <p className="mt-2 font-[family-name:var(--font-heading)] font-bold text-3xl text-text">{avgConfidence}%</p>
          </div>
          <div className="bg-surface p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Most Common Result</p>
            <p className="mt-2">{mostCommon !== '-' ? <RiskBadge prediction={mostCommon} /> : <span className="text-text-secondary text-sm">N/A</span>}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {total > 0 ? (
            <>
              <div className="bg-surface p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <h3 className="font-semibold text-text text-sm mb-4">Prediction Volume Over Time</h3>
                <div className="h-52"><Bar data={volumeChart} options={chartOpts} /></div>
              </div>
              <div className="bg-surface p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <h3 className="font-semibold text-text text-sm mb-4">Risk Distribution</h3>
                <div className="h-52 flex items-center justify-center">
                  <div className="w-48"><Doughnut data={riskDistribution} options={{ ...chartOpts, cutout: '65%' }} /></div>
                </div>
              </div>
              <div className="bg-surface p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <h3 className="font-semibold text-text text-sm mb-4">Age Distribution</h3>
                <div className="h-52"><Bar data={ageChart} options={chartOpts} /></div>
              </div>
              <div className="bg-surface p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <h3 className="font-semibold text-text text-sm mb-4">Gender Distribution</h3>
                <div className="h-52"><Bar data={genderDist} options={chartOpts} /></div>
              </div>
              <div className="md:col-span-2 bg-surface p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <h3 className="font-semibold text-text text-sm mb-4">Most Common Symptoms</h3>
                {sortedSymptoms.length > 0 ? (
                  <div className="space-y-2">
                    {sortedSymptoms.map(([symptom, count]) => (
                      <div key={symptom} className="flex items-center gap-3">
                        <span className="text-sm text-text-secondary w-36 shrink-0">{symptom}</span>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${(count / sortedSymptoms[0][1]) * 100}%`, backgroundColor: COLORS.primary }}
                          />
                        </div>
                        <span className="text-xs font-mono text-text-secondary w-8 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">No symptom data available</p>
                )}
              </div>
            </>
          ) : (
            <div className="md:col-span-2 bg-surface p-12 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] text-center">
              <p className="text-text-secondary text-sm">No data yet. Complete some assessments to see analytics.</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
          <strong>Disclaimer:</strong> This is an educational tool and not a substitute for professional medical diagnosis.
        </div>
      </main>
    </AuthGuard>
  );
}
