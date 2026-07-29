'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import ConfidenceRing from '@/components/ConfidenceRing';
import RiskBadge from '@/components/RiskBadge';
import ShapChart from '@/components/ShapChart';
import { insforge } from '@/lib/insforge';
import { getRiskColor, formatDate } from '@/lib/utils';

interface AssessmentData {
  id: string;
  age: number;
  gender: string;
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

export default function AssessmentResultPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      const { data: assessment, error: dbError } = await insforge.database
        .from('assessments')
        .select('*')
        .eq('id', params.id)
        .single();
      if (dbError) setError(dbError.message);
      else setData(assessment as unknown as AssessmentData);
      setLoading(false);
    };
    fetchAssessment();
  }, [params.id]);

  const downloadPdf = async () => {
    if (!data || !reportRef.current) return;
    setPdfLoading(true);
    try {
      const chartEl = reportRef.current.querySelector('#shap-chart') as HTMLElement | null;
      let chartImg = '';
      if (chartEl) chartImg = await toPng(chartEl, { quality: 0.95, backgroundColor: '#ffffff' });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = 190;
      let y = 20;

      pdf.setFontSize(22);
      pdf.setTextColor(15, 110, 106);
      pdf.text('ThyroSense AI', pageW / 2, y, { align: 'center' });
      y += 8;
      pdf.setFontSize(9);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Generated: ${formatDate(new Date().toISOString())}`, pageW / 2, y, { align: 'center' });
      y += 6;

      pdf.setDrawColor(229, 231, 235);
      pdf.line(10, y, 200, y);
      y += 8;

      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Assessment Result', 10, y);
      y += 8;

      pdf.setFontSize(14);
      const color = getRiskColor(data.prediction);
      pdf.setTextColor(
        parseInt(color.slice(1, 3), 16),
        parseInt(color.slice(3, 5), 16),
        parseInt(color.slice(5, 7), 16)
      );
      pdf.text(`Prediction: ${data.prediction}`, 10, y);
      y += 7;
      pdf.setFontSize(11);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Confidence: ${data.confidence}%`, 10, y);
      y += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Patient Inputs', 10, y);
      y += 7;
      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);

      const inputs = [
        ['Age', String(data.age)],
        ['Gender', data.gender],
        ['TSH', `${data.tsh} mIU/L`],
        ['T3', `${data.t3} ng/dL`],
        ['T4', `${data.t4} µg/dL`],
        ['Free T3', `${data.free_t3} pg/mL`],
        ['Free T4', `${data.free_t4} ng/dL`],
        ['Symptoms', data.symptoms?.join(', ') || 'None'],
      ];
      for (const [label, val] of inputs) {
        pdf.text(`${label}: ${val}`, 15, y);
        y += 5.5;
      }
      y += 5;

      if (chartImg) {
        if (y + 80 > 280) { pdf.addPage(); y = 20; }
        pdf.setFontSize(12);
        pdf.setTextColor(31, 41, 55);
        pdf.text('Feature Contributions (SHAP)', 10, y);
        y += 5;
        pdf.addImage(chartImg, 'PNG', 10, y, 180, 70);
        y += 75;
      }

      if (y + 20 > 280) { pdf.addPage(); y = 20; }
      pdf.setFontSize(12);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Recommendation', 10, y);
      y += 7;
      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);
      const lines = pdf.splitTextToSize(data.recommendation, 180);
      pdf.text(lines, 10, y);
      y += lines.length * 5 + 10;

      if (y + 30 > 280) { pdf.addPage(); y = 20; }
      pdf.setFontSize(9);
      pdf.setTextColor(156, 163, 175);
      const disc = 'This is an educational tool and not a substitute for professional medical diagnosis.';
      const discLines = pdf.splitTextToSize(disc, 180);
      pdf.text(discLines, 10, y);

      pdf.save(`ThyroSense-Report-${data.id.slice(0, 8)}.pdf`);
    } catch {
      // silently fail
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 animate-pulse-soft">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-text-secondary">Loading your results...</p>
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
          <div className="text-center">
            <p className="text-text-secondary text-sm">{error || 'Assessment not found'}</p>
            <button onClick={() => router.push('/dashboard')} className="mt-4 text-primary text-sm font-medium hover:underline">
              Back to Dashboard
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-[800px] mx-auto px-6 py-8 w-full" ref={reportRef}>
        <div className="animate-fade-slide-up space-y-6">
          <div className="bg-surface p-8 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] text-center">
            <div className="mb-4">
              <RiskBadge prediction={data.prediction} />
            </div>
            <div className="flex justify-center mb-4 relative">
              <ConfidenceRing confidence={data.confidence} prediction={data.prediction} size={160} />
            </div>
            <p className="text-sm text-text-secondary mt-4">{formatDate(data.created_at)}</p>
          </div>

          <div className="bg-surface p-8 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div id="shap-chart">
              <ShapChart shapValues={data.shap_values} prediction={data.prediction} />
            </div>
          </div>

          <div className="bg-surface p-8 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg text-text mb-3">Summary</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{data.summary}</p>
          </div>

          <div
            className="p-6 rounded-xl border-2 animate-fade-slide-up"
            style={{
              backgroundColor: `${getRiskColor(data.prediction)}0D`,
              borderColor: `${getRiskColor(data.prediction)}30`,
            }}
          >
            <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg text-text mb-2">Recommendation</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{data.recommendation}</p>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
            <strong>Disclaimer:</strong> This is an educational decision-support tool and not a substitute for professional medical diagnosis. Always consult a qualified healthcare provider for any health concerns.
          </div>

          <div className="flex items-center justify-center gap-4 pb-8">
            <button
              onClick={downloadPdf}
              disabled={pdfLoading}
              className="px-5 py-2.5 border border-primary text-primary font-medium rounded-lg hover:bg-primary-light transition-colors text-sm disabled:opacity-50"
            >
              {pdfLoading ? 'Generating PDF...' : 'Download PDF Report'}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-5 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
