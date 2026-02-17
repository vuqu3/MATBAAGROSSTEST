/**
 * Design Editor types for Matbaagross Web-to-Print
 * Paper sizes, bleed, safety margins, and canvas state.
 */

export type PaperSizeId = 'A4' | 'A5' | 'A3' | 'A6' | 'custom';

export interface PaperSize {
  id: PaperSizeId;
  label: string;
  widthMm: number;
  heightMm: number;
  /** Width in pixels at 72 DPI (screen) */
  widthPx: number;
  /** Height in pixels at 72 DPI (screen) */
  heightPx: number;
}

/** 25.4 mm = 1 inch, 72 px = 1 inch → 1 mm = 72/25.4 px */
export const MM_TO_PX_72 = 72 / 25.4;

export function mmToPx72(mm: number): number {
  return Math.round(mm * MM_TO_PX_72);
}

export const PAPER_SIZES: Record<PaperSizeId, PaperSize> = {
  A3: {
    id: 'A3',
    label: 'A3',
    widthMm: 297,
    heightMm: 420,
    widthPx: mmToPx72(297),
    heightPx: mmToPx72(420),
  },
  A4: {
    id: 'A4',
    label: 'A4',
    widthMm: 210,
    heightMm: 297,
    widthPx: mmToPx72(210),
    heightPx: mmToPx72(297),
  },
  A5: {
    id: 'A5',
    label: 'A5',
    widthMm: 148,
    heightMm: 210,
    widthPx: mmToPx72(148),
    heightPx: mmToPx72(210),
  },
  A6: {
    id: 'A6',
    label: 'A6',
    widthMm: 105,
    heightMm: 148,
    widthPx: mmToPx72(105),
    heightPx: mmToPx72(148),
  },
  custom: {
    id: 'custom',
    label: 'Özel',
    widthMm: 210,
    heightMm: 297,
    widthPx: mmToPx72(210),
    heightPx: mmToPx72(297),
  },
};

/** Default bleed in mm (taşma payı) */
export const DEFAULT_BLEED_MM = 3;

/** Default safety margin in mm (güvenli alan) */
export const DEFAULT_SAFETY_MM = 5;

export type EditorTool = 'select' | 'text' | 'image' | 'shape' | 'qr' | 'template';

export interface TextOptions {
  fontFamily: string;
  fontSize: number;
  fill: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
}

export const DEFAULT_TEXT_OPTIONS: TextOptions = {
  fontFamily: 'Arial',
  fontSize: 24,
  fill: '#000000',
  fontWeight: 'normal',
  fontStyle: 'normal',
};

export const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Comic Sans MS',
  'Trebuchet MS',
] as const;
