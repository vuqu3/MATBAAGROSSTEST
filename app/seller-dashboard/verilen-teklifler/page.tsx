'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';

export default function VerilenTekliflerPage() {
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<any[]>([]);

  const rows = useMemo(() => {
    return offers.map((o) => ({
      ...o,
      createdAtText: o.createdAt ? new Date(o.createdAt).toLocaleString('tr-TR') : '-',
      requestStatus: o?.requestStatus ?? o?.request?.status,
    }));
  }, [offers]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/seller/premium-quotes', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setOffers(Array.isArray(data?.offers) ? data.offers : []);
        } else {
          setOffers([]);
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const resultStatus = (o: any) => {
    const offerStatus = String(o?.status ?? '').toUpperCase();
    const requestStatus = String(o?.requestStatus ?? o?.request?.status ?? '').toUpperCase();

    if (offerStatus === 'REJECTED') {
      if (requestStatus === 'QUOTED' || requestStatus === 'PROCESSING' || requestStatus === 'COMPLETED') {
        return { text: 'İş Başkasına Verildi', tone: 'bg-slate-100 text-slate-800' };
      }
      return { text: 'Reddedildi', tone: 'bg-rose-100 text-rose-800' };
    }

    if (offerStatus === 'ACCEPTED') {
      return { text: 'Ödeme Bekleniyor', tone: 'bg-blue-100 text-blue-800' };
    }

    if (offerStatus === 'PAID') {
      return { text: 'Onaylandı', tone: 'bg-emerald-100 text-emerald-800' };
    }

    return { text: 'Müşteri Değerlendiriyor', tone: 'bg-amber-100 text-amber-800' };
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Verilen Teklifler</h1>
        <p className="text-sm text-gray-500 mt-1">Gönderdiğiniz teklifler</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Talep No</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">İş</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Tutar</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Teslimat</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Durum</th>
                <th className="text-right font-semibold text-gray-600 px-4 py-3">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    Henüz teklif vermediniz.
                  </td>
                </tr>
              ) : (
                rows.map((q) => (
                  <tr key={q.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-gray-800">{q.requestNo}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <Link
                        href={`/seller-dashboard/verilen-teklifler/${encodeURIComponent(String(q.id))}`}
                        className="font-semibold text-[#FF6000] hover:underline"
                      >
                        {q.requestTitle ?? '-'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{Number(q.price).toLocaleString('tr-TR')} TL</td>
                    <td className="px-4 py-3 text-gray-700">{q.deliveryTime || '-'}</td>
                    <td className="px-4 py-3">
                      {(() => {
                        const st = resultStatus(q);
                        return (
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${st.tone}`}
                      >
                        <BadgeCheck className="h-4 w-4" />
                        {st.text}
                      </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-right text-gray-600 text-xs">{q.createdAtText}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
