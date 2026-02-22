'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CreditCard, MessageCircle, PackageCheck, ShieldCheck, Store, X } from 'lucide-react';
import { useOffers } from '@/context/OffersContext';

const statusText: Record<string, string> = {
  ODEME_BEKLIYOR: 'Ödeme Bekliyor',
  URETIMDE: 'Üretimde',
  KARGODA: 'Kargoda',
};

export default function PremiumIslerimPage() {
  const { requests, quotes, approveQuote } = useOffers();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tab, setTab] = useState<'recommended' | 'other'>('recommended');
  const [openProducerId, setOpenProducerId] = useState<string | null>(null);

  const producerByQuoteId = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        score: number;
        successRate: number;
        intro: string;
      }
    >();

    for (const q of quotes) {
      const baseScore = typeof q.supplierScore === 'number' ? q.supplierScore : 8.1;
      const mod = (q.requestNo.charCodeAt(0) + q.requestNo.charCodeAt(q.requestNo.length - 1)) % 7;
      const score = Math.round((baseScore + mod * 0.07) * 10) / 10;

      const names = ['Kral Ambalaj', 'Anka Matbaa', 'Altın Baskı', 'Nova Etiket', 'Bosphorus Print'];
      const name = names[(q.requestNo.length + mod) % names.length];

      const successRate = Math.min(99, 90 + mod);
      const intro =
        'Premium üretici ağımızda yer alan, yüksek hacimli işlerde uzman, kalite ve termin performansı doğrulanmış üreticidir.';

      map.set(q.id, { name, score, successRate, intro });
    }

    return map;
  }, [quotes]);

  const entries = useMemo(() => {
    const byRequest = new Map<string, typeof quotes>();
    for (const q of quotes) {
      const arr = byRequest.get(q.requestNo) ?? [];
      arr.push(q);
      byRequest.set(q.requestNo, arr);
    }

    return requests.map((r) => {
      const list = byRequest.get(r.requestNo) ?? [];
      const validOffers = list.filter((q) => q.status === 'OFFER_RECEIVED');
      const best = validOffers.length ? [...validOffers].sort((a, b) => a.price - b.price)[0] : null;
      const supplierScore = typeof best?.supplierScore === 'number' ? best.supplierScore : 7;
      const score = best ? supplierScore * 100 - best.price / 10 : -Infinity;
      return { request: r, bestQuote: best, score };
    });
  }, [quotes, requests]);

  const recommended = useMemo(() => entries.filter((e) => !!e.bestQuote).sort((a, b) => b.score - a.score).slice(0, 5), [entries]);
  const otherOffers = useMemo(() => {
    const sorted = entries.filter((e) => !!e.bestQuote).sort((a, b) => b.score - a.score).slice(5);
    const pending = entries.filter((e) => !e.bestQuote);
    return [...sorted, ...pending];
  }, [entries]);

  const visible = tab === 'recommended' ? recommended : otherOffers;

  return (
    <div className="py-2 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Premium İşlerim</h1>
        <p className="text-gray-600 text-sm mt-0.5">Taleplerinize gelen teklifleri buradan onaylayın.</p>
      </div>

      <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setTab('recommended')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === 'recommended' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Önerilenler ({recommended.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('other')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === 'other' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Diğer Teklifler ({otherOffers.length})
        </button>
      </div>

      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-gray-600">
            Henüz teklif yok.
          </div>
        ) : (
          visible.map(({ request, bestQuote }) => (
            <div key={request.requestNo} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Talep No</p>
                  <p className="font-mono text-sm text-gray-800">{request.requestNo}</p>
                  {bestQuote && (bestQuote.status === 'URETIMDE' || bestQuote.status === 'KARGODA') ? (
                    <div className="mt-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Üretici</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{producerByQuoteId.get(bestQuote.id)?.name ?? 'Üretici'}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Puan: <span className="font-semibold">{(producerByQuoteId.get(bestQuote.id)?.score ?? 8.5).toFixed(1)}/10</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setOpenProducerId((prev) => (prev === bestQuote.id ? null : bestQuote.id))}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                      >
                        <Store className="h-4 w-4" />
                        Üretici Profili
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 mt-1">{request.productTitle || request.productGroup}</p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">Teklif Tutarı</p>
                  {bestQuote ? (
                    <>
                      <p className="text-lg font-bold text-[#16a34a]">{bestQuote.price.toLocaleString('tr-TR')} TL</p>
                      {typeof bestQuote.deliveryDays === 'number' && bestQuote.deliveryDays > 0 ? (
                        <p className="text-xs text-gray-700 mt-1">
                          Teslimat: <span className="font-semibold">{bestQuote.deliveryDays} İş Günü</span>
                        </p>
                      ) : null}
                      {bestQuote.sellerNote?.trim() ? (
                        <p className="text-xs text-gray-700 mt-1 max-w-[360px]">
                          Satıcı Notu: <span className="font-semibold">{bestQuote.sellerNote}</span>
                        </p>
                      ) : null}
                      <p className="text-xs mt-1">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${
                            bestQuote.status === 'URETIMDE' || bestQuote.status === 'KARGODA'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <PackageCheck className="h-4 w-4" />
                          {statusText[bestQuote.status] ?? bestQuote.status}
                        </span>
                      </p>
                    </>
                  ) : (
                    <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 animate-pulse">
                      ⏳ Teklif Bekleniyor
                    </div>
                  )}
                </div>
              </div>

              {bestQuote && (bestQuote.status === 'URETIMDE' || bestQuote.status === 'KARGODA') && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-900">
                    Tebrikler! İşiniz uzman partnerimiz {producerByQuoteId.get(bestQuote.id)?.name ?? 'üretici'} tarafından teslim alındı ve üretim hattına girdi.
                  </p>
                </div>
              )}

              {bestQuote && openProducerId === bestQuote.id && (bestQuote.status === 'URETIMDE' || bestQuote.status === 'KARGODA') && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900">{producerByQuoteId.get(bestQuote.id)?.name ?? 'Üretici'}</p>
                      <p className="text-sm text-gray-700 mt-1">{producerByQuoteId.get(bestQuote.id)?.intro ?? ''}</p>
                      <p className="text-sm text-gray-700 mt-3 inline-flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-700" />
                        Başarı oranı: <span className="font-semibold">%{producerByQuoteId.get(bestQuote.id)?.successRate ?? 93}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpenProducerId(null)}
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-50"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <div className="flex items-center gap-2">
                  {bestQuote && bestQuote.status === 'URETIMDE' && (
                    <Link
                      href="/seller-dashboard/questions"
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Üreticiye Soru Sor
                    </Link>
                  )}

                  {bestQuote ? (
                    bestQuote.status === 'OFFER_RECEIVED' ? (
                      <button
                        type="button"
                        disabled={busyId === bestQuote.id}
                        onClick={() => {
                          setBusyId(bestQuote.id);
                          window.setTimeout(() => {
                            approveQuote(bestQuote.id);
                            setBusyId(null);
                          }, 600);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#FF6000] px-4 py-2 text-white font-semibold hover:bg-[#e55a00] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <CreditCard className="h-4 w-4" />
                        {busyId === bestQuote.id ? 'İşleniyor...' : 'Onayla ve Öde'}
                      </button>
                    ) : null
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        const lines = [
                          `Talep No: ${request.requestNo}`,
                          request.productTitle ? `Ürün: ${request.productTitle}` : null,
                          request.quantity ? `Adet: ${request.quantity.toLocaleString('tr-TR')}` : null,
                          request.requestSummary ? `Özet: ${request.requestSummary}` : null,
                          request.technicalDetails ? `Teknik Detay: ${request.technicalDetails}` : null,
                        ].filter(Boolean);
                        alert(lines.join('\n'));
                      }}
                    >
                      Detayları Gör
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
