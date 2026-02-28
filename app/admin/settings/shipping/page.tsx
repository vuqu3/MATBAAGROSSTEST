"use client";

import { useEffect, useState } from 'react';

export default function AdminShippingPage() {
  const [shippingFee, setShippingFee] = useState<string>('25');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<string>('1500');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/store-settings', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { shippingFee?: number; freeShippingThreshold?: number };
        if (typeof data.shippingFee === 'number') setShippingFee(String(data.shippingFee));
        if (typeof data.freeShippingThreshold === 'number') setFreeShippingThreshold(String(data.freeShippingThreshold));
      } catch {
        // ignore
      }
    };
    run();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/store-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingFee: Number(shippingFee),
          freeShippingThreshold: Number(freeShippingThreshold),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || 'Kaydedilemedi');
        return;
      }
      alert('Kargo ayarları kaydedildi');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-slate-900">Kargo Ayarları</h1>
      <p className="mt-2 text-sm text-slate-500">Sepet ve ödeme sayfalarında kullanılan kargo ücreti ve ücretsiz kargo barajını buradan yönetebilirsiniz.</p>

      <div className="mt-6 bg-white border border-slate-200 rounded-lg p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Kargo Ücreti (TL)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={shippingFee}
            onChange={(e) => setShippingFee(e.target.value)}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Ücretsiz Kargo Barajı (TL)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={freeShippingThreshold}
            onChange={(e) => setFreeShippingThreshold(e.target.value)}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-semibold disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  );
}
