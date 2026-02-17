'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, FabricText, FabricImage } from 'fabric';
import { useDesignEditorStore } from '@/lib/store/designEditorStore';
import {
  PAPER_SIZES,
  mmToPx72,
  FONT_FAMILIES,
  type PaperSizeId,
} from '@/types/designEditor';
import {
  Type,
  ImagePlus,
  Square,
  QrCode,
  LayoutTemplate,
  Layers,
  Eye,
  Download,
  MousePointer2,
} from 'lucide-react';

const BLEED_COLOR = 'rgba(255, 0, 0, 0.4)';
const SAFETY_COLOR = 'rgba(0, 128, 255, 0.25)';

function DesignEditorToolbar() {
  const {
    activeTool,
    setActiveTool,
    textOptions,
    setTextOptions,
    paperSizeId,
    setPaperSizeId,
    openImagePicker,
  } = useDesignEditorStore();

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
      {/* Paper size */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600">Sayfa:</label>
        <select
          value={paperSizeId}
          onChange={(e) => setPaperSizeId(e.target.value as PaperSizeId)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
        >
          {(['A4', 'A5', 'A3', 'A6'] as const).map((id) => (
            <option key={id} value={id}>
              {PAPER_SIZES[id].label}
            </option>
          ))}
        </select>
      </div>

      <div className="h-6 w-px bg-gray-200" />

      {/* Tools */}
      <div className="flex items-center gap-1">
        <ToolButton
          active={activeTool === 'select'}
          onClick={() => setActiveTool('select')}
          title="Seçim"
          icon={<MousePointer2 className="h-4 w-4" />}
        />
        <ToolButton
          active={activeTool === 'text'}
          onClick={() => setActiveTool('text')}
          title="Metin Ekle"
          icon={<Type className="h-4 w-4" />}
        />
        <ToolButton
          active={activeTool === 'image'}
          onClick={() => {
            setActiveTool('image');
            openImagePicker?.();
          }}
          title="Görsel Yükle"
          icon={<ImagePlus className="h-4 w-4" />}
        />
        <ToolButton
          active={activeTool === 'shape'}
          onClick={() => setActiveTool('shape')}
          title="Şekil"
          icon={<Square className="h-4 w-4" />}
          disabled
        />
        <ToolButton
          active={activeTool === 'qr'}
          onClick={() => setActiveTool('qr')}
          title="QR Kod"
          icon={<QrCode className="h-4 w-4" />}
          disabled
        />
        <ToolButton
          active={activeTool === 'template'}
          onClick={() => setActiveTool('template')}
          title="Şablon"
          icon={<LayoutTemplate className="h-4 w-4" />}
          disabled
        />
      </div>

      {/* Text options (when text tool or text selected) */}
      {(activeTool === 'text' || activeTool === 'select') && (
        <>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={textOptions.fontFamily}
              onChange={(e) => setTextOptions({ fontFamily: e.target.value })}
              className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={8}
              max={200}
              value={textOptions.fontSize}
              onChange={(e) =>
                setTextOptions({ fontSize: Number(e.target.value) || 24 })
              }
              className="w-14 rounded border border-gray-300 px-2 py-1 text-sm"
            />
            <input
              type="color"
              value={textOptions.fill}
              onChange={(e) => setTextOptions({ fill: e.target.value })}
              className="h-8 w-10 cursor-pointer rounded border border-gray-300"
            />
            <button
              type="button"
              onClick={() =>
                setTextOptions({
                  fontWeight:
                    textOptions.fontWeight === 'bold' ? 'normal' : 'bold',
                })
              }
              className={`rounded border px-2 py-1 text-sm font-medium ${
                textOptions.fontWeight === 'bold'
                  ? 'border-brand-blue bg-brand-blue text-white'
                  : 'border-gray-300 bg-white'
              }`}
            >
              B
            </button>
            <button
              type="button"
              onClick={() =>
                setTextOptions({
                  fontStyle:
                    textOptions.fontStyle === 'italic' ? 'normal' : 'italic',
                })
              }
              className={`rounded border px-2 py-1 text-sm ${
                textOptions.fontStyle === 'italic'
                  ? 'border-brand-blue bg-brand-blue text-white'
                  : 'border-gray-300 bg-white'
              }`}
              style={{ fontStyle: 'italic' }}
            >
              I
            </button>
          </div>
        </>
      )}

      <div className="ml-auto flex items-center gap-1">
        <ToolButton
          title="Katmanlar"
          icon={<Layers className="h-4 w-4" />}
          disabled
        />
        <ToolButton
          title="Önizleme"
          icon={<Eye className="h-4 w-4" />}
          disabled
        />
        <ToolButton
          title="PDF İndir"
          icon={<Download className="h-4 w-4" />}
          disabled
        />
      </div>
    </header>
  );
}

function ToolButton({
  icon,
  onClick,
  title,
  active,
  disabled,
}: {
  icon: React.ReactNode;
  onClick?: () => void;
  title: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
        active
          ? 'border-brand-blue bg-brand-blue text-white'
          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      {icon}
    </button>
  );
}

function CanvasStage() {
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

      // Bleed area outline (full canvas = trim + bleed)
      ctx.strokeStyle = BLEED_COLOR;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
      // Trim line (paper edge)
      ctx.strokeStyle = 'rgba(200, 0, 0, 0.6)';
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(bleedPx, bleedPx, paper.widthPx, paper.heightPx);
      // Safety margin (inner)
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

  // Initialize Fabric canvas and resize observer
  useEffect(() => {
    const container = containerRef.current;
    const canvasEl = canvasElRef.current;
    if (!container || !canvasEl) return;

    const width = canvasWidth;
    const height = canvasHeight;

    const fabricCanvas = new Canvas(canvasEl, {
      width,
      height,
      backgroundColor: '#f5f5f5',
      preserveObjectStacking: true,
      selection: true,
    });

    fabricCanvas.on('after:render', () => {
      drawGuides(fabricCanvas);
    });
    fabricCanvas.requestRenderAll();

    fabricCanvasRef.current = fabricCanvas;
    setCanvas(fabricCanvas);

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
  }, [paperSizeId, canvasWidth, canvasHeight, setCanvas, setCanvasScale, drawGuides]);

  const addText = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const text = new FabricText('Metin ekleyin', {
      left: canvasWidth / 2 - 80,
      top: canvasHeight / 2 - 15,
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
  }, [
    canvasWidth,
    canvasHeight,
    textOptions,
    setActiveTool,
  ]);

  const addImageFromFile = useCallback(
    (file: File) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || !file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      FabricImage.fromURL(url, {}, {}).then((img) => {
        URL.revokeObjectURL(url);
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
      });
    },
    [paper, canvasWidth, canvasHeight, setActiveTool]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (activeTool === 'text') {
        addText();
      }
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

  const handleDragLeave = useCallback(() => {
    setIsDraggingOver(false);
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-gray-100">
      <div
        ref={containerRef}
        className="relative flex flex-1 items-center justify-center overflow-auto p-6"
        onClick={handleCanvasClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div
          className="relative flex items-center justify-center shadow-lg"
          style={{
            width: canvasWidth * canvasScale,
            height: canvasHeight * canvasScale,
            minWidth: canvasWidth * canvasScale,
            minHeight: canvasHeight * canvasScale,
          }}
        >
          <canvas
            ref={canvasElRef}
            className="block border border-gray-300 bg-white"
            style={{
              width: canvasWidth * canvasScale,
              height: canvasHeight * canvasScale,
            }}
          />
          {isDraggingOver && (
            <div className="absolute inset-0 flex items-center justify-center rounded border-2 border-dashed border-brand-blue bg-brand-blue/10 text-brand-blue">
              <span className="text-lg font-medium">Görseli buraya bırakın</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default function DesignEditor() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    useDesignEditorStore.getState().setOpenImagePicker(() => {
      fileInputRef.current?.click();
    });
    return () => {
      useDesignEditorStore.getState().setOpenImagePicker(null);
    };
  }, []);

  return (
    <div className="flex h-full flex-col bg-white">
      <DesignEditorToolbar />
      <div className="relative flex flex-1 overflow-hidden">
        <CanvasStage />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const canvas = useDesignEditorStore.getState().canvas;
              if (canvas) {
                const url = URL.createObjectURL(file);
                FabricImage.fromURL(url, {}, {}).then((img) => {
                  URL.revokeObjectURL(url);
                  const paper = PAPER_SIZES[useDesignEditorStore.getState().paperSizeId];
                  const scale = Math.min(
                    (paper.widthPx * 0.5) / (img.width ?? 1),
                    (paper.heightPx * 0.5) / (img.height ?? 1),
                    1
                  );
                  img.scale(scale);
                  const w = paper.widthPx + mmToPx72(3) * 2;
                  const h = paper.heightPx + mmToPx72(3) * 2;
                  img.set({
                    left: w / 2 - ((img.width ?? 0) * scale) / 2,
                    top: h / 2 - ((img.height ?? 0) * scale) / 2,
                  });
                  canvas.add(img);
                  canvas.setActiveObject(img);
                  canvas.requestRenderAll();
                  useDesignEditorStore.getState().setActiveTool('select');
                });
              }
            }
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
