'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  if (loading || user) return null;

  return (
    <div className="min-h-screen bg-bg">
      <header className="max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12" stroke="#0F6E6A" strokeWidth="2.5" />
            <path d="M14 6v8l5 3" stroke="#0F6E6A" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="font-[family-name:var(--font-heading)] font-semibold text-xl text-primary">ThyroSense AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text transition-colors rounded-lg">Sign In</Link>
          <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors rounded-lg">Get Started</Link>
        </div>
      </header>

      <main>
        <section className="max-w-[1200px] mx-auto px-6 pt-20 pb-16 text-center">
          <h1 className="font-[family-name:var(--font-heading)] font-semibold text-4xl md:text-5xl text-text leading-tight max-w-3xl mx-auto">
            Intelligent Thyroid Risk Assessment
          </h1>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            Get a data-driven preliminary risk assessment for thyroid disorders based on your lab values and symptoms, with transparent, explainable predictions powered by AI.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/signup" className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors text-sm">
              Start Your Assessment
            </Link>
            <Link href="/login" className="px-6 py-3 border border-border text-text font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Sign In
            </Link>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-surface p-8 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F6E6A" strokeWidth="2" strokeLinecap="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9"/></svg>
              </div>
              <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg text-text">Submit Lab Values</h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">Enter your thyroid panel results (TSH, T3, T4, Free T3, Free T4) along with your symptoms for analysis.</p>
            </div>
            <div className="bg-surface p-8 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F6E6A" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg text-text">Get AI Analysis</h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">Receive an instant prediction with confidence scoring and SHAP-based explanations showing what factors influenced your result.</p>
            </div>
            <div className="bg-surface p-8 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F6E6A" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg text-text">Download Report</h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">Generate a professional PDF report of your assessment to share with your healthcare provider.</p>
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-6 py-16 text-center">
          <h2 className="font-[family-name:var(--font-heading)] font-semibold text-2xl text-text mb-2">Meet Our Team</h2>
          <p className="text-sm text-text-secondary mb-10">Students of KL University who built ThyroSense AI</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-light flex items-center justify-center">
                <span className="font-[family-name:var(--font-heading)] font-bold text-primary text-xl">JK</span>
              </div>
              <h3 className="font-medium text-text">Jangiti Kusumeswari</h3>
              <p className="text-xs text-text-secondary mt-1">Developer</p>
            </div>
            <div className="bg-surface p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-light flex items-center justify-center">
                <span className="font-[family-name:var(--font-heading)] font-bold text-primary text-xl">CH</span>
              </div>
              <h3 className="font-medium text-text">Challa Haritha</h3>
              <p className="text-xs text-text-secondary mt-1">Developer</p>
            </div>
            <div className="bg-surface p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-light flex items-center justify-center">
                <span className="font-[family-name:var(--font-heading)] font-bold text-primary text-xl">BK</span>
              </div>
              <h3 className="font-medium text-text">Boreddy Keerthi Reddy</h3>
              <p className="text-xs text-text-secondary mt-1">Developer</p>
            </div>
            <div className="bg-surface p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-light flex items-center justify-center">
                <span className="font-[family-name:var(--font-heading)] font-bold text-primary text-xl">KM</span>
              </div>
              <h3 className="font-medium text-text">Karur Mohammed Sameer Basha</h3>
              <p className="text-xs text-text-secondary mt-1">Developer</p>
            </div>
          </div>
        </section>

        <section className="bg-primary text-white py-12">
          <div className="max-w-[1200px] mx-auto px-6 text-center">
            <p className="text-sm opacity-80 max-w-2xl mx-auto leading-relaxed">
              <strong>Medical Disclaimer:</strong> ThyroSense AI is an educational decision-support tool only. It provides a preliminary risk assessment based on your inputs and is not a substitute for professional medical diagnosis, advice, or treatment. Always consult a qualified healthcare provider for any health concerns.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
