import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { getRiskColor, formatDate } from './utils';

interface PdfData {
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

export async function generateAssessmentPdf(data: PdfData, chartEl?: HTMLElement | null): Promise<void> {
  let chartImg = '';
  if (chartEl) {
    try {
      chartImg = await toPng(chartEl, { quality: 0.95, backgroundColor: '#ffffff' });
    } catch { /* proceed without chart */ }
  }

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
  pdf.setTextColor(parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16));
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
    ['Age', String(data.age)], ['Gender', data.gender],
    ['TSH', `${data.tsh} mIU/L`], ['T3', `${data.t3} ng/dL`],
    ['T4', `${data.t4} µg/dL`], ['Free T3', `${data.free_t3} pg/mL`],
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

  if (y + 30 > 280) { pdf.addPage(); y = 20; }
  pdf.setFontSize(9);
  pdf.setTextColor(156, 163, 175);
  const disc = 'This is an educational tool and not a substitute for professional medical diagnosis.';
  pdf.text(pdf.splitTextToSize(disc, 180), 10, 280);

  pdf.save(`ThyroSense-Report-${data.id.slice(0, 8)}.pdf`);
}
