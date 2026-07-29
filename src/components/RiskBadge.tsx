import { getRiskColor } from '@/lib/utils';

interface Props {
  prediction: string;
}

export default function RiskBadge({ prediction }: Props) {
  const color = getRiskColor(prediction);

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
      style={{
        backgroundColor: `${color}18`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      <span
        className="w-2 h-2 rounded-full mr-2"
        style={{ backgroundColor: color }}
      />
      {prediction}
    </span>
  );
}
