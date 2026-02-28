'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CreditCard, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PremiumCheckoutPage() {
  const params = useParams<{ offerId: string }>();
  const router = useRouter();
  const offerId = params?.offerId;

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!offerId) return;
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/premium-checkout/${encodeURIComponent(offerId)}`, { cache: 'no-store' });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setData(null);
          setLoadError(typeof json?.error === 'string' ? json.error : 'Teklif alınamadı');
          return;
        }
        setData(json);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [offerId]);

  const offer = useMemo(() => data?.offer ?? null, [data]);
  const totals = useMemo(() => data?.totals ?? null, [data]);

  const quantityText = useMemo(() => {
    const q = Number(offer?.request?.quantity);
    return Number.isFinite(q) ? q.toLocaleString('tr-TR') : '-';
  }, [offer?.request?.quantity]);

  const unitPriceText = useMemo(() => {
    const v = offer?.unitPrice;
    return typeof v === 'number' && Number.isFinite(v) ? `${v.toLocaleString('tr-TR')} TL` : '-';
  }, [offer?.unitPrice]);

  const totalText = useMemo(() => {
    const t = Number(totals?.total);
    return Number.isFinite(t) ? `${t.toLocaleString('tr-TR')} TL` : '-';
  }, [totals?.total]);

  const finalText = useMemo(() => {
    const rate = Number(totals?.commissionRate);
    const total = Number(totals?.total);
    if (!Number.isFinite(rate) || !Number.isFinite(total)) return '-';
    const final = Math.round(total * (1 + rate) * 100) / 100;
    return `${final.toLocaleString('tr-TR')} TL`;
  }, [totals?.commissionRate, totals?.total]);

  const pay = async () => {
    if (!offer) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/premium-checkout/${encodeURIComponent(offerId)}`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || 'Ödeme alınamadı');
        return;
      }
      // Redirect to request detail page to show order summary
      router.push(
        `/hesabim/premium-islerim/${encodeURIComponent(offer.request.id)}?paid=1&offerId=${encodeURIComponent(
          offer.id
        )}`
      );
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-gray-600">Yükleniyor...</div>
    );
  }

  if (loadError || !offer) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri
        </button>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-gray-600">
          {loadError || 'Teklif bulunamadı.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri
        </button>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Güvenli Ödeme (Escrow)
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Premium Ödeme</h1>
        <p className="text-sm text-gray-500 mt-1">Teklif: {offer?.request?.requestNo}</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-500">Ürün</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{offer?.request?.productName ?? '-'}</p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-500">Adet</p>
                <p className="text-sm font-semibold text-gray-900">{quantityText}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Birim</p>
                <p className="text-sm font-semibold text-gray-900">{unitPriceText}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Toplam</p>
                <p className="text-sm font-semibold text-gray-900">{totalText}</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-500">Müşteriye gidecek son fiyat (komisyon dahil)</p>
              <p className="text-lg font-extrabold text-[#16a34a] mt-1">{finalText}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Ödeme Bilgileri
            </p>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600">Kart Üzerindeki İsim</label>
                <input className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2" placeholder="Ad Soyad" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">Kart Numarası</label>
                <input className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2" placeholder="0000 0000 0000 0000" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">Son Kullanma</label>
                <input className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2" placeholder="AA/YY" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">CVV</label>
                <input className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2" placeholder="***" />
              </div>
            </div>

            <button
              type="button"
              disabled={paying}
              onClick={pay}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6000] px-4 py-3 text-white font-extrabold hover:bg-[#e55a00] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {paying ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
