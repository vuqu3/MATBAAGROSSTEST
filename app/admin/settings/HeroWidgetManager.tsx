'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Loader2, Check } from 'lucide-react';

type HeroWidget = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  targetUrl: string;
  order: number;
  isActive: boolean;
};

export default function HeroWidgetManager() {
  const [widgets, setWidgets] = useState<HeroWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchWidgets = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/hero-widgets');
      if (!res.ok) throw new Error('Widget\'lar yüklenemedi');
      const data = await res.json();
      setWidgets(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWidgets();
  }, []);

  const updateLocal = (id: string, patch: Partial<HeroWidget>) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...patch } : w))
    );
  };

  const handleImageChange = async (widgetId: string, file: File | null) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload/widget', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Yükleme başarısız');
      }
      const { url } = await res.json();
      updateLocal(widgetId, { imageUrl: url });
      await saveWidget(widgetId, { imageUrl: url });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Görsel yüklenemedi');
    }
  };

  const saveWidget = async (id: string, overrides?: Partial<HeroWidget>) => {
    const w = widgets.find((x) => x.id === id);
    if (!w) return;
    setSavingId(id);
    setError('');
    try {
      const res = await fetch(`/api/admin/hero-widgets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: overrides?.title ?? w.title,
          subtitle: overrides?.subtitle ?? w.subtitle,
          imageUrl: overrides?.imageUrl !== undefined ? overrides.imageUrl : w.imageUrl,
          targetUrl: overrides?.targetUrl ?? w.targetUrl,
          order: overrides?.order ?? w.order,
          isActive: overrides?.isActive ?? w.isActive,
        }),
      });
      if (!res.ok) throw new Error('Kaydedilemedi');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kayıt hatası');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Vitrin & Widget Yönetimi</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Ana sayfadaki kısayol kutularının başlık, slogan, görsel ve linklerini buradan düzenleyin.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {widgets.map((w) => (
          <div
            key={w.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            {/* Görsel yükleme alanı */}
            <div className="mb-3">
              <input
                ref={(el) => { fileInputRefs.current[w.id] = el; }}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageChange(w.id, file);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRefs.current[w.id]?.click()}
                className="w-full aspect-square max-h-[120px] rounded-lg border-2 border-dashed border-slate-200 hover:border-orange-300 bg-slate-50 flex items-center justify-center overflow-hidden transition-colors"
              >
                {w.imageUrl ? (
                  <img
                    src={w.imageUrl}
                    alt={w.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="flex flex-col items-center gap-1 text-slate-400 text-xs">
                    <Upload className="h-6 w-6" />
                    Görsel seç
                  </span>
                )}
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-600">Üst başlık</label>
              <input
                type="text"
                value={w.title}
                onChange={(e) => updateLocal(w.id, { title: e.target.value })}
                placeholder="Örn: Ramazan"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <label className="block text-xs font-medium text-slate-600">Alt slogan</label>
              <input
                type="text"
                value={w.subtitle}
                onChange={(e) => updateLocal(w.id, { subtitle: e.target.value })}
                placeholder="Örn: İmsakiye & Kutu"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <label className="block text-xs font-medium text-slate-600">Link</label>
              <input
                type="text"
                value={w.targetUrl}
                onChange={(e) => updateLocal(w.id, { targetUrl: e.target.value })}
                placeholder="/kampanyalar"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <div className="flex items-center justify-between pt-1">
                <label className="text-xs font-medium text-slate-600">Aktif</label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={w.isActive}
                  onClick={() => {
                    const next = !w.isActive;
                    updateLocal(w.id, { isActive: next });
                    saveWidget(w.id, { isActive: next });
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors ${w.isActive ? 'bg-orange-500 border-orange-500' : 'bg-slate-200 border-slate-200'}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${w.isActive ? 'translate-x-5' : 'translate-x-0.5'}`}
                    style={{ marginTop: 2 }}
                  />
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={savingId === w.id}
              onClick={() => saveWidget(w.id)}
              className="mt-3 w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {savingId === w.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Kaydet
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
