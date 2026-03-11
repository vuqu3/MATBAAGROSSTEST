'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ShieldCheck, RefreshCcw, Receipt, AlertTriangle, Sparkles } from 'lucide-react';

type VendorMe = {
  id: string;
  name: string;
  slug: string;
  subscriptionStatus?: string | null;
  subscriptionEndsAt?: string | null;
};

type MeResponse = {
  vendor: VendorMe | null;
  applicationStatus?: string | null;
};

type SubscriptionPlan = {
  id: string;
  name: string;
  durationDays: number;
  price: number;
};

function daysLeftFromEndsAt(endsAt: string | null | undefined) {
  if (!endsAt) return null;
  const endsAtMs = new Date(endsAt).getTime();
  if (!Number.isFinite(endsAtMs)) return null;
  const ms = endsAtMs - Date.now();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

export default function SellerSubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vendor, setVendor] = useState<VendorMe | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let initialDone = false;

    const run = async () => {
      if (!initialDone) setLoading(true);
      setError(null);
      try {
        const meRes = await fetch('/api/seller/me', { cache: 'no-store' });
        const meJson = (await meRes.json().catch(() => ({}))) as MeResponse;
        if (!meRes.ok) {
          if (!cancelled) setError(typeof (meJson as any)?.error === 'string' ? (meJson as any).error : 'Veriler alınamadı');
          return;
        }
        if (!cancelled) setVendor(meJson.vendor ?? null);

        // Plans are non-blocking: failure should not crash the page.
        if (!cancelled) {
          setPlansLoading(true);
          setPlansError(null);
        }

        try {
          const plansRes = await fetch('/api/seller/subscription-plans', { cache: 'no-store' });
          const plansJson = await plansRes.json().catch(() => ({}));
          if (plansRes.ok) {
            if (!cancelled) {
              setPlans(Array.isArray(plansJson?.plans) ? (plansJson.plans as SubscriptionPlan[]) : []);
            }
          } else {
            if (!cancelled) {
              setPlansError(typeof plansJson?.error === 'string' ? plansJson.error : 'Paketler alınamadı');
            }
          }
        } catch {
          if (!cancelled) setPlansError('Paketler alınamadı');
        } finally {
          if (!cancelled) setPlansLoading(false);
        }
      } catch {
        if (!cancelled) setError('Veriler alınamadı');
      } finally {
        if (!cancelled) {
          setLoading(false);
          initialDone = true;
        }
      }
    };

    run();

    const onFocus = () => { if (initialDone) run(); };
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && initialDone) run();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const endsAt = vendor?.subscriptionEndsAt ?? null;
  const daysLeft = useMemo(() => daysLeftFromEndsAt(endsAt), [endsAt]);
  const statusRaw = String(vendor?.subscriptionStatus ?? '').toUpperCase();

  const endsAtMs = endsAt ? new Date(endsAt).getTime() : NaN;
  const hasValidEndsAt = Number.isFinite(endsAtMs);
  const isFutureByDate = hasValidEndsAt ? endsAtMs > Date.now() : false;

  const isBlockedByStatus = statusRaw === 'CANCELLED' || statusRaw === 'EXPIRED';
  const statusAllows = statusRaw === 'ACTIVE' || statusRaw === 'TRIAL';

  // Active if date is in the future OR status allows and no (valid) expired date.
  const isActive = !isBlockedByStatus && (isFutureByDate || (statusAllows && (daysLeft == null || daysLeft > 0)));
  const isExpired = !isActive;

  const headline = useMemo(() => {
    if (statusRaw === 'TRIAL' && daysLeft != null && daysLeft > 0) {
      return `Deneme sürenizin bitmesine ${daysLeft} gün kaldı.`;
    }
    if (statusRaw === 'ACTIVE' && daysLeft != null && daysLeft > 0) {
      return `Aboneliğinizin bitmesine ${daysLeft} gün kaldı.`;
    }
    if (statusRaw === 'CANCELLED') {
      return 'Aboneliğiniz iptal edildi. Yenilemek için ödeme yapın.';
    }
    if (isExpired) {
      return 'Aboneliğinizin süresi doldu. Paneli kullanmak için yenilemeniz gerekiyor.';
    }
    return 'Abonelik durumunuz güncelleniyor.';
  }, [daysLeft, isExpired, statusRaw]);

  const onStartOrRenew = async (planId: string) => {
    setSubmitting(true);
    setError(null);
    setIframeUrl(null);
    try {
      const res = await fetch('/api/seller/subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json?.error === 'string' ? json.error : 'Ödeme başlatılamadı');
        return;
      }
      const url = typeof json?.iframeUrl === 'string' ? json.iframeUrl : null;
      if (!url) {
        setError('PayTR ödeme ekranı yüklenemedi');
        return;
      }
      setIframeUrl(url);
    } catch {
      setError('İşlem başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  const sortedPlans = useMemo(
    () => plans.slice().sort((a, b) => a.durationDays - b.durationDays),
    [plans]
  );

  const reloadPlans = async () => {
    setPlansLoading(true);
    setPlansError(null);
    try {
      const plansRes = await fetch('/api/seller/subscription-plans', { cache: 'no-store' });
      const plansJson = await plansRes.json().catch(() => ({}));
      if (!plansRes.ok) {
        setPlansError(typeof plansJson?.error === 'string' ? plansJson.error : 'Paketler alınamadı');
        return;
      }
      setPlans(Array.isArray(plansJson?.plans) ? (plansJson.plans as SubscriptionPlan[]) : []);
    } catch {
      setPlansError('Paketler alınamadı');
    } finally {
      setPlansLoading(false);
    }
  };

  const priceText = (price: number) => {
    if (!Number.isFinite(price)) return '-';
    return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(price);
  };

  const totalWithVat = (price: number) => {
    const total = Math.round(price * 1.2 * 100) / 100;
    return total;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <p className="text-xs font-semibold text-slate-500">Abonelik & Fatura</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{headline}</h1>
        <p className="mt-2 text-sm text-slate-600">Aboneliğiniz aktif değilse teklif havuzu ve mesajlaşma özellikleri kilitlenir.</p>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className={`mt-6 rounded-2xl border p-6 flex items-start justify-between gap-4 ${isExpired ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
          <div>
            <p className="text-xs font-semibold text-slate-600">Güncel Abonelik Durumu</p>
            <p className={`mt-1 text-lg font-extrabold ${isExpired ? 'text-amber-900' : 'text-emerald-800'}`}>
              {isExpired ? 'Süresi Doldu' : 'Aboneliğiniz Aktif'}
            </p>
            <p className={`mt-1 text-sm ${isExpired ? 'text-amber-800' : 'text-emerald-800'}`}>
              {isExpired
                ? 'Paneli tam kullanmak için paket seçip sürenizi uzatın.'
                : `Bitmesine ${daysLeft != null ? `${daysLeft} gün` : 'bir süre'} kaldı.`}
            </p>
            <p className="mt-2 text-xs text-slate-600">
              Durum: <span className="font-bold">{statusRaw || '—'}</span> • Bitiş: {endsAt && hasValidEndsAt ? new Date(endsAt).toLocaleDateString('tr-TR') : '—'}
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-slate-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Güvenli Ödeme (PayTR)
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-base font-extrabold text-slate-900">Aboneliği Uzat / Paketler</h2>
          <p className="mt-1 text-sm text-slate-600">Aktif aboneliğiniz olsa bile buradan süre ekleyebilirsiniz.</p>

          {plansLoading ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Paketler yükleniyor...</div>
          ) : plansError ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <p className="text-sm font-semibold text-amber-900">Paketler alınamadı</p>
              <p className="mt-1 text-sm text-amber-800">{plansError}</p>
              <button
                type="button"
                onClick={reloadPlans}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#FF6000] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#e55a00]"
              >
                Tekrar Dene
              </button>
            </div>
          ) : sortedPlans.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <p className="text-sm font-semibold text-amber-900">Henüz paket bulunmuyor</p>
              <p className="mt-1 text-sm text-amber-800">
                Paketler veritabanında yoksa sistem otomatik oluşturur. Birkaç saniye sonra tekrar deneyin.
              </p>
              <button
                type="button"
                onClick={reloadPlans}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#FF6000] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#e55a00]"
              >
                Tekrar Dene
              </button>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
              {sortedPlans.map((plan) => {
                const popular = plan.durationDays === 90;
                const total = totalWithVat(plan.price);
                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl border bg-white p-6 shadow-sm ${popular ? 'border-orange-300 shadow-[0_20px_50px_rgba(255,96,0,0.12)]' : 'border-slate-200'}`}
                  >
                    {popular ? (
                      <div className="absolute -top-3 left-6 inline-flex items-center gap-2 rounded-full bg-orange-600 px-3 py-1 text-[11px] font-extrabold text-white">
                        <Sparkles className="h-3.5 w-3.5" />
                        En Popüler
                      </div>
                    ) : null}

                    <p className="text-sm font-extrabold text-slate-900">{plan.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{plan.durationDays} gün</p>

                    <div className="mt-4">
                      <p className="text-3xl font-extrabold text-slate-900">{priceText(plan.price)} TL</p>
                      <p className="text-xs font-semibold text-slate-600">+ KDV</p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">Toplam: {priceText(total)} TL</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onStartOrRenew(plan.id)}
                      disabled={submitting}
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF6000] px-4 py-3 text-white font-extrabold hover:bg-[#e55a00] transition-colors disabled:opacity-60"
                    >
                      {isExpired ? <RefreshCcw className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                      Hemen Satın Al
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {iframeUrl ? (
            <div className="mt-6">
              <iframe
                src={iframeUrl}
                className="w-full h-[680px] rounded-2xl border border-slate-200 bg-white"
                title="PayTR Abonelik"
              />
            </div>
          ) : null}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-slate-600" />
              <p className="text-sm font-extrabold text-slate-900">Fatura Bilgileri</p>
            </div>
            <p className="mt-2 text-sm text-slate-600">Faturalandırma bilgileri ve e-fatura entegrasyonu bu alana eklenecek.</p>
          </div>
          <div className={`rounded-2xl border p-5 ${isExpired ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${isExpired ? 'text-amber-700' : 'text-emerald-700'}`} />
              <p className="text-sm font-extrabold text-slate-900">Erişim Durumu</p>
            </div>
            <p className="mt-2 text-sm text-slate-700">
              {isExpired
                ? 'Aboneliğiniz aktif değil. Yenilediğinizde tüm panel özellikleri tekrar açılır.'
                : 'Aboneliğiniz aktif. Teklif havuzu ve mesajlaşma erişiminiz açık.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
