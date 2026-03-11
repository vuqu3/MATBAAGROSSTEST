'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Save } from 'lucide-react';

type Plan = {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  isActive: boolean;
  updatedAt: string;
};

export default function AdminSubscriptionPlansPage() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/subscription-plans', { cache: 'no-store' });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) setError(typeof json?.error === 'string' ? json.error : 'Planlar alınamadı');
          return;
        }
        const items = Array.isArray(json?.plans) ? (json.plans as Plan[]) : [];
        if (!cancelled) setPlans(items);
      } catch {
        if (!cancelled) setError('Planlar alınamadı');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => plans.slice().sort((a, b) => a.durationDays - b.durationDays), [plans]);

  const save = async (plan: Plan) => {
    setSavingId(plan.id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/admin/subscription-plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: plan.id, name: plan.name, price: plan.price }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json?.error === 'string' ? json.error : 'Kaydedilemedi');
        return;
      }
      const updated = json?.plan as Plan | undefined;
      if (updated) {
        setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      }
      setSuccess('Fiyatlar güncellendi.');
    } catch {
      setError('Kaydedilemedi');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">Yükleniyor...</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Abonelik Fiyatları</h1>
        <p className="mt-1 text-sm text-slate-600">Satıcı panelindeki paket fiyatlarını buradan yönetin.</p>
      </div>

      {error ? (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}

      {success ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 px-4 py-3 text-xs font-semibold text-slate-600">
          <div className="col-span-5">Paket</div>
          <div className="col-span-3">Süre</div>
          <div className="col-span-2">Fiyat (TL)</div>
          <div className="col-span-2 text-right">İşlem</div>
        </div>

        <div className="divide-y divide-slate-100">
          {rows.map((p) => (
            <div key={p.id} className="grid grid-cols-12 items-center gap-3 px-4 py-3">
              <div className="col-span-5">
                <input
                  value={p.name}
                  onChange={(e) => setPlans((prev) => prev.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </div>
              <div className="col-span-3 text-sm text-slate-700 font-semibold">{p.durationDays} gün</div>
              <div className="col-span-2">
                <input
                  type="number"
                  step="1"
                  value={String(p.price)}
                  onChange={(e) => setPlans((prev) => prev.map((x) => (x.id === p.id ? { ...x, price: Number(e.target.value) } : x)))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => save(p)}
                  disabled={savingId === p.id}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF6000] px-3 py-2 text-xs font-extrabold text-white hover:bg-[#e55a00] disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {savingId === p.id ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
