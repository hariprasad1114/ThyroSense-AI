'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import RiskBadge from '@/components/RiskBadge';
import ShapChart from '@/components/ShapChart';
import { insforge } from '@/lib/insforge';
import { formatDate } from '@/lib/utils';
import { getRiskColor } from '@/lib/utils';

interface AssessmentData {
  id: string;
  age: number; gender: string;
  tsh: number; t3: number; t4: number;
  free_t3: number; free_t4: number;
  symptoms: string[];
  prediction: string;
  confidence: number;
  shap_values: { feature: string; value: number; contribution: number }[];
  recommendation: string;
  summary: string;
  created_at: string;
}

export default function HistoryDetailPage() {
  const params = useParams();
  const [data, setData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const { data: assessment, error: dbError } = await insforge.database
        .from('assessments')
        .select('*')
        .eq('id', params.id)
        .single();
      if (dbError) setError(dbError.message);
      else setData(assessment as unknown as AssessmentData);
      setLoading(false);
    };
    fetch();
  }, [params.id]);

  if (loading) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 animate-pulse-soft">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-text-secondary">Loading...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !data) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary text-sm">{error || 'Assessment not found'}</p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-[800px] mx-auto px-6 py-8 w-full">
        <div className="animate-fade-slide-up space-y-6">
          <div className="bg-surface p-8 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-text-secondary mb-1">{formatDate(data.created_at)}</p>
                <RiskBadge prediction={data.prediction} />
              </div>
              <span className="text-sm font-mono text-text-secondary">{data.confidence}% confidence</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-text-secondary">Age:</span> {data.age}</div>
              <div><span className="text-text-secondary">Gender:</span> {data.gender}</div>
              <div><span className="text-text-secondary">TSH:</span> {data.tsh} mIU/L</div>
              <div><span className="text-text-secondary">T3:</span> {data.t3} ng/dL</div>
              <div><span className="text-text-secondary">T4:</span> {data.t4} µg/dL</div>
              <div><span className="text-text-secondary">Free T3:</span> {data.free_t3} pg/mL</div>
              <div><span className="text-text-secondary">Free T4:</span> {data.free_t4} ng/dL</div>
              <div className="md:col-span-2">
                <span className="text-text-secondary">Symptoms:</span> {data.symptoms?.length ? data.symptoms.join(', ') : 'None reported'}
              </div>
            </div>
          </div>

          <div className="bg-surface p-8 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <ShapChart shapValues={data.shap_values} prediction={data.prediction} />
          </div>

          <div className="bg-surface p-8 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg text-text mb-3">Summary</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{data.summary}</p>
          </div>

          <div
            className="p-6 rounded-xl border-2"
            style={{
              backgroundColor: `${getRiskColor(data.prediction)}0D`,
              borderColor: `${getRiskColor(data.prediction)}30`,
            }}
          >
            <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg text-text mb-2">Recommendation</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{data.recommendation}</p>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
            <strong>Disclaimer:</strong> This is an educational decision-support tool and not a substitute for professional medical diagnosis.
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
