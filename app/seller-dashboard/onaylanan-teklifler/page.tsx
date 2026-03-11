'use client';

import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, FileText, Phone, Mail, User2 } from 'lucide-react';

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
        contactName: o?.request?.contactName ?? null,
        contactEmail: o?.request?.contactEmail ?? null,
        contactPhone: o?.request?.contactPhone ?? null,
        fileUrl: o?.request?.fileUrl ?? null,
      };
    });
  }, [offers]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Onaylanan Teklifler</h1>
        <p className="text-sm text-gray-500 mt-1">Onaylanan / ödemesi alınmış işleriniz</p>
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
                    <td className="px-4 py-3 text-gray-700">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <BadgeCheck className="h-4 w-4" />
                          Onaylandı
                        </div>
                        <div className="text-sm font-semibold text-gray-800">{r.customerText}</div>
                        {(r.contactEmail || r.contactPhone || r.contactName) && (
                          <div className="text-xs text-gray-500 space-y-0.5">
                            {r.contactName && (
                              <div className="flex items-center gap-1.5"><User2 className="h-3.5 w-3.5" />{r.contactName}</div>
                            )}
                            {r.contactEmail && (
                              <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{r.contactEmail}</div>
                            )}
                            {r.contactPhone && (
                              <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{r.contactPhone}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-900">{r.productName}</div>
                        {r.fileUrl && (
                          <a
                            href={r.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Dosyayı Gör
                          </a>
                        )}
                      </div>
                    </td>
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
