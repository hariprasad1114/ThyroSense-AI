'use client';

import { getRiskColor } from '@/lib/utils';

interface ShapValue {
  feature: string;
  value: number;
  contribution: number;
}

interface Props {
  shapValues: ShapValue[];
  prediction: string;
}

export default function ShapChart({ shapValues, prediction }: Props) {
  const sorted = [...shapValues].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const maxAbs = Math.max(...sorted.map((s) => Math.abs(s.contribution)), 1);
  const color = getRiskColor(prediction);

  return (
    <div className="space-y-3" role="img" aria-label={`SHAP feature importance chart for ${prediction} prediction`}>
      <h4 className="text-sm font-semibold text-text">Feature Contributions</h4>
      {sorted.map((s) => {
        const abs = Math.abs(s.contribution);
        const pct = (abs / maxAbs) * 100;
        const positive = s.contribution > 0;

        return (
          <div key={s.feature} className="flex items-center gap-3">
            <span className="text-xs text-text-secondary w-28 shrink-0 text-right">{s.feature}</span>
            <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${pct}%`,
                  backgroundColor: positive ? color : '#9CA3AF',
                  marginLeft: positive ? '0' : 'auto',
                }}
              />
            </div>
            <span className="text-xs font-mono w-16 text-right" style={{ color: positive ? color : '#9CA3AF' }}>
              {s.contribution > 0 ? '+' : ''}{s.contribution.toFixed(1)}
            </span>
          </div>
        );
      })}
      <div className="flex items-center justify-between text-xs text-text-secondary mt-2">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400" /> Pushes against</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} /> Pushes toward {prediction}</span>
      </div>
    </div>
  );
}
