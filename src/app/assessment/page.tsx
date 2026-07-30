'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import ScanUpload from '@/components/ScanUpload';
import { insforge } from '@/lib/insforge';
import { useAuth } from '@/lib/auth';

const FUNCTION_URL = process.env.NEXT_PUBLIC_FUNCTION_URL || 'https://iexm7aq7.function2.insforge.app/predict-thyroid';

interface FormData {
  age: string;
  gender: string;
  tsh: string;
  t3: string;
  t4: string;
  freeT3: string;
  freeT4: string;
  symptoms: string[];
}

  const ALL_SYMPTOMS = ['Fatigue', 'Weight gain', 'Weight loss', 'Hair loss', 'Heat intolerance', 'Cold intolerance', 'Neck swelling'];

export default function NewAssessmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormData>({
    age: '', gender: '', tsh: '', t3: '', t4: '', freeT3: '', freeT4: '', symptoms: [],
  });

  const handleScanComplete = useCallback((parsed: Record<string, any>) => {
    setForm((prev) => ({
      ...prev,
      age: parsed.age ?? prev.age,
      gender: parsed.gender ?? prev.gender,
      tsh: parsed.tsh ?? prev.tsh,
      t3: parsed.t3 ?? prev.t3,
      t4: parsed.t4 ?? prev.t4,
      freeT3: parsed.freeT3 ?? prev.freeT3,
      freeT4: parsed.freeT4 ?? prev.freeT4,
      symptoms: parsed.symptoms ? [...new Set([...prev.symptoms, ...parsed.symptoms])] : prev.symptoms,
    }));
  }, []);

  const updateField = (field: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleSymptom = (symptom: string) => {
    setForm((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const numeric = (v: string) => v === '' ? undefined : parseFloat(v);
  const age = numeric(form.age);
  const gender = form.gender;
  const tsh = numeric(form.tsh);
  const t3 = numeric(form.t3);
  const t4 = numeric(form.t4);
  const ft3 = numeric(form.freeT3);
  const ft4 = numeric(form.freeT4);

  const valid =
    age !== undefined && age >= 1 && age <= 120 &&
    !!gender &&
    tsh !== undefined && tsh >= 0 && tsh <= 500 &&
    t3 !== undefined && t3 >= 0 && t3 <= 2000 &&
    t4 !== undefined && t4 >= 0 && t4 <= 100 &&
    ft3 !== undefined && ft3 >= 0 && ft3 <= 50 &&
    ft4 !== undefined && ft4 >= 0 && ft4 <= 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || !user) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age, gender, tsh, t3, t4, freeT3: ft3, freeT4: ft4, symptoms: form.symptoms,
        }),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Prediction failed');

      const { data: assessment, error: dbError } = await insforge.database
        .from('assessments')
        .insert([{
          user_id: user.id,
          age, gender, tsh, t3, t4, free_t3: ft3, free_t4: ft4,
          symptoms: form.symptoms,
          prediction: result.prediction,
          confidence: result.confidence,
          shap_values: result.shapValues,
          recommendation: result.recommendation,
          summary: result.summary,
        }])
        .select('id')
        .single();

      if (dbError) throw new Error(dbError.message);
      router.push(`/assessment/${assessment.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-[800px] mx-auto px-6 py-8 w-full">
        <h1 className="font-[family-name:var(--font-heading)] font-semibold text-2xl text-text mb-1">New Assessment</h1>
        <p className="text-sm text-text-secondary mb-8">Enter your lab values and symptoms for analysis</p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="bg-surface p-8 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <h2 className="font-[family-name:var(--font-heading)] font-semibold text-lg text-text mb-4">Quick Scan</h2>
            <ScanUpload onScanComplete={handleScanComplete} />
          </section>

          <section className="bg-surface p-8 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-5">
            <h2 className="font-[family-name:var(--font-heading)] font-semibold text-lg text-text">Demographics</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-text mb-1.5">Age</label>
                <input
                  id="age" type="number" min={1} max={120} required
                  value={form.age} onChange={(e) => updateField('age', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
                {form.age && (age === undefined || age < 1 || age > 120) && (
                  <p className="mt-1 text-xs text-danger">Age must be between 1 and 120</p>
                )}
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-text mb-1.5">Gender</label>
                <select
                  id="gender" required
                  value={form.gender} onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-surface p-8 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-5">
            <h2 className="font-[family-name:var(--font-heading)] font-semibold text-lg text-text">Lab Values</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { key: 'tsh', label: 'TSH', unit: 'mIU/L', hint: '0.4 - 4.0', min: 0, max: 500 },
                { key: 't3', label: 'T3', unit: 'ng/dL', hint: '80 - 200', min: 0, max: 2000 },
                { key: 't4', label: 'T4', unit: 'µg/dL', hint: '5.0 - 12.0', min: 0, max: 100 },
                { key: 'freeT3', label: 'Free T3', unit: 'pg/mL', hint: '2.3 - 4.2', min: 0, max: 50 },
                { key: 'freeT4', label: 'Free T4', unit: 'ng/dL', hint: '0.8 - 1.8', min: 0, max: 20 },
              ].map(({ key, label, unit, hint, min, max }) => (
                <div key={key}>
                  <label htmlFor={key} className="block text-sm font-medium text-text mb-1.5">
                    {label} <span className="text-text-secondary font-mono text-xs">({unit})</span>
                  </label>
                  <input
                    id={key} type="number" step="any" min={min} max={max} required
                    value={form[key as keyof FormData] as string}
                    onChange={(e) => updateField(key as keyof FormData, e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    placeholder={`e.g. ${hint.split(' ')[0]}`}
                  />
                  <p className="mt-1 text-xs text-text-secondary">Normal range: {hint}</p>
                  {form[key as keyof FormData] && (numeric(form[key as keyof FormData] as string) === undefined || (numeric(form[key as keyof FormData] as string) ?? 0) < min || (numeric(form[key as keyof FormData] as string) ?? 0) > max) && (
                    <p className="mt-1 text-xs text-danger">Value outside realistic range ({min}-{max})</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-surface p-8 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-4">
            <h2 className="font-[family-name:var(--font-heading)] font-semibold text-lg text-text">Symptoms</h2>
            <p className="text-xs text-text-secondary">Select any symptoms you are experiencing (optional)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ALL_SYMPTOMS.map((symptom) => (
                <label
                  key={symptom}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                    form.symptoms.includes(symptom)
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-border bg-white text-text hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.symptoms.includes(symptom)}
                    onChange={() => toggleSymptom(symptom)}
                    className="sr-only"
                  />
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                    {form.symptoms.includes(symptom) ? (
                      <rect width="14" height="14" rx="3" fill="#0F6E6A" />
                    ) : (
                      <rect x="0.5" y="0.5" width="13" height="13" rx="3" stroke="#D1D5DB" />
                    )}
                    {form.symptoms.includes(symptom) && (
                      <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                  </svg>
                  {symptom}
                </label>
              ))}
            </div>
          </section>

          <div className="text-center space-y-4">
            <p className="text-xs text-text-secondary">Your data is private and only visible to you.</p>
            <button
              type="submit"
              disabled={!valid || submitting}
              className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {submitting ? 'Analyzing your results...' : 'Submit Assessment'}
            </button>
          </div>
        </form>
      </main>
    </AuthGuard>
  );
}
