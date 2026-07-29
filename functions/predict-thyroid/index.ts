interface AssessmentInput {
  age: number;
  gender: string;
  tsh: number;
  t3: number;
  t4: number;
  freeT3: number;
  freeT4: number;
  symptoms: string[];
}

interface ShapValue {
  feature: string;
  value: number;
  contribution: number;
}

interface PredictionResult {
  prediction: 'Normal' | 'Hypothyroidism' | 'Hyperthyroidism';
  confidence: number;
  shapValues: ShapValue[];
  recommendation: string;
  summary: string;
}

const NORMAL_TSH = { min: 0.4, max: 4.0 };
const NORMAL_T3 = { min: 80, max: 200 };
const NORMAL_T4 = { min: 5.0, max: 12.0 };
const NORMAL_FT3 = { min: 2.3, max: 4.2 };
const NORMAL_FT4 = { min: 0.8, max: 1.8 };

export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const input: AssessmentInput = await req.json();

    if (!input.tsh || !input.t3 || !input.t4 || !input.freeT3 || !input.freeT4) {
      return new Response(JSON.stringify({ error: 'Missing required lab values' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = predictThyroid(input);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

function predictThyroid(input: AssessmentInput): PredictionResult {
  const features = extractFeatures(input);
  const { hypoScore, hyperScore, normalScore } = computeScores(features);
  const shapValues = computeShap(features, hypoScore, hyperScore, normalScore);

  let prediction: 'Normal' | 'Hypothyroidism' | 'Hyperthyroidism';
  let confidence: number;

  if (hypoScore > hyperScore && hypoScore > normalScore) {
    prediction = 'Hypothyroidism';
    confidence = Math.round((hypoScore / (hypoScore + hyperScore + normalScore)) * 100);
  } else if (hyperScore > hypoScore && hyperScore > normalScore) {
    prediction = 'Hyperthyroidism';
    confidence = Math.round((hyperScore / (hypoScore + hyperScore + normalScore)) * 100);
  } else {
    prediction = 'Normal';
    confidence = Math.round((normalScore / (hypoScore + hyperScore + normalScore)) * 100);
  }

  const sortedShap = [...shapValues].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const topFactors = sortedShap.slice(0, 2);

  const summary = generateSummary(prediction, topFactors, input);
  const recommendation = getRecommendation(prediction, confidence, input);

  return { prediction, confidence, shapValues, recommendation, summary };
}

function extractFeatures(input: AssessmentInput) {
  return {
    tshHigh: Math.max(0, input.tsh - NORMAL_TSH.max),
    tshLow: Math.max(0, NORMAL_TSH.min - input.tsh),
    t3High: Math.max(0, input.t3 - NORMAL_T3.max),
    t3Low: Math.max(0, NORMAL_T3.min - input.t3),
    t4High: Math.max(0, input.t4 - NORMAL_T4.max),
    t4Low: Math.max(0, NORMAL_T4.min - input.t4),
    ft3High: Math.max(0, input.freeT3 - NORMAL_FT3.max),
    ft3Low: Math.max(0, NORMAL_FT3.min - input.freeT3),
    ft4High: Math.max(0, input.freeT4 - NORMAL_FT4.max),
    ft4Low: Math.max(0, NORMAL_FT4.min - input.freeT4),
    hasFatigue: input.symptoms.includes('Fatigue') ? 1 : 0,
    hasWeightGain: input.symptoms.includes('Weight gain') ? 1 : 0,
    hasWeightLoss: input.symptoms.includes('Weight loss') ? 1 : 0,
    hasHairLoss: input.symptoms.includes('Hair loss') ? 1 : 0,
    hasHeatIntolerance: input.symptoms.includes('Heat intolerance') ? 1 : 0,
    hasColdIntolerance: input.symptoms.includes('Cold intolerance') ? 1 : 0,
    hasNeckSwelling: input.symptoms.includes('Neck swelling') ? 1 : 0,
  };
}

function computeScores(f: ReturnType<typeof extractFeatures>) {
  const hypoScore =
    f.tshHigh * 3.5 + f.t4Low * 2.0 + f.t3Low * 1.5 + f.ft4Low * 1.8 + f.ft3Low * 1.2 +
    f.hasFatigue * 0.8 + f.hasWeightGain * 1.2 + f.hasHairLoss * 0.6 + f.hasColdIntolerance * 1.0 + f.hasNeckSwelling * 0.5;

  const hyperScore =
    f.tshLow * 3.0 + f.t4High * 2.2 + f.t3High * 1.8 + f.ft4High * 2.0 + f.ft3High * 1.5 +
    f.hasFatigue * 0.5 + f.hasWeightLoss * 1.2 + f.hasHeatIntolerance * 1.0 + f.hasHairLoss * 0.4 + f.hasNeckSwelling * 0.3;

  const deviationPenalty = f.tshHigh * 0.3 + f.tshLow * 0.3 + f.t4High * 0.2 + f.t4Low * 0.2 + f.t3High * 0.15 + f.t3Low * 0.15;
  const normalScore = Math.max(0, 10 - deviationPenalty);

  return { hypoScore, hyperScore, normalScore };
}

function computeShap(f: ReturnType<typeof extractFeatures>, _hypoScore: number, _hyperScore: number, _normalScore: number): ShapValue[] {
  return [
    { feature: 'TSH', value: f.tshHigh > 0 ? NORMAL_TSH.max + f.tshHigh : NORMAL_TSH.min - f.tshLow, contribution: Math.round(((f.tshHigh - f.tshLow) * 0.8) * 10) / 10 },
    { feature: 'T3', value: f.t3High > 0 ? NORMAL_T3.max + f.t3High : NORMAL_T3.min - f.t3Low, contribution: Math.round(((f.t3High - f.t3Low) * 0.5) * 10) / 10 },
    { feature: 'T4', value: f.t4High > 0 ? NORMAL_T4.max + f.t4High : NORMAL_T4.min - f.t4Low, contribution: Math.round(((f.t4High - f.t4Low) * 0.6) * 10) / 10 },
    { feature: 'Free T3', value: f.ft3High > 0 ? NORMAL_FT3.max + f.ft3High : NORMAL_FT3.min - f.ft3Low, contribution: Math.round(((f.ft3High - f.ft3Low) * 0.4) * 10) / 10 },
    { feature: 'Free T4', value: f.ft4High > 0 ? NORMAL_FT4.max + f.ft4High : NORMAL_FT4.min - f.ft4Low, contribution: Math.round(((f.ft4High - f.ft4Low) * 0.7) * 10) / 10 },
    { feature: 'Fatigue', value: f.hasFatigue, contribution: f.hasFatigue * 0.6 },
    { feature: 'Weight change', value: Math.max(f.hasWeightGain, f.hasWeightLoss), contribution: Math.max(f.hasWeightGain, f.hasWeightLoss) * 0.8 },
    { feature: 'Temperature intolerance', value: Math.max(f.hasHeatIntolerance, f.hasColdIntolerance), contribution: Math.max(f.hasHeatIntolerance, f.hasColdIntolerance) * 0.7 },
    { feature: 'Neck swelling', value: f.hasNeckSwelling, contribution: f.hasNeckSwelling * 0.4 },
    { feature: 'Hair loss', value: f.hasHairLoss, contribution: f.hasHairLoss * 0.3 },
  ];
}

function generateSummary(prediction: string, topFactors: ShapValue[], _input: AssessmentInput): string {
  if (topFactors.length === 0) return `Based on your lab values, the assessment indicates ${prediction.toLowerCase()}.`;
  const f1 = topFactors[0];
  const d1 = f1.contribution > 0 ? 'elevated' : 'low';
  let sentence = `Your ${f1.feature} (${d1} at ${f1.value}) was the strongest contributor to this result.`;
  if (topFactors.length > 1) {
    const f2 = topFactors[1];
    const d2 = f2.contribution > 0 ? 'elevated' : 'low';
    sentence += ` Additionally, your ${f2.feature} (${d2} at ${f2.value}) played a significant role.`;
  }
  return sentence;
}

function getRecommendation(prediction: string, confidence: number, _input: AssessmentInput): string {
  if (prediction === 'Normal') return 'Your results fall within the normal range. Continue regular health checkups and maintain a balanced lifestyle. If you experience any persistent symptoms, consult your healthcare provider.';
  if (prediction === 'Hypothyroidism') {
    return confidence > 75
      ? 'Your results strongly suggest hypothyroidism. Please consult an endocrinologist promptly for a comprehensive evaluation.'
      : 'Your results suggest possible hypothyroidism. Consider scheduling an appointment with your healthcare provider for further testing.';
  }
  return confidence > 75
    ? 'Your results strongly suggest hyperthyroidism. Please consult an endocrinologist promptly.'
    : 'Your results suggest possible hyperthyroidism. Consider scheduling an appointment with your healthcare provider.';
}
