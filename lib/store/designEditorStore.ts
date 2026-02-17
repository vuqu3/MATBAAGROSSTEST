'use client';

import { create } from 'zustand';
import type { Canvas } from 'fabric';
import type { PaperSizeId, EditorTool, TextOptions } from '@/types/designEditor';
import {
  PAPER_SIZES,
  DEFAULT_BLEED_MM,
  DEFAULT_SAFETY_MM,
  DEFAULT_TEXT_OPTIONS,
} from '@/types/designEditor';

export interface DesignEditorState {
  /** Fabric canvas instance (set when canvas is ready) */
  canvas: Canvas | null;
  setCanvas: (canvas: Canvas | null) => void;

  /** Current paper size */
  paperSizeId: PaperSizeId;
  setPaperSizeId: (id: PaperSizeId) => void;

  /** Bleed in mm */
  bleedMm: number;
  setBleedMm: (mm: number) => void;

  /** Safety margin in mm */
  safetyMm: number;
  setSafetyMm: (mm: number) => void;

  /** Active toolbar tool */
  activeTool: EditorTool;
  setActiveTool: (tool: EditorTool) => void;

  /** Text options for new/selected text */
  textOptions: TextOptions;
  setTextOptions: (options: Partial<TextOptions>) => void;

  canvasScale: number;
  setCanvasScale: (scale: number) => void;

  openImagePicker: (() => void) | null;
  setOpenImagePicker: (fn: (() => void) | null) => void;

  /** URLs of images user uploaded (for Uploads tab) */
  userUploadedImages: string[];
  addUserUploadedImage: (url: string) => void;
  clearUserUploadedImages: () => void;

  /** Trigger re-render when canvas is ready (increment to force subscribers to update) */
  canvasReadyVersion: number;
  bumpCanvasReady: () => void;
}

export const useDesignEditorStore = create<DesignEditorState>((set) => ({
  canvas: null,
  setCanvas: (canvas) => set({ canvas }),

  paperSizeId: 'A4',
  setPaperSizeId: (paperSizeId) => set({ paperSizeId }),

  bleedMm: DEFAULT_BLEED_MM,
  setBleedMm: (bleedMm) => set({ bleedMm }),

  safetyMm: DEFAULT_SAFETY_MM,
  setSafetyMm: (safetyMm) => set({ safetyMm }),

  activeTool: 'select',
  setActiveTool: (activeTool) => set({ activeTool }),

  textOptions: DEFAULT_TEXT_OPTIONS,
  setTextOptions: (options) =>
    set((s) => ({ textOptions: { ...s.textOptions, ...options } })),

  canvasScale: 1,
  setCanvasScale: (canvasScale) => set({ canvasScale }),

  openImagePicker: null,
  setOpenImagePicker: (openImagePicker) => set({ openImagePicker }),

  userUploadedImages: [],
  addUserUploadedImage: (url) =>
    set((s) => ({ userUploadedImages: [...s.userUploadedImages, url] })),
  clearUserUploadedImages: () => set({ userUploadedImages: [] }),

  canvasReadyVersion: 0,
  bumpCanvasReady: () => set((s) => ({ canvasReadyVersion: s.canvasReadyVersion + 1 })),
}));
