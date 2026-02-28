'use client';

import { useEffect, useMemo, useState } from 'react';

export default function OnaylananTekliflerPage() {
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch('/api/seller/approved-premium-offers', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setOffers([]);
          setLoadError(typeof data?.error === 'string' ? data.error : 'Veriler alınamadı');
          return;
        }
        setOffers(Array.isArray(data?.offers) ? data.offers : []);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const rows = useMemo(() => {
    return offers.map((o) => {
      const qty = Number(o?.request?.quantity);
      const total = Number(o?.totalPrice ?? o?.price);
      return {
        ...o,
        quantityText: Number.isFinite(qty) ? qty.toLocaleString('tr-TR') : '-',
        totalText: Number.isFinite(total) ? `${total.toLocaleString('tr-TR')} TL` : '-',
        createdAtText: o.createdAt ? new Date(o.createdAt).toLocaleString('tr-TR') : '-',
        customerText: o?.request?.user?.name || o?.request?.user?.email || '-',
        requestNo: o?.request?.requestNo ?? '-',
        productName: o?.request?.productName ?? '-',
      };
    });
  }, [offers]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Onaylanan Teklifler</h1>
        <p className="text-sm text-gray-500 mt-1">Ödemesi alınmış (Escrow) Premium işleriniz</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Talep No</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Müşteri</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">İş</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Adet</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Toplam Tutar</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Teslimat</th>
                <th className="text-right font-semibold text-gray-600 px-4 py-3">Tarih</th>
                <th className="text-right font-semibold text-gray-600 px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-600">
                    {loadError}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    Henüz onaylanan teklif yok.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-gray-800">{r.requestNo}</td>
                    <td className="px-4 py-3 text-gray-700">{r.customerText}</td>
                    <td className="px-4 py-3 text-gray-700">{r.productName}</td>
                    <td className="px-4 py-3 text-gray-700">{r.quantityText}</td>
                    <td className="px-4 py-3 text-gray-700 font-semibold">{r.totalText}</td>
                    <td className="px-4 py-3 text-gray-700">{r.deliveryTime || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="text-right text-gray-600 text-xs">{r.createdAtText}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-lg bg-[#FF6000] px-3 py-2 text-white font-semibold hover:bg-[#e55a00] transition-colors"
                          onClick={() => alert('Üretim akışı sonraki adımda eklenecek')}
                        >
                          Üretime Başla
                        </button>
                      </div>
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
