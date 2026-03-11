'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BadgeCheck, FileText, Package, Truck, XCircle, CheckCircle2, Check, X, Star } from 'lucide-react';
import QuoteChatBox from '@/app/components/QuoteChatBox';

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rounded} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < rounded;
        return (
          <Star
            key={i}
            className={filled ? 'h-3.5 w-3.5 text-[#FF6000] fill-[#FF6000]' : 'h-3.5 w-3.5 text-gray-300'}
          />
        );
      })}
    </div>
  );
}

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
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [sellerRatings, setSellerRatings] = useState<Record<string, { averageRating: number; total: number; profileSlug: string }>>({});
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

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

  useEffect(() => {
    const slugs = offers
      .map((o: any) => (typeof o?.vendor?.slug === 'string' ? o.vendor.slug.trim() : ''))
      .filter((s: string): s is string => Boolean(s));

    const vendorSlugs: string[] = Array.from(new Set<string>(slugs));

    if (vendorSlugs.length === 0) return;

    let cancelled = false;

    (async () => {
      type SellerRatingEntry = {
        vendorSlug: string;
        rating: { averageRating: number; total: number; profileSlug: string };
      };

      const results = await Promise.allSettled<SellerRatingEntry>(
        vendorSlugs.map(async (slug): Promise<SellerRatingEntry> => {
          const res = await fetch(`/api/pro/${encodeURIComponent(slug)}`, { cache: 'no-store' });
          if (!res.ok) throw new Error('not_found');
          const json = (await res.json().catch(() => ({}))) as any;
          const avg = Number(json?.rating?.averageRating);
          const total = Number(json?.rating?.total);
          const profileSlug = String(json?.profile?.slug || slug);
          return {
            vendorSlug: slug,
            rating: {
              averageRating: Number.isFinite(avg) ? avg : 0,
              total: Number.isFinite(total) ? total : 0,
              profileSlug,
            },
          };
        })
      );

      if (cancelled) return;

      setSellerRatings((prev) => {
        const next = { ...prev };
        results.forEach((r) => {
          if (r.status !== 'fulfilled') return;
          const key = r.value.vendorSlug;
          next[key] = r.value.rating;
        });
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [offers]);

  const selectedOffer = useMemo(() => {
    if (!selectedQuote) return null;
    return offers.find((o: any) => String(o?.id) === String(selectedQuote)) ?? null;
  }, [offers, selectedQuote]);

  const canDisputeSelected = useMemo(() => {
    if (!selectedOffer) return false;
    const offerStatus = String(selectedOffer.status);
    const reqStatus = String(data?.status);
    if (selectedOffer.isDisputed) return false;
    return offerStatus === 'PAID' || reqStatus === 'PROCESSING';
  }, [selectedOffer, data?.status]);

  const submitDispute = async () => {
    if (!selectedOffer) return;
    const reason = disputeReason.trim();
    const description = disputeDescription.trim();
    if (!reason) {
      alert('Sorun tipi seçin');
      return;
    }
    if (!description || description.length < 5) {
      alert('Açıklama en az 5 karakter olmalıdır');
      return;
    }

    setDisputeSubmitting(true);
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: String(selectedOffer.id),
          reason,
          description,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json?.error || 'Talep gönderilemedi');
        return;
      }

      setDisputeOpen(false);
      setDisputeReason('');
      setDisputeDescription('');

      const res2 = await fetch(`/api/user/premium-requests/${encodeURIComponent(String(id))}`, { cache: 'no-store' });
      const json2 = await res2.json().catch(() => ({}));
      if (res2.ok) setData(json2);
    } finally {
      setDisputeSubmitting(false);
    }
  };

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

      if (action === 'ACCEPT') {
        router.push(`/checkout/premium/${encodeURIComponent(offerId)}`);
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
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {offers.map((o: any) => (
              <div key={o.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      {typeof o?.vendor?.slug === 'string' && o.vendor.slug.trim() ? (
                        <a
                          href={`https://fabrika.matbaagross.com/${encodeURIComponent(o.vendor.slug.trim())}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-gray-900 truncate hover:underline"
                        >
                          {o.vendor?.name ?? 'Satıcı'}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-gray-900 truncate">{o.vendor?.name ?? 'Satıcı'}</p>
                      )}
                    </div>
                    {(() => {
                      const slug = typeof o?.vendor?.slug === 'string' ? o.vendor.slug.trim() : '';
                      const rating = slug ? sellerRatings[slug] : undefined;
                      if (!slug || !rating) return null;

                      return (
                        <a
                          href={`https://fabrika.matbaagross.com/${encodeURIComponent(String(rating.profileSlug || slug))}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-2 text-xs text-gray-600 hover:underline"
                        >
                          <Stars value={rating.averageRating} />
                          <span className="font-semibold text-gray-800">
                            {rating.averageRating.toFixed(1).replace('.', ',')} ({rating.total} Değerlendirme)
                          </span>
                        </a>
                      );
                    })()}
                    <p className="text-xs text-gray-500 mt-1">Teslimat: {o.deliveryTime}</p>
                  </div>

                  <span className={`shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(o.status)}`}>
                    <BadgeCheck className="h-4 w-4" />
                    {statusText[o.status] ?? o.status}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-xs text-gray-500">Toplam Fiyat</p>
                  <p className="text-lg font-extrabold text-[#16a34a]">
                    {Number(o.totalPrice ?? o.price).toLocaleString('tr-TR')} TL
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedQuote(String(o.id))}
                  className="mt-4 w-full inline-flex items-center justify-center rounded-xl bg-[#FF6000] hover:bg-[#e55a00] text-white font-extrabold px-4 py-3 text-sm transition-colors"
                >
                  Teklifi İncele & Mesajlaş
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOffer ? (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4" onClick={() => setSelectedQuote(null)}>
          <div
            className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Satıcı</p>
                <p className="text-base font-bold text-gray-900 truncate">{selectedOffer.vendor?.name ?? 'Satıcı'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedOffer.createdAt ? new Date(selectedOffer.createdAt).toLocaleString('tr-TR') : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuote(null)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Kapat"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Adet</p>
                  <p className="text-sm font-extrabold text-gray-900 mt-1">{quantity ? quantity.toLocaleString('tr-TR') : '-'}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Birim Fiyat</p>
                  <p className="text-sm font-extrabold text-gray-900 mt-1">
                    {typeof selectedOffer.unitPrice === 'number' && Number.isFinite(selectedOffer.unitPrice)
                      ? `${selectedOffer.unitPrice.toLocaleString('tr-TR')} TL`
                      : '-'}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs text-emerald-700 font-semibold">Toplam Tutar</p>
                  <p className="text-lg font-extrabold text-emerald-800 mt-1">
                    {Number(selectedOffer.totalPrice ?? selectedOffer.price).toLocaleString('tr-TR')} TL
                  </p>
                  <p className="text-xs text-emerald-700 mt-1 inline-flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    {selectedOffer.deliveryTime}
                  </p>
                </div>
              </div>

              {selectedOffer.note ? (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-600">Not</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap mt-1">{selectedOffer.note}</p>
                </div>
              ) : null}

              <QuoteChatBox quoteId={String(selectedOffer.id)} />
            </div>

            <div className="px-5 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3 flex-wrap">
              {canDisputeSelected ? (
                <button
                  type="button"
                  onClick={() => setDisputeOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-red-700 font-extrabold hover:bg-red-100 transition-colors"
                >
                  🚨 Sorun Bildir / Matbaagross Destek İste
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={busyOfferId === selectedOffer.id || selectedOffer.status !== 'PENDING'}
                onClick={() => actOnOffer(String(selectedOffer.id), 'REJECT')}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-800 font-extrabold hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <XCircle className="h-4 w-4" />
                Reddet
              </button>
              <button
                type="button"
                disabled={busyOfferId === selectedOffer.id || selectedOffer.status !== 'PENDING'}
                onClick={() => actOnOffer(String(selectedOffer.id), 'ACCEPT')}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF6000] px-4 py-2.5 text-white font-extrabold hover:bg-[#e55a00] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="h-4 w-4" />
                Onayla
              </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {disputeOpen && selectedOffer ? (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4" onClick={() => setDisputeOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">🚨 Sorun Bildir</h3>
                <p className="text-xs text-gray-500 mt-1">Matbaagross yönetimi incelemeye alacaktır.</p>
              </div>
              <button type="button" className="p-2 rounded-full hover:bg-gray-100" onClick={() => setDisputeOpen(false)} aria-label="Kapat">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600">Sorun Tipi</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                >
                  <option value="">Seçiniz</option>
                  <option value="Üretici yanıt vermiyor">Üretici yanıt vermiyor</option>
                  <option value="Hatalı üretim">Hatalı üretim</option>
                  <option value="Gecikme">Gecikme</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600">Açıklama</label>
                <textarea
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  rows={5}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  placeholder="Detaylı açıklama..."
                />
              </div>

              <button
                type="button"
                onClick={submitDispute}
                disabled={disputeSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-3 transition-colors disabled:opacity-60"
              >
                {disputeSubmitting ? 'Gönderiliyor...' : 'Talebi Gönder'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
