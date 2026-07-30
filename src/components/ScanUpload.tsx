'use client';

import { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';

interface ScanResult {
  age?: string;
  gender?: string;
  tsh?: string;
  t3?: string;
  t4?: string;
  freeT3?: string;
  freeT4?: string;
  symptoms?: string[];
}

interface Props {
  onScanComplete: (result: ScanResult) => void;
}

const FIELD_PATTERNS: { key: keyof ScanResult; patterns: RegExp[] }[] = [
  { key: 'tsh', patterns: [/TSH[:\s]*([\d.]+)/i, /tsh[:\s]*([\d.]+)/i] },
  { key: 't3', patterns: [/T3[:\s]*([\d.]+)/i, /t3[:\s]*([\d.]+)/i] },
  { key: 't4', patterns: [/T4[:\s]*([\d.]+)/i, /t4[:\s]*([\d.]+)/i] },
  { key: 'freeT3', patterns: [/Free T3[:\s]*([\d.]+)/i, /free t3[:\s]*([\d.]+)/i, /fT3[:\s]*([\d.]+)/i] },
  { key: 'freeT4', patterns: [/Free T4[:\s]*([\d.]+)/i, /free t4[:\s]*([\d.]+)/i, /fT4[:\s]*([\d.]+)/i] },
  { key: 'age', patterns: [/Age[:\s]*(\d+)/i, /age[:\s]*(\d+)/i] },
  { key: 'gender', patterns: [/Gender[:\s]*(Male|Female|Other)/i, /gender[:\s]*(male|female|other)/i] },
];

const SYMPTOM_KEYWORDS: { symptom: string; keywords: string[] }[] = [
  { symptom: 'Fatigue', keywords: ['fatigue', 'tired', 'exhaustion', 'weakness'] },
  { symptom: 'Weight gain', keywords: ['weight gain', 'gained weight'] },
  { symptom: 'Weight loss', keywords: ['weight loss', 'lost weight'] },
  { symptom: 'Hair loss', keywords: ['hair loss', 'hair fall', 'alopecia', 'thinning hair'] },
  { symptom: 'Heat intolerance', keywords: ['heat intolerance', 'heat', 'sweating', 'hot'] },
  { symptom: 'Cold intolerance', keywords: ['cold intolerance', 'cold', 'feeling cold'] },
  { symptom: 'Neck swelling', keywords: ['neck swelling', 'swollen neck', 'goiter', 'thyroid swelling', 'lump in neck'] },
];

function parseText(text: string): ScanResult {
  const result: ScanResult = {};

  for (const field of FIELD_PATTERNS) {
    for (const pattern of field.patterns) {
      const match = text.match(pattern);
      if (match) {
        (result as any)[field.key] = match[1];
        break;
      }
    }
  }

  const detectedSymptoms: string[] = [];
  for (const entry of SYMPTOM_KEYWORDS) {
    if (entry.keywords.some((kw) => text.toLowerCase().includes(kw.toLowerCase()))) {
      detectedSymptoms.push(entry.symptom);
    }
  }
  if (detectedSymptoms.length > 0) result.symptoms = detectedSymptoms;

  return result;
}

export default function ScanUpload({ onScanComplete }: Props) {
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setScanning(true);
    setScanError('');

    try {
      if (!file.type.startsWith('image/')) {
        setScanError('Please upload an image file (PNG, JPG)');
        setScanning(false);
        return;
      }

      const worker = await createWorker('eng');
      const { data } = await worker.recognize(file);
      await worker.terminate();

      const text = data.text;
      if (!text.trim()) {
        setScanError('Could not read any text from the image. Please try a clearer image.');
        setScanning(false);
        return;
      }

      const parsed = parseText(text);
      const foundCount = Object.keys(parsed).filter((k) => k !== 'symptoms' || (parsed.symptoms && parsed.symptoms.length > 0)).length;

      if (foundCount === 0) {
        setScanError('Could not detect any lab values in the image. Make sure the report clearly shows TSH, T3, T4, Free T3, Free T4 labels.');
        setScanning(false);
        return;
      }

      onScanComplete(parsed);
      setScanning(false);
    } catch {
      setScanError('Failed to process the image. Please try again or enter values manually.');
      setScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary-light/30 transition-colors"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <svg className="mx-auto mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <p className="text-sm text-text-secondary">Upload a lab report image to auto-fill values</p>
        <p className="text-xs text-text-secondary mt-1">Drag & drop or click to browse (PNG, JPG)</p>
      </div>

      {scanning && (
        <div className="mt-3 flex items-center gap-2 text-sm text-primary animate-pulse-soft">
          <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          Scanning and extracting values...
        </div>
      )}

      {scanError && (
        <p className="mt-2 text-xs text-danger">{scanError}</p>
      )}
    </div>
  );
}
