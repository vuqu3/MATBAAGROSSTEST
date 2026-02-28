'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BadgeCheck, FileText, Package, Truck, XCircle, CheckCircle2, Check } from 'lucide-react';

export default function PremiumIslerimDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id;

  const isPaidRedirect = searchParams?.get('paid') === '1';
  const paidOfferId = searchParams?.get('offerId');

  const [loading, setLoading] = useState(true);
  const [busyOfferId, setBusyOfferId] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/user/premium-requests/${encodeURIComponent(id)}`, { cache: 'no-store' });
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          setData(json);
        } else {
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  const offers = useMemo(() => (Array.isArray(data?.offers) ? data.offers : []), [data]);

  const paidOffer = useMemo(() => {
    if (!isPaidRedirect || !paidOfferId) return null;
    const match = offers.find((o: any) => String(o?.id) === String(paidOfferId));
    if (!match) return null;
    if (String(match.status) !== 'PAID') return null;
    return match;
  }, [isPaidRedirect, paidOfferId, offers]);

  const quantity = useMemo(() => {
    const q = Number(data?.quantity);
    return Number.isFinite(q) && q > 0 ? q : null;
  }, [data?.quantity]);

  const statusText: Record<string, string> = {
    PENDING: 'Beklemede',
    ACCEPTED: 'Onaylandı',
    REJECTED: 'Reddedildi',
  };

  const statusBadgeClass = (s: string) =>
    s === 'ACCEPTED'
      ? 'bg-emerald-100 text-emerald-800'
      : s === 'REJECTED'
        ? 'bg-rose-100 text-rose-800'
        : 'bg-amber-100 text-amber-800';

  const actOnOffer = async (offerId: string, action: 'ACCEPT' | 'REJECT') => {
    if (action === 'ACCEPT') {
      router.push(`/checkout/premium/${encodeURIComponent(offerId)}`);
      return;
    }

    setBusyOfferId(offerId);
    try {
      const res = await fetch(`/api/premium-quote-offers/${encodeURIComponent(offerId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json?.error || 'Güncellenemedi');
        return;
      }
      // Refresh
      const res2 = await fetch(`/api/user/premium-requests/${encodeURIComponent(String(id))}`, { cache: 'no-store' });
      const json2 = await res2.json().catch(() => ({}));
      if (res2.ok) setData(json2);
    } finally {
      setBusyOfferId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-gray-600">
        Yükleniyor...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.push('/hesabim/premium-islerim')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri
        </button>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-gray-600">
          Talep bulunamadı.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/hesabim/premium-islerim"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Premium İşlerim
        </Link>
        <span className="text-xs text-gray-500">{data.createdAt ? new Date(data.createdAt).toLocaleString('tr-TR') : ''}</span>
      </div>

      {paidOffer ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-100 border border-green-200 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-green-900">Premium Siparişiniz Alındı</h2>
                <p className="text-sm text-green-800 mt-0.5">
                  Matbaagross Premium siparişiniz alınmıştır ve üreticiye bilgi geçilmiştir. Siparişleriniz Matbaagross güvencesi altında üretime başlayacaktır.
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-green-700 font-semibold">Talep No</p>
              <p className="font-mono text-sm text-green-900">{data.requestNo}</p>
            </div>
          </div>

          <div className="bg-white border-t border-green-200 p-4 sm:p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-gray-500">Ürün</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{data.productName}</p>
                <p className="text-xs text-gray-600 mt-1">Üretici: {paidOffer.vendor?.name ?? 'Satıcı'}</p>
                <p className="text-xs text-gray-600 mt-1">Teslimat: {paidOffer.deliveryTime}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold text-gray-600">Sipariş Özeti</p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Adet</span>
                    <span className="font-semibold text-gray-900">{quantity ? quantity.toLocaleString('tr-TR') : '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Birim Fiyat</span>
                    <span className="font-semibold text-gray-900">
                      {typeof paidOffer.unitPrice === 'number' && Number.isFinite(paidOffer.unitPrice)
                        ? `${paidOffer.unitPrice.toLocaleString('tr-TR')} TL`
                        : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Genel Toplam</span>
                    <span className="text-base font-extrabold text-[#16a34a]">
                      {Number(paidOffer.totalPrice ?? paidOffer.price).toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Talep No</p>
            <p className="font-mono text-sm text-gray-800">{data.requestNo}</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{data.productName}</p>
            <p className="text-xs text-gray-600 mt-1">Adet: {Number(data.quantity).toLocaleString('tr-TR')}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            <Package className="h-4 w-4" />
            {String(data.status)}
          </div>
        </div>

        {data.description ? (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold text-gray-600">Açıklama</p>
            <p className="text-sm text-gray-900 whitespace-pre-wrap mt-1">{data.description}</p>
          </div>
        ) : null}

        {data.technicalDetails ? (
          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-600">Teknik Detay</p>
            <p className="text-sm text-gray-900 whitespace-pre-wrap mt-1">{data.technicalDetails}</p>
          </div>
        ) : null}

        {data.fileUrl ? (
          <div className="mt-3">
            <a
              href={data.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF6000] hover:underline"
            >
              <FileText className="h-4 w-4" />
              Ekli dosyayı görüntüle
            </a>
          </div>
        ) : null}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900">Gelen Teklifler</h2>

        {offers.length === 0 ? (
          <div className="mt-3 text-sm text-gray-600">Henüz teklif gelmedi.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {offers.map((o: any) => (
              <div key={o.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{o.vendor?.name ?? 'Satıcı'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {o.createdAt ? new Date(o.createdAt).toLocaleString('tr-TR') : ''}
                    </p>
                    {o.note ? (
                      <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{o.note}</p>
                    ) : null}
                  </div>

                  <div className="text-right">
                    <div className="space-y-1">
                      <div>
                        <p className="text-xs text-gray-500">Adet</p>
                        <p className="text-sm font-semibold text-gray-900">{quantity ? quantity.toLocaleString('tr-TR') : '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Birim Fiyat</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {typeof o.unitPrice === 'number' && Number.isFinite(o.unitPrice)
                            ? `${o.unitPrice.toLocaleString('tr-TR')} TL`
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Toplam Tutar</p>
                        <p className="text-lg font-bold text-[#16a34a]">
                          {Number(o.totalPrice ?? o.price).toLocaleString('tr-TR')} TL
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Teslimat</p>
                    <p className="text-sm font-semibold text-gray-800 inline-flex items-center gap-2 justify-end">
                      <Truck className="h-4 w-4" />
                      {o.deliveryTime}
                    </p>

                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(o.status)}`}>
                        <BadgeCheck className="h-4 w-4" />
                        {statusText[o.status] ?? o.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={busyOfferId === o.id || o.status !== 'PENDING'}
                        onClick={() => actOnOffer(o.id, 'REJECT')}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <XCircle className="h-4 w-4" />
                        Reddet
                      </button>
                      <button
                        type="button"
                        disabled={busyOfferId === o.id || o.status !== 'PENDING'}
                        onClick={() => actOnOffer(o.id, 'ACCEPT')}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#FF6000] px-3 py-2 text-white font-semibold hover:bg-[#e55a00] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Onayla
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
