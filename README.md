# ThyroSense AI

Intelligent thyroid disease prediction and clinical decision-support system with explainable AI.

This is an educational decision-support tool that provides a data-driven preliminary risk assessment for thyroid disorders (Normal / Hypothyroidism / Hyperthyroidism) based on lab values and symptoms, with transparent, explainable predictions.

## Features

- **Predictive Assessment** — Multi-factor analysis using TSH, T3, T4, Free T3, Free T4, and symptoms
- **Explainable AI** — SHAP-style feature contribution chart showing what drove each prediction
- **Confidence Scoring** — Animated circular progress ring for prediction confidence
- **PDF Reports** — Professional downloadable reports suitable for sharing with healthcare providers
- **User Accounts** — Email/password and Google OAuth sign-in via InsForge auth
- **Assessment History** — Full history with filtering by result type
- **Analytics Dashboard** — Charts for risk distribution, age/gender demographics, symptom frequency
- **Responsive Design** — Clinical, calm UI with teal/coral/amber palette, fully mobile-responsive

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/) |
| Backend | [InsForge](https://insforge.dev) (PostgreSQL, auth, edge functions, storage) |
| Edge Function | Deno-based prediction engine with SHAP explanations |
| Charts | [Chart.js](https://www.chartjs.org/) (analytics), [Recharts](https://recharts.org/) |
| PDF | [jsPDF](https://github.com/parallax/jsPDF) + [html-to-image](https://github.com/bubkoo/html-to-image) |

## Screens

- Landing page with disclaimer and feature overview
- Sign Up / Login (email+password or Google OAuth)
- Dashboard with stats and recent assessments
- New Assessment form (demographics, 5 lab values, 7 symptoms)
- Result page with confidence ring, SHAP chart, recommendation
- History list (filterable) and detail pages
- Analytics dashboard with charts
- Profile settings

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_INSFORGE_URL=https://your-app.region.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=anon_your_key
NEXT_PUBLIC_FUNCTION_URL=https://your-app.function2.insforge.app/predict-thyroid
```

## Disclaimer

This is an educational decision-support tool and **not a substitute for professional medical diagnosis**. Always consult a qualified healthcare provider for any health concerns.
