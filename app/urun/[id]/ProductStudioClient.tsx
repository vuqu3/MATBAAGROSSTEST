'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCart } from '@/context/CartContext';
import {
  LayoutTemplate,
  Type,
  ImagePlus,
  Layers,
  ChevronUp,
  ChevronDown,
  ShoppingCart,
  Check,
  Truck,
  Zap,
  Package,
  Ruler,
  Palette,
  FileText,
  ArrowLeft,
  ImageIcon,
  Lock,
  Unlock,
  Copy,
  Download,
  Square,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Canvas, Textbox, FabricImage, Rect } from 'fabric';
import { useDesignEditorStore } from '@/lib/store/designEditorStore';
import { MOCK_TEMPLATES } from '@/lib/designTemplates';
import { PAPER_SIZES, mmToPx72, FONT_FAMILIES } from '@/types/designEditor';
import {
  createPhotoHolder,
  isPhotoHolder,
  replacePhotoHolderWithImage,
  isLocked,
} from '@/lib/canvasHelpers';

const DesignCanvasStage = dynamic(
  () => import('@/app/components/design-editor/DesignCanvasStage'),
  { ssr: false }
);

type ProductAttributeOption = { label: string; priceImpact: number };
type ProductAttribute = { label: string; options: ProductAttributeOption[] };

type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  images: unknown;
  basePrice: number;
  salePrice: number | null;
  productType: string;
  minOrderQuantity: number | null;
  category: { name: string; slug: string };
  attributes?: ProductAttribute[] | null;
  vendorName?: string | null;
  highlights?: Record<string, string> | null;
  descriptionDetail?: { productInfo?: string; extraInfo?: string } | null;
  relatedProducts?: string[] | null;
};

type ProductCard = {
  id: string;
  name: string;
  imageUrl: string | null;
  images: unknown;
  basePrice: number;
  salePrice: number | null;
  category: { slug: string };
};

const SIDEBAR_TABS = [
  { id: 'templates', label: 'Şablonlar', icon: LayoutTemplate },
  { id: 'text', label: 'Metin', icon: Type },
  { id: 'uploads', label: 'Yüklemeler', icon: ImagePlus },
  { id: 'layers', label: 'Katmanlar', icon: Layers },
] as const;

type SidebarTabId = (typeof SIDEBAR_TABS)[number]['id'];

