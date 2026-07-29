'use client';

import { useEffect, useState } from 'react';
import { getRiskColor } from '@/lib/utils';

interface Props {
  confidence: number;
  prediction: string;
  size?: number;
}

export default function ConfidenceRing({ confidence, prediction, size = 160 }: Props) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const step = Math.ceil(confidence / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= confidence) {
        setAnimatedValue(confidence);
        clearInterval(timer);
      } else {
        setAnimatedValue(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [confidence]);

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;
  const color = getRiskColor(prediction);

  return (
    <div className="flex flex-col items-center gap-2 animate-count-up" style={{ width: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
        />
      </svg>
      <span
        className="absolute font-[family-name:var(--font-heading)] font-bold text-3xl"
        style={{ color, lineHeight: `${size}px` }}
      >
        {animatedValue}%
      </span>
    </div>
  );
}
