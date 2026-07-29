# ThyroSense AI

Intelligent thyroid disease prediction and clinical decision-support system with explainable AI.

This is an educational decision-support tool that provides a data-driven preliminary risk assessment for thyroid disorders (Normal / Hypothyroidism / Hyperthyroidism) based on lab values and symptoms, with transparent, explainable predictions.

## Accuracy

The prediction engine uses a multi-factor weighted scoring algorithm based on established clinical markers:

- **TSH deviation** from normal range (0.4–4.0 mIU/L) — highest weight
- **T3, T4, Free T3, Free T4** deviations from their respective normal ranges
- **Symptom correlation** — hypothyroid symptoms (fatigue, weight gain, cold intolerance) vs. hyperthyroid symptoms (weight loss, heat intolerance)

The scoring model assigns weighted contributions to each factor based on clinical significance and returns a confidence percentage reflecting how strongly the input patterns match each thyroid state.

## Example Results

**Hypothyroidism (high confidence)**
```
Input:  TSH=25, T3=60, T4=3.5, Free T3=1.8, Free T4=0.6
Symptoms: Fatigue, Weight gain, Cold intolerance
→ Prediction: Hypothyroidism (99% confidence)
→ Top factors: TSH (+16.8), T3 (-10.0)
→ Summary: "Your elevated TSH and low T3 were the strongest contributors."
→ Recommendation: Consult an endocrinologist promptly.
```

**Normal (high confidence)**
```
Input:  TSH=2.1, T3=140, T4=8.5, Free T3=3.2, Free T4=1.3
Symptoms: None
→ Prediction: Normal (100% confidence)
→ Summary: All values within normal range.
→ Recommendation: Continue regular checkups.
```

**Hyperthyroidism (high confidence)**
```
Input:  TSH=0.05, T3=350, T4=18, Free T3=7.5, Free T4=3.2
Symptoms: Weight loss, Heat intolerance, Hair loss
→ Prediction: Hyperthyroidism (98% confidence)
→ Top factors: TSH (-15.2), T4 (+12.8)
→ Recommendation: Consult an endocrinologist promptly.
```

## Team

Built by students of **Annamacharya University**:

| Name | Role |
|------|------|
| Jangiti Kusumeswari | Frontend Developer |
| Challa Haritha | Backend Developer |
| Boreddy Keerthi Reddy | Full Stack Developer |
| Karur Mohammed Sameer Basha | ML & AI Developer |

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
