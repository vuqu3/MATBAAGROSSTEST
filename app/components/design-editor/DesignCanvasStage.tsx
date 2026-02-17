'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, Textbox, FabricImage } from 'fabric';
import { useDesignEditorStore } from '@/lib/store/designEditorStore';
import {
  PAPER_SIZES,
  mmToPx72,
  type PaperSizeId,
} from '@/types/designEditor';
import { isPhotoHolder, replacePhotoHolderWithImage } from '@/lib/canvasHelpers';

const BLEED_COLOR = 'rgba(255, 0, 0, 0.4)';
const SAFETY_COLOR = 'rgba(0, 128, 255, 0.25)';

interface DesignCanvasStageProps {
  className?: string;
  /** Called when canvas instance is ready (e.g. for capture/templates) */
  onCanvasReady?: (canvas: Canvas) => void;
}

export default function DesignCanvasStage({
  className = '',
  onCanvasReady,
}: DesignCanvasStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const {
    setCanvas,
    paperSizeId,
    bleedMm,
    safetyMm,
    activeTool,
    textOptions,
    setActiveTool,
    setCanvasScale,
    canvasScale,
    addUserUploadedImage,
    bumpCanvasReady,
  } = useDesignEditorStore();

  const paper = PAPER_SIZES[paperSizeId];
  const bleedPx = mmToPx72(bleedMm);
  const safetyPx = mmToPx72(safetyMm);
  const canvasWidth = paper.widthPx + bleedPx * 2;
  const canvasHeight = paper.heightPx + bleedPx * 2;

  const drawGuides = useCallback(
    (canvas: Canvas) => {
      const ctx = canvas.getContext();
      if (!ctx) return;
      const vpt = canvas.viewportTransform;
      ctx.save();
      if (vpt) ctx.setTransform(vpt[0], vpt[1], vpt[2], vpt[3], vpt[4], vpt[5]);
      ctx.strokeStyle = BLEED_COLOR;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
      ctx.strokeStyle = 'rgba(200, 0, 0, 0.6)';
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(bleedPx, bleedPx, paper.widthPx, paper.heightPx);
      ctx.strokeStyle = SAFETY_COLOR;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(
        bleedPx + safetyPx,
        bleedPx + safetyPx,
        paper.widthPx - safetyPx * 2,
        paper.heightPx - safetyPx * 2
      );
      ctx.setLineDash([]);
      ctx.restore();
    },
    [paper, bleedPx, safetyPx, canvasWidth, canvasHeight]
  );

  useEffect(() => {
    const container = containerRef.current;
    const canvasEl = canvasElRef.current;
    if (!container || !canvasEl) return;

    const width = canvasWidth;
    const height = canvasHeight;

    const fabricCanvas = new Canvas(canvasEl, {
      width,
      height,
      backgroundColor: '#f8fafc',
      preserveObjectStacking: true,
      selection: true,
      enableRetinaScaling: false,
    });

    fabricCanvas.on('after:render', () => {
      drawGuides(fabricCanvas);
    });

    fabricCanvas.on('mouse:dblclick', (e) => {
      const target = e.target;
      if (target && typeof (target as { enterEditing?: () => void }).enterEditing === 'function') {
        (target as { enterEditing: () => void }).enterEditing();
      }
    });

    fabricCanvas.requestRenderAll();

    fabricCanvasRef.current = fabricCanvas;
    setCanvas(fabricCanvas);
    bumpCanvasReady();
    onCanvasReady?.(fabricCanvas);

    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      const scaleX = rect.width / width;
      const scaleY = rect.height / height;
      const scale = Math.min(scaleX, scaleY, 1.5);
      setCanvasScale(scale);
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      fabricCanvas.dispose();
      fabricCanvasRef.current = null;
      setCanvas(null);
    };
  }, [paperSizeId, canvasWidth, canvasHeight, setCanvas, setCanvasScale, drawGuides, onCanvasReady, bumpCanvasReady]);

  const addText = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const text = new Textbox('Metin ekleyin', {
      left: canvasWidth / 2 - 80,
      top: canvasHeight / 2 - 15,
      width: 200,
      fontFamily: textOptions.fontFamily,
      fontSize: textOptions.fontSize,
      fill: textOptions.fill,
      fontWeight: textOptions.fontWeight,
      fontStyle: textOptions.fontStyle,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
    setActiveTool('select');
  }, [canvasWidth, canvasHeight, textOptions, setActiveTool]);

  const addImageFromFile = useCallback(
    (file: File) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || !file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      FabricImage.fromURL(url, {}, {}).then((img) => {
        URL.revokeObjectURL(url);
        const active = canvas.getActiveObject();
        if (active && isPhotoHolder(active) && replacePhotoHolderWithImage(canvas, img)) {
          setActiveTool('select');
          addUserUploadedImage(URL.createObjectURL(file));
          return;
        }
        const scale = Math.min(
          (paper.widthPx * 0.5) / (img.width ?? 1),
          (paper.heightPx * 0.5) / (img.height ?? 1),
          1
        );
        img.scale(scale);
        img.set({
          left: canvasWidth / 2 - ((img.width ?? 0) * scale) / 2,
          top: canvasHeight / 2 - ((img.height ?? 0) * scale) / 2,
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
        setActiveTool('select');
        addUserUploadedImage(URL.createObjectURL(file));
      });
    },
    [paper, canvasWidth, canvasHeight, setActiveTool, addUserUploadedImage]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (activeTool === 'text') addText();
    },
    [activeTool, addText]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) addImageFromFile(file);
    },
    [addImageFromFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDraggingOver(false), []);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-1 min-h-[400px] items-center justify-center overflow-auto bg-slate-100 ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleCanvasClick}
    >
      <div
        className="relative flex items-center justify-center shadow-xl rounded-lg overflow-hidden border border-slate-200 bg-white"
        style={{
          width: Math.round(canvasWidth * canvasScale),
          height: Math.round(canvasHeight * canvasScale),
          minWidth: Math.round(canvasWidth * canvasScale),
          minHeight: Math.round(canvasHeight * canvasScale),
        }}
      >
        <canvas
          ref={canvasElRef}
          className="block bg-white"
          style={{
            width: Math.round(canvasWidth * canvasScale) + 'px',
            height: Math.round(canvasHeight * canvasScale) + 'px',
          }}
        />
        {isDraggingOver && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg border-2 border-dashed border-brand-blue bg-brand-blue/10 text-brand-blue">
            <span className="text-lg font-medium">Görseli buraya bırakın</span>
          </div>
        )}
      </div>
    </div>
  );
}
