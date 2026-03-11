'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

export default function PremiumCheckoutPage() {
  const params = useParams<{ offerId: string }>();
  const router = useRouter();
  const offerId = params?.offerId;

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [approvalChecked, setApprovalChecked] = useState(false);
  const [approvalTouched, setApprovalTouched] = useState(false);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

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

  const payableText = useMemo(() => {
    const t = Number(totals?.payable);
    return Number.isFinite(t) ? `${t.toLocaleString('tr-TR')} TL` : '-';
  }, [totals?.payable]);

  const pay = async () => {
    if (!offerId) return;
    setApprovalTouched(true);
    setPayError(null);
    if (!approvalChecked) {
      setPayError('Devam etmek için üretim şartlarını onaylamanız gerekir.');
      return;
    }
    setPaying(true);
    try {
      const res = await fetch(`/api/premium-checkout/${encodeURIComponent(offerId)}`, {
        method: 'POST',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPayError(typeof json?.error === 'string' ? json.error : 'Ödeme başlatılamadı');
        return;
      }
      const url = typeof json?.iframeUrl === 'string' ? json.iframeUrl : null;
      if (!url) {
        setPayError('PayTR ödeme ekranı yüklenemedi');
        return;
      }
      setIframeUrl(url);
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
              <p className="text-xs text-gray-500">Ödenecek Tutar</p>
              <p className="text-lg font-extrabold text-[#16a34a] mt-1">{payableText}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-900">PayTR ile Güvenli Ödeme</p>
              <Image src="/paytr-logo.svg" alt="PayTR" width={72} height={22} className="h-6 w-auto" />
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <label className="flex items-start gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4"
                  checked={approvalChecked}
                  onChange={(e) => {
                    setApprovalChecked(e.target.checked);
                    setApprovalTouched(true);
                    setPayError(null);
                  }}
                  required
                />
                <span>
                  Matbaacılık standartları gereği; dijital ekran renkleri (RGB) ile ofset/dijital baskı renkleri (CMYK) arasında %5 ile %10 arasında ton farkı oluşabileceğini ve giyotin kesim işlemlerinde 1-2 mm'lik tolerans payı olabileceğini biliyor, üretim şartlarını onaylıyorum.
                </span>
              </label>
              {approvalTouched && !approvalChecked ? (
                <div className="mt-2 flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>Devam etmek için onay kutusunu işaretleyin.</span>
                </div>
              ) : null}
            </div>

            {payError ? (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{payError}</span>
              </div>
            ) : null}

            {iframeUrl ? (
              <div className="mt-4">
                <iframe
                  src={iframeUrl}
                  className="w-full h-[620px] rounded-xl border border-gray-200 bg-white"
                  title="PayTR Ödeme"
                />
              </div>
            ) : (
              <button
                type="button"
                disabled={paying}
                onClick={pay}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6000] px-4 py-3 text-white font-extrabold hover:bg-[#e55a00] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {paying ? 'İşleniyor...' : 'PayTR ile Ödemeye Geç'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