export default function ProductStudioClient({
  product,
  relatedProducts = [],
  recommendedProducts = [],
  customPrintSurcharge,
  onExitDesignStudio,
}: {
  product: Product;
  relatedProducts?: ProductCard[];
  recommendedProducts?: ProductCard[];
  /** Surcharge (TL) for custom design (e.g. 50) - added to unit price in studio */
  customPrintSurcharge?: number;
  /** Callback to return to standard product view */
  onExitDesignStudio?: () => void;
}) {
  const { addItem } = useCart();
  const [sidebarTab, setSidebarTab] = useState<SidebarTabId>('templates');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [layersVersion, setLayersVersion] = useState(0);
  const [selections, setSelections] = useState<Record<string, ProductAttributeOption>>({});
  const [uploading, setUploading] = useState(false);
  const [selectedObject, setSelectedObject] = useState<unknown>(null);
  const [selectionVersion, setSelectionVersion] = useState(0);
  const [shapeFillColor, setShapeFillColor] = useState('#f97316');
  const canvasReadyRef = useRef<Canvas | null>(null);

  const {
    canvas,
    canvasReadyVersion,
    textOptions,
    setTextOptions,
    setActiveTool,
    openImagePicker,
    setOpenImagePicker,
    userUploadedImages,
    paperSizeId,
  } = useDesignEditorStore();

  const attributes = (product.attributes && Array.isArray(product.attributes)
    ? product.attributes
    : []) as ProductAttribute[];
  const vendorName = product.vendorName ?? 'MatbaaGross';
  const highlights = product.highlights && typeof product.highlights === 'object' ? product.highlights : {};
  const highlightEntries = Object.entries(highlights).slice(0, 6);

  const basePrice = Number(product.basePrice);
  const salePrice = product.salePrice != null ? Number(product.salePrice) : null;
  const displayBase = salePrice ?? basePrice;
  const optionsTotal = Object.values(selections).reduce((sum, opt) => sum + (opt?.priceImpact ?? 0), 0);
  const surcharge = customPrintSurcharge ?? 0;
  const unitPrice = displayBase + optionsTotal + surcharge;
  const totalPrice = unitPrice * quantity;

  const handleCanvasReady = useCallback((c: Canvas) => {
    canvasReadyRef.current = c;
  }, []);

  useEffect(() => {
    setOpenImagePicker(() => () => {
      document.getElementById('studio-image-upload')?.click();
    });
    return () => setOpenImagePicker(null);
  }, [setOpenImagePicker]);

  const c = canvas ?? canvasReadyRef.current;
  useEffect(() => {
    if (!c) return;
    const onSelect = () => {
      const active = c.getActiveObject();
      setSelectedObject(active ?? null);
    };
    const onClear = () => setSelectedObject(null);
    c.on('selection:created', onSelect);
    c.on('selection:updated', onSelect);
    c.on('selection:cleared', onClear);
    return () => {
      c.off('selection:created', onSelect);
      c.off('selection:updated', onSelect);
      c.off('selection:cleared', onClear);
    };
  }, [c, canvasReadyVersion]);

  const addTextMetin = useCallback(() => {
    const c = canvas ?? canvasReadyRef.current;
    if (!c) return;
    const paper = PAPER_SIZES[paperSizeId];
    const bleedPx = mmToPx72(3);
    const w = paper.widthPx + bleedPx * 2;
    const h = paper.heightPx + bleedPx * 2;
    const text = new Textbox('Metniniz', {
      left: w / 2 - 50,
      top: h / 2 - 12,
      width: 180,
      fontFamily: textOptions.fontFamily,
      fontSize: textOptions.fontSize,
      fill: textOptions.fill,
      fontWeight: textOptions.fontWeight,
      fontStyle: textOptions.fontStyle,
    });
    c.add(text);
    c.setActiveObject(text);
    c.requestRenderAll();
    setSelectedObject(text);
    setSidebarTab('layers');
  }, [canvas, paperSizeId, textOptions]);

  const addHeaderText = useCallback(() => {
    const c = canvas ?? canvasReadyRef.current;
    if (!c) return;
    const paper = PAPER_SIZES[paperSizeId];
    const bleedPx = mmToPx72(3);
    const w = paper.widthPx + bleedPx * 2;
    const h = paper.heightPx + bleedPx * 2;
    const text = new Textbox('Başlık', {
      left: w / 2 - 40,
      top: h / 2 - 40,
      width: 200,
      fontFamily: textOptions.fontFamily,
      fontSize: 32,
      fill: textOptions.fill,
      fontWeight: 'bold',
    });
    c.add(text);
    c.setActiveObject(text);
    c.requestRenderAll();
    setSidebarTab('layers');
  }, [canvas, paperSizeId, textOptions]);

  const addBodyText = useCallback(() => {
    const c = canvas ?? canvasReadyRef.current;
    if (!c) return;
    const paper = PAPER_SIZES[paperSizeId];
    const bleedPx = mmToPx72(3);
    const w = paper.widthPx + bleedPx * 2;
    const h = paper.heightPx + bleedPx * 2;
    const text = new Textbox('Açıklama metni buraya.', {
      left: w / 2 - 70,
      top: h / 2,
      width: 280,
      fontFamily: textOptions.fontFamily,
      fontSize: 14,
      fill: textOptions.fill,
    });
    c.add(text);
    c.setActiveObject(text);
    c.requestRenderAll();
    setSidebarTab('layers');
  }, [canvas, paperSizeId, textOptions]);

  const addShapeRect = useCallback(() => {
    const c = canvas ?? canvasReadyRef.current;
    if (!c) return;
    const paper = PAPER_SIZES[paperSizeId];
    const bleedPx = mmToPx72(3);
    const w = paper.widthPx + bleedPx * 2;
    const h = paper.heightPx + bleedPx * 2;
    const rect = new Rect({
      left: w / 2 - 100,
      top: h / 2 - 40,
      width: 200,
      height: 80,
      fill: shapeFillColor,
      stroke: undefined,
    });
    c.add(rect);
    c.setActiveObject(rect);
    c.requestRenderAll();
    setSelectedObject(rect);
    setSidebarTab('layers');
  }, [canvas, paperSizeId, shapeFillColor]);

  const addImageFromUrl = useCallback(
    (url: string) => {
      const c = canvas ?? canvasReadyRef.current;
      if (!c) return;
      FabricImage.fromURL(url, {}, {}).then((img) => {
        const paper = PAPER_SIZES[paperSizeId];
        const bleedPx = mmToPx72(3);
        const w = paper.widthPx + bleedPx * 2;
        const h = paper.heightPx + bleedPx * 2;
        const scale = Math.min(
          (paper.widthPx * 0.4) / (img.width ?? 1),
          (paper.heightPx * 0.4) / (img.height ?? 1),
          1
        );
        img.scale(scale);
        img.set({
          left: w / 2 - ((img.width ?? 0) * scale) / 2,
          top: h / 2 - ((img.height ?? 0) * scale) / 2,
        });
        c.add(img);
        c.setActiveObject(img);
        c.requestRenderAll();
        setSelectedObject(img);
        setLayersVersion((v) => v + 1);
      });
    },
    [canvas, paperSizeId]
  );

  const addPhotoHolder = useCallback(() => {
    const c = canvas ?? canvasReadyRef.current;
    if (!c) return;
    const paper = PAPER_SIZES[paperSizeId];
    const bleedPx = mmToPx72(3);
    const w = paper.widthPx + bleedPx * 2;
    const h = paper.heightPx + bleedPx * 2;
    createPhotoHolder(c, w / 2, h / 2);
    setSidebarTab('layers');
  }, [canvas, paperSizeId]);

  const toggleLockSelected = useCallback(() => {
    const c = canvas ?? canvasReadyRef.current;
    const active = c?.getActiveObject();
    if (!c || !active) return;
    const locked = isLocked(active);
    active.set({
      selectable: locked,
      evented: locked,
    });
    c.requestRenderAll();
    setLayersVersion((v) => v + 1);
  }, [canvas]);

  const duplicateSelected = useCallback(() => {
    const c = canvas ?? canvasReadyRef.current;
    const active = c?.getActiveObject();
    if (!c || !active) return;
    active.clone().then((cloned) => {
      cloned.set({ left: (active.left ?? 0) + 20, top: (active.top ?? 0) + 20 });
      c.add(cloned);
      c.setActiveObject(cloned);
      c.requestRenderAll();
      setLayersVersion((v) => v + 1);
    });
  }, [canvas]);

  const deleteSelected = useCallback(() => {
    const c = canvas ?? canvasReadyRef.current;
    const active = c?.getActiveObject();
    if (!c || !active) return;
    c.remove(active);
    c.discardActiveObject();
    c.requestRenderAll();
    setSelectedObject(null);
    setLayersVersion((v) => v + 1);
  }, [canvas]);

  const bringToFront = useCallback(() => {
    const c = canvas ?? canvasReadyRef.current;
    const active = c?.getActiveObject();
    if (!c || !active) return;
    c.bringObjectToFront(active);
    c.requestRenderAll();
    setLayersVersion((v) => v + 1);
  }, [canvas]);

  const sendToBack = useCallback(() => {
    const c = canvas ?? canvasReadyRef.current;
    const active = c?.getActiveObject();
    if (!c || !active) return;
    c.sendObjectToBack(active);
    c.requestRenderAll();
    setLayersVersion((v) => v + 1);
  }, [canvas]);

  const updateSelectedFill = useCallback(
    (fill: string) => {
      const active = canvas ?? canvasReadyRef.current?.getActiveObject();
      if (!active) return;
      (active as { set: (o: { fill?: string }) => void }).set({ fill });
      (canvas ?? canvasReadyRef.current)?.requestRenderAll();
      setSelectionVersion((v) => v + 1);
    },
    [canvas]
  );

  const updateSelectedFontSize = useCallback(
    (fontSize: number) => {
      const active = canvas ?? canvasReadyRef.current?.getActiveObject();
      if (!active) return;
      (active as { set: (o: { fontSize?: number }) => void }).set({ fontSize });
      (canvas ?? canvasReadyRef.current)?.requestRenderAll();
      setSelectionVersion((v) => v + 1);
    },
    [canvas]
  );

  const saveTemplateJSON = useCallback(() => {
    const c = canvas ?? canvasReadyRef.current;
    if (!c) return;
    const json = JSON.stringify(c.toObject(['isPhotoHolder', 'hasImage']), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [canvas]);

  const loadTemplate = useCallback((templateId: string) => {
    const c = canvas ?? canvasReadyRef.current;
    if (!c) return;
    const t = MOCK_TEMPLATES.find((x) => x.id === templateId);
    if (t) t.apply(c);
  }, [canvas]);

  const handleAddToCart = async () => {
    const c = canvas ?? canvasReadyRef.current;
    let uploadedFileUrl: string | undefined;

    if (c) {
      try {
        const dataUrl = c.toDataURL({ format: 'image/png', quality: 1 });
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], 'tasarim.png', { type: 'image/png' });
        setUploading(true);
        const form = new FormData();
        form.append('file', file);
        const uploadRes = await fetch('/api/upload/customer-file', {
          method: 'POST',
          body: form,
          credentials: 'include',
        });
        const data = await uploadRes.json();
        if (uploadRes.ok && data.url) uploadedFileUrl = data.url;
      } catch {
        // Continue without upload (e.g. not logged in)
      }
      setUploading(false);
    }

    const variations: Record<string, string> = {};
    Object.entries(selections).forEach(([attrLabel, opt]) => {
      if (opt?.label) variations[attrLabel] = opt.label;
    });

    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl || '/placeholder-product.svg',
      quantity,
      unitPrice,
      totalPrice: unitPrice * quantity,
      options: {
        ...variations,
        ...(uploadedFileUrl && { uploadedFileUrl, designImage: true }),
      },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const canvasObjects = canvas?.getObjects() ?? [];
  const bringForward = (index: number) => {
    const obj = canvasObjects[index];
    if (canvas && obj) {
      canvas.bringObjectToFront(obj);
      canvas.requestRenderAll();
      setLayersVersion((v) => v + 1);
    }
  };
  const sendBackward = (index: number) => {
    const obj = canvasObjects[index];
    if (canvas && obj) {
      canvas.sendObjectToBack(obj);
      canvas.requestRenderAll();
      setLayersVersion((v) => v + 1);
    }
  };
  const getObjectLabel = (obj: unknown) => {
    const t = obj as { text?: string; type?: string; get?: (k: string) => unknown };
    if (t.get?.('isPhotoHolder') === true) return t.get?.('hasImage') ? 'Resim Alanı (dolu)' : 'Resim Alanı';
    if (typeof t.text === 'string' && t.text.length > 0) return t.text.slice(0, 20) + (t.text.length > 20 ? '…' : '');
    if (t.type === 'image' || t.type === 'FabricImage') return 'Görsel';
    if (t.type === 'rect' || t.type === 'Rect') return 'Şekil';
    return 'Nesne';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-1 min-h-0" style={{ minHeight: 'calc(100vh - 140px)' }}>
          {/* Left Sidebar - Tools: icon strip + slide-out panel */}
          <aside className="flex flex-shrink-0 border-r border-slate-200 bg-white">
            <div className="w-14 py-2 flex flex-col items-center gap-1 border-r border-slate-100">
              {SIDEBAR_TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  title={label}
                  onClick={() => setSidebarTab(id)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    sidebarTab === id
                      ? 'bg-brand-blue text-white'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
            <div className="w-64 flex-shrink-0 border-r border-slate-200 bg-white overflow-y-auto flex flex-col">
              <div className="p-3 flex-1 min-h-0">
                {sidebarTab === 'templates' && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800">Şablonlar</h3>
                    <div className="grid gap-2">
                      {MOCK_TEMPLATES.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => loadTemplate(t.id)}
                          className="text-left p-3 rounded-lg border-2 border-slate-200 hover:border-brand-blue hover:bg-slate-50 transition-colors"
                        >
                          <div className="h-20 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs mb-2">
                            Önizleme
                          </div>
                          <p className="font-medium text-slate-900 text-sm">{t.name}</p>
                          {t.description && (
                            <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {sidebarTab === 'text' && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800">Metin</h3>
                    <div className="space-y-2">
                      <select
                        value={textOptions.fontFamily}
                        onChange={(e) => setTextOptions({ fontFamily: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        {FONT_FAMILIES.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={8}
                          max={120}
                          value={textOptions.fontSize}
                          onChange={(e) => setTextOptions({ fontSize: Number(e.target.value) || 14 })}
                          className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        />
                        <input
                          type="color"
                          value={textOptions.fill}
                          onChange={(e) => setTextOptions({ fill: e.target.value })}
                          className="h-9 w-12 rounded border border-slate-200 cursor-pointer"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addTextMetin}
                        className="w-full py-2.5 rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90 text-sm font-medium"
                      >
                        Metin Ekle
                      </button>
                      <button
                        type="button"
                        onClick={addHeaderText}
                        className="w-full py-2 rounded-lg border-2 border-slate-200 hover:border-brand-blue hover:bg-slate-50 text-sm font-medium text-slate-700"
                      >
                        Başlık Ekle
                      </button>
                      <button
                        type="button"
                        onClick={addBodyText}
                        className="w-full py-2 rounded-lg border-2 border-slate-200 hover:border-brand-blue hover:bg-slate-50 text-sm font-medium text-slate-700"
                      >
                        Paragraf Ekle
                      </button>
                      <div className="border-t border-slate-200 pt-2 mt-2">
                        <h4 className="text-xs font-semibold text-slate-600 mb-1.5">Şekil</h4>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={shapeFillColor}
                            onChange={(e) => setShapeFillColor(e.target.value)}
                            className="h-9 w-12 rounded border border-slate-200 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={addShapeRect}
                            className="flex-1 py-2 rounded-lg border-2 border-slate-200 hover:border-brand-orange hover:bg-orange-50 text-sm font-medium text-slate-700 flex items-center justify-center gap-1.5"
                          >
                            <Square className="w-4 h-4" /> Şekil Ekle (Dikdörtgen)
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={addPhotoHolder}
                        className="w-full py-2 rounded-lg border-2 border-slate-200 hover:border-brand-blue hover:bg-slate-50 text-slate-700 text-sm flex items-center justify-center gap-2"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Resim Alanı Ekle
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActiveTool('text'); openImagePicker?.(); }}
                        className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm flex items-center justify-center gap-2"
                      >
                        <ImagePlus className="w-4 h-4" />
                        Görsel Yükle
                      </button>
                    </div>
                  </div>
                )}
                {sidebarTab === 'uploads' && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800">Yüklenen Görseller</h3>
                    <button
                      type="button"
                      onClick={() => document.getElementById('studio-image-upload')?.click()}
                      className="w-full py-3 rounded-lg border-2 border-dashed border-slate-300 hover:border-brand-blue text-slate-500 hover:text-brand-blue text-sm flex items-center justify-center gap-2"
                    >
                      <ImagePlus className="w-5 h-5" />
                      Görsel Yükle
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      {userUploadedImages.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => addImageFromUrl(url)}
                          className="aspect-square rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-100 hover:border-brand-blue hover:ring-2 hover:ring-brand-blue/30 transition-all"
                          title="Tuvale eklemek için tıklayın"
                        >
                          <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" />
                        </button>
                      ))}
                    </div>
                    {userUploadedImages.length === 0 && (
                      <p className="text-xs text-slate-400">Henüz görsel yüklemediniz.</p>
                    )}
                  </div>
                )}
                {sidebarTab === 'layers' && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800">Katmanlar</h3>
                    {selectedObject && (
                      <div className="rounded-lg border-2 border-brand-blue/30 bg-slate-50 p-3 space-y-2">
                        <p className="text-xs font-semibold text-slate-700">Seçili öğe</p>
                        <div className="flex gap-2 flex-wrap">
                          <label className="flex items-center gap-1.5 text-xs">
                            <span className="text-slate-600">Dolgu:</span>
                            <input
                              type="color"
                              value={(() => {
                                const f = (selectedObject as { get?: (k: string) => unknown }).get?.('fill');
                                return typeof f === 'string' ? f : '#000000';
                              })()}
                              onChange={(e) => updateSelectedFill(e.target.value)}
                              className="h-7 w-9 rounded border border-slate-200 cursor-pointer"
                            />
                          </label>
                          {((selectedObject as { type?: string }).type === 'textbox' || (selectedObject as { fontSize?: number }).fontSize != null) && (
                            <label className="flex items-center gap-1.5 text-xs">
                              <span className="text-slate-600">Yazı boyutu:</span>
                              <input
                                type="number"
                                min={8}
                                max={120}
                                value={Number((selectedObject as { get?: (k: string) => unknown }).get?.('fontSize') ?? 24)}
                                onChange={(e) => updateSelectedFontSize(Number(e.target.value) || 24)}
                                className="w-14 rounded border border-slate-200 px-1.5 py-0.5 text-sm"
                              />
                            </label>
                          )}
                          <button
                            type="button"
                            onClick={bringToFront}
                            className="p-1.5 rounded border border-slate-200 hover:bg-white text-slate-600"
                            title="Öne getir"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={sendToBack}
                            className="p-1.5 rounded border border-slate-200 hover:bg-white text-slate-600"
                            title="Arkaya gönder"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={deleteSelected}
                            className="p-1.5 rounded border border-red-200 hover:bg-red-50 text-red-600"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={toggleLockSelected}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium"
                        title={canvas?.getActiveObject() && isLocked(canvas.getActiveObject()) ? 'Kilidi Aç' : 'Kilitle'}
                      >
                        {canvas?.getActiveObject() && isLocked(canvas.getActiveObject()) ? (
                          <><Unlock className="w-3.5 h-3.5" /> Kilidi Aç</>
                        ) : (
                          <><Lock className="w-3.5 h-3.5" /> Kilitle</>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={duplicateSelected}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium"
                        title="Çoğalt"
                      >
                        <Copy className="w-3.5 h-3.5" /> Çoğalt
                      </button>
                      <button
                        type="button"
                        onClick={saveTemplateJSON}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-brand-blue bg-brand-blue/10 text-brand-blue text-xs font-medium hover:bg-brand-blue/20"
                        title="Şablonu JSON olarak indir"
                      >
                        <Download className="w-3.5 h-3.5" /> Şablon Kaydet (JSON)
                      </button>
                    </div>
                    <div className="space-y-1">
                      {canvasObjects.map((obj, i) => (
                        <div
                          key={i}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            const c = canvas ?? canvasReadyRef.current;
                            if (c) {
                              c.setActiveObject(obj);
                              c.requestRenderAll();
                              setSelectedObject(obj);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              const c = canvas ?? canvasReadyRef.current;
                              if (c) {
                                c.setActiveObject(obj);
                                c.requestRenderAll();
                                setSelectedObject(obj);
                              }
                            }
                          }}
                          className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-50 group cursor-pointer"
                        >
                          <span className="flex-1 text-sm text-slate-700 truncate">
                            {getObjectLabel(obj)}
                          </span>
                          {isLocked(obj) && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => bringForward(i)}
                              className="p-1 rounded hover:bg-slate-200"
                              title="Öne getir"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => sendBackward(i)}
                              className="p-1 rounded hover:bg-slate-200"
                              title="Arkaya gönder"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {canvasObjects.length === 0 && (
                      <p className="text-xs text-slate-400">Henüz öğe yok. Şablon veya metin ekleyin.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Center - Canvas Stage */}
          <section className="flex-1 min-w-0 flex flex-col bg-slate-100">
            <div className="flex-1 min-h-0 p-4">
              <DesignCanvasStage onCanvasReady={handleCanvasReady} />
            </div>
          </section>

          {/* Right Sidebar - Product & Checkout */}
          <aside className="w-80 flex-shrink-0 border-l border-slate-200 bg-white overflow-y-auto">
            <div className="p-4 space-y-4">
              {onExitDesignStudio && (
                <button
                  type="button"
                  onClick={onExitDesignStudio}
                  className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand-orange font-medium"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Standart siparişe dön
                </button>
              )}
              <nav className="text-xs text-slate-500">
                <Link href="/" className="hover:text-brand-orange">Tüm Ürünler</Link>
                <span className="mx-2">/</span>
                <Link href={`/kategori/${product.category.slug}`} className="hover:text-brand-orange">{product.category.name}</Link>
                <span className="mx-2">/</span>
                <span className="text-slate-800 font-medium truncate">{product.name}</span>
              </nav>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
                <span className="text-slate-500">Satıcı:</span>
                <span className="text-brand-orange font-semibold">{vendorName}</span>
              </div>

              <h1 className="text-lg font-semibold text-slate-900 leading-tight">{product.name}</h1>

              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-brand-orange">{displayBase.toLocaleString('tr-TR')} TL</span>
                <span className="text-xs text-slate-500">KDV dahil</span>
              </div>

              {highlightEntries.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {highlightEntries.map(([key, value]) => {
                    const Icon = { Materyal: Package, Ebat: Ruler, Boyut: Ruler, Baskı: Palette, Kağıt: FileText }[key] || Package;
                    return (
                      <div key={key} className="inline-flex items-center gap-1.5 px-2 py-1.5 bg-slate-100 rounded-lg text-xs text-slate-700">
                        <Icon className="h-3.5 w-3.5 text-brand-orange flex-shrink-0" />
                        <span className="font-medium text-slate-600">{key}:</span>
                        <span>{value}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {attributes.length > 0 && (
                <div className="space-y-2">
                  {attributes.map((attr) => (
                    <div key={attr.label}>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{attr.label}</label>
                      <div className="flex flex-wrap gap-1.5">
                        {attr.options.map((opt) => {
                          const isSelected = selections[attr.label]?.label === opt.label;
                          return (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() => setSelections((prev) => ({ ...prev, [attr.label]: opt }))}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-all ${
                                isSelected ? 'border-brand-orange bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {isSelected && <Check className="h-3.5 w-3.5" />}
                              {opt.label}
                              {opt.priceImpact > 0 && <span className="text-brand-orange">+{opt.priceImpact.toLocaleString('tr-TR')} TL</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adet</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-20 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-orange bg-white text-sm"
                />
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-slate-600 text-sm">Toplam Fiyat</span>
                  <span className="text-xs text-slate-500">KDV dahil</span>
                </div>
                <p className="text-2xl font-bold text-brand-orange">{totalPrice.toLocaleString('tr-TR')} TL</p>
                <p className="text-xs text-slate-500 mt-0.5">{unitPrice.toLocaleString('tr-TR')} TL × {quantity} adet</p>
                {surcharge > 0 && (
                  <p className="text-xs text-orange-600 mt-1 font-medium">Özel baskı +{surcharge.toLocaleString('tr-TR')} TL dahil</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={uploading}
                className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  !uploading ? 'bg-brand-orange hover:bg-brand-orange-dark text-white shadow-md' : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                {uploading ? 'Yükleniyor...' : added ? <><Check className="h-5 w-5" /> Sepete Eklendi</> : <><ShoppingCart className="h-5 w-5" /> Sepete Ekle</>}
              </button>
              <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                <Truck className="h-4 w-4 text-slate-500 flex-shrink-0" />
                <span>Tahmini Teslimat: 3-5 İş Günü</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-700">
                <Zap className="h-3.5 w-3.5" />
                Hızlı Teslimat
              </div>
            </div>
          </aside>
        </div>
      </main>

      <input
        id="studio-image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && (canvas ?? canvasReadyRef.current)) {
            const c = canvas ?? canvasReadyRef.current!;
            const url = URL.createObjectURL(file);
            FabricImage.fromURL(url, {}, {}).then((img) => {
              URL.revokeObjectURL(url);
              const active = c.getActiveObject();
              if (active && isPhotoHolder(active) && replacePhotoHolderWithImage(c, img)) {
                useDesignEditorStore.getState().addUserUploadedImage(URL.createObjectURL(file));
                e.target.value = '';
                return;
              }
              const paper = PAPER_SIZES[paperSizeId];
              const bleedPx = mmToPx72(3);
              const w = paper.widthPx + bleedPx * 2;
              const h = paper.heightPx + bleedPx * 2;
              const scale = Math.min(
                (paper.widthPx * 0.5) / (img.width ?? 1),
                (paper.heightPx * 0.5) / (img.height ?? 1),
                1
              );
              img.scale(scale);
              img.set({
                left: w / 2 - ((img.width ?? 0) * scale) / 2,
                top: h / 2 - ((img.height ?? 0) * scale) / 2,
              });
              c.add(img);
              c.setActiveObject(img);
              c.requestRenderAll();
              useDesignEditorStore.getState().addUserUploadedImage(URL.createObjectURL(file));
            });
          }
          e.target.value = '';
        }}
      />

      <Footer />
    </div>
  );
}
