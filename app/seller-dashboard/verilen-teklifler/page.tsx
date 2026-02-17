'use client';

import { useMemo, useState } from 'react';
import { BadgeCheck, PencilLine, Save, X } from 'lucide-react';
import { useOffers } from '@/context/OffersContext';

const statusText: Record<string, string> = {
  ODEME_BEKLIYOR: 'Ödeme Bekliyor',
  URETIMDE: 'Üretimde',
  KARGODA: 'Kargoda',
};

export default function VerilenTekliflerPage() {
  const { quotes, updateQuotePrice } = useOffers();
  const [reviseId, setReviseId] = useState<string | null>(null);
  const [reviseValue, setReviseValue] = useState<string>('');

  const rows = useMemo(() => {
    // Satıcı tarafında: bu demo'da satıcının teklifi partnerLabel === 'Benim Teklifim'
    const mine = quotes.filter((q) => q.partnerLabel === 'Benim Teklifim');

    // Kural: Bir Talep için tek satır. (Upsert zaten sağlıyor; yine de güvenli olalım.)
    const map = new Map<string, (typeof mine)[number]>();
    for (const q of mine) {
      map.set(q.requestNo, q);
    }
    return Array.from(map.values());
  }, [quotes]);

  const priceRankByQuoteId = useMemo(() => {
    const map = new Map<string, { rank: number; total: number; lowest: number | null }>();

    const grouped = new Map<string, number[]>();
    for (const q of quotes) {
      const arr = grouped.get(q.requestNo) ?? [];
      arr.push(q.price);
      grouped.set(q.requestNo, arr);
    }

    const sortedByRequest = new Map<string, number[]>();
    for (const [requestNo, prices] of grouped.entries()) {
      sortedByRequest.set(requestNo, [...prices].sort((a, b) => a - b));
    }

    for (const q of quotes) {
      const sorted = sortedByRequest.get(q.requestNo) ?? [];
      const lowest = sorted.length ? sorted[0] : null;
      const rank = sorted.length ? sorted.findIndex((p) => p === q.price) + 1 : 0;
      map.set(q.id, { rank: rank || 0, total: sorted.length, lowest });
    }

    return map;
  }, [quotes]);

  const numericEditPrice = useMemo(() => {
    const normalized = reviseValue.replace(/\./g, '').replace(',', '.');
    const n = Number(normalized);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [reviseValue]);

  const activeQuote = useMemo(() => {
    if (!reviseId) return null;
    return rows.find((r) => r.id === reviseId) ?? null;
  }, [reviseId, rows]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Verilen Teklifler</h1>
        <p className="text-sm text-gray-500 mt-1">Gönderdiğiniz teklifler (Demo liste)</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Talep No</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Tutar</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Durum</th>
                <th className="text-right font-semibold text-gray-600 px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                    Henüz teklif vermediniz.
                  </td>
                </tr>
              ) : (
                rows.map((q) => (
                  <tr key={q.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-gray-800">{q.requestNo}</td>
                    <td className="px-4 py-3 text-gray-700">{q.price.toLocaleString('tr-TR')} TL</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                          q.status === 'URETIMDE' || q.status === 'KARGODA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <BadgeCheck className="h-4 w-4" />
                        {statusText[q.status] ?? q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={q.status === 'URETIMDE' || q.status === 'KARGODA'}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#FF6000] px-3 py-2 text-white font-semibold hover:bg-[#e55a00] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          onClick={() => {
                            setReviseId(q.id);
                            setReviseValue(String(q.price));
                          }}
                        >
                          <PencilLine className="h-4 w-4" />
                          Fiyatı Revize Et
                        </button>
                      </div>

                      {(() => {
                        const rankInfo = priceRankByQuoteId.get(q.id);
                        if (!rankInfo || rankInfo.total <= 1 || rankInfo.rank <= 0) return null;
                        return (
                          <p className="mt-2 text-xs text-gray-600 text-right">
                            {rankInfo.rank === 1
                              ? 'Tebrikler! Şu an en düşük fiyattasınız.'
                              : `Teklifiniz fiyat olarak ${rankInfo.rank}. sırada.`}
                          </p>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reviseId && activeQuote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setReviseId(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
              <div>
                <p className="text-xs text-gray-500">Revizyon</p>
                <h2 className="text-lg font-bold text-gray-900">
                  Talep: <span className="font-mono">{activeQuote.requestNo}</span>
                </h2>
              </div>

              <button
                type="button"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-50"
                onClick={() => setReviseId(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Eski Fiyat</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{activeQuote.price.toLocaleString('tr-TR')} TL</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
                <label className="block text-sm font-semibold text-gray-800">Yeni Teklifiniz (TL)</label>
                <input
                  value={reviseValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReviseValue(e.target.value)}
                  inputMode="decimal"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-orange-200"
                  placeholder="Örn: 1450"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                className="rounded-lg px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => setReviseId(null)}
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={!numericEditPrice}
                className="inline-flex items-center gap-2 rounded-lg bg-[#FF6000] px-4 py-2 text-white font-semibold hover:bg-[#e55a00] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => {
                  if (!numericEditPrice) return;
                  updateQuotePrice(activeQuote.id, numericEditPrice);
                  setReviseId(null);
                }}
              >
                <Save className="h-4 w-4" />
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
