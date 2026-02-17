/**
 * Mock design templates for the Product Studio.
 * Each template's apply() clears the canvas and adds predefined text/shapes.
 */
import type { Canvas } from 'fabric';
import { FabricText, Rect } from 'fabric';
import { PAPER_SIZES, mmToPx72 } from '@/types/designEditor';

function getCanvasCenter(canvas: Canvas) {
  const w = canvas.width ?? 0;
  const h = canvas.height ?? 0;
  return { centerX: w / 2, centerY: h / 2, w, h };
}

function getBleedAndPaper() {
  const BLEED_PX = mmToPx72(3);
  const paper = PAPER_SIZES.A4;
  return { BLEED_PX, paper };
}

export interface DesignTemplate {
  id: string;
  name: string;
  description?: string;
  /** Optional thumbnail URL or data URL for sidebar */
  thumbnail?: string;
  apply: (canvas: Canvas) => void;
}

function clearAndApply(canvas: Canvas, apply: () => void) {
  const objs = canvas.getObjects();
  objs.forEach((o) => canvas.remove(o));
  apply();
  canvas.requestRenderAll();
}

export const MOCK_TEMPLATES: DesignTemplate[] = [
  {
    id: 'classic-baklava',
    name: 'Classic Baklava',
    description: 'Klasik baklava kutusu tasarımı',
    apply(canvas) {
      const { centerX, centerY } = getCanvasCenter(canvas);
      clearAndApply(canvas, () => {
        const title = new FabricText('BAKLAVA', {
          left: centerX - 80,
          top: centerY - 60,
          fontFamily: 'Georgia',
          fontSize: 42,
          fill: '#8B4513',
          fontWeight: 'bold',
        });
        canvas.add(title);
        const subtitle = new FabricText('500 Gr • Özel Üretim', {
          left: centerX - 60,
          top: centerY - 10,
          fontFamily: 'Georgia',
          fontSize: 16,
          fill: '#5D4E37',
        });
        canvas.add(subtitle);
        const deco = new Rect({
          left: centerX - 100,
          top: centerY + 30,
          width: 200,
          height: 4,
          fill: '#D2691E',
        });
        canvas.add(deco);
      });
    },
  },
  {
    id: 'modern-pistachio',
    name: 'Modern Pistachio',
    description: 'Modern antep fıstıklı görünüm',
    apply(canvas) {
      const { centerX, centerY } = getCanvasCenter(canvas);
      const { BLEED_PX, paper } = getBleedAndPaper();
      clearAndApply(canvas, () => {
        const bg = new Rect({
          left: BLEED_PX + 20,
          top: BLEED_PX + 20,
          width: paper.widthPx - 40,
          height: paper.heightPx - 40,
          fill: 'transparent',
          stroke: '#2E7D32',
          strokeWidth: 2,
        });
        canvas.add(bg);
        const title = new FabricText('PİSTACHIO', {
          left: centerX - 90,
          top: centerY - 50,
          fontFamily: 'Helvetica',
          fontSize: 36,
          fill: '#1B5E20',
          fontWeight: 'bold',
          fontStyle: 'italic',
        });
        canvas.add(title);
        const body = new FabricText('500Gr Baklava Kutusu\nTaze & Özenle Hazırlandı', {
          left: centerX - 70,
          top: centerY + 10,
          fontFamily: 'Helvetica',
          fontSize: 14,
          fill: '#388E3C',
          lineHeight: 1.4,
        });
        canvas.add(body);
      });
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Sade ve şık',
    apply(canvas) {
      const { centerX, centerY } = getCanvasCenter(canvas);
      clearAndApply(canvas, () => {
        const title = new FabricText('Baklava', {
          left: centerX - 45,
          top: centerY - 24,
          fontFamily: 'Arial',
          fontSize: 32,
          fill: '#212121',
          fontWeight: 'normal',
        });
        canvas.add(title);
        const line = new Rect({
          left: centerX - 60,
          top: centerY + 15,
          width: 120,
          height: 1,
          fill: '#616161',
        });
        canvas.add(line);
        const sub = new FabricText('500g', {
          left: centerX - 15,
          top: centerY + 28,
          fontFamily: 'Arial',
          fontSize: 14,
          fill: '#757575',
        });
        canvas.add(sub);
      });
    },
  },
];
