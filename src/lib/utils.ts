export const COLORS = {
  primary: '#0F6E6A',
  primaryHover: '#0C5A56',
  secondary: '#E8836B',
  success: '#4C9A72',
  warning: '#D9A441',
  danger: '#E8836B',
  background: '#FAF9F6',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
} as const;

export const RISK_COLORS = {
  Normal: '#4C9A72',
  Hypothyroidism: '#D9A441',
  Hyperthyroidism: '#E8836B',
} as const;

export function getRiskColor(prediction: string): string {
  return RISK_COLORS[prediction as keyof typeof RISK_COLORS] || COLORS.text;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
