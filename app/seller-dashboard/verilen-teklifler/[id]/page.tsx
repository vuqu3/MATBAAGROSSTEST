'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BadgeCheck, FileText } from 'lucide-react';
import QuoteChatBox from '@/app/components/QuoteChatBox';

export default function SellerVerilenTeklifDetayPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/seller/premium-quotes/${encodeURIComponent(String(id))}`, { cache: 'no-store' });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setData(null);
          setError(typeof json?.error === 'string' ? json.error : 'Teklif alınamadı');
          return;
        }
        setData(json);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const offer = useMemo(() => data?.offer ?? null, [data]);
  const request = useMemo(() => offer?.request ?? null, [offer]);

  const snapshot = useMemo(() => (request?.technicalSpecs ?? null) as any, [request?.technicalSpecs]);
  const referenceImageUrl = useMemo(() => {
    const url = snapshot?.product?.imageUrl;
    return typeof url === 'string' && url.trim() ? url.trim() : null;
  }, [snapshot]);
  const referenceName = useMemo(() => {
    const n = snapshot?.product?.name;
    return typeof n === 'string' && n.trim() ? n.trim() : (request?.productName ?? null);
  }, [snapshot, request?.productName]);
  const specsRows = useMemo(() => {
    const obj = snapshot;
    const items: Array<{ label: string; value: string }> = [];
    const push = (label: string, value: unknown) => {
      if (value === null || value === undefined) return;
      const s = typeof value === 'string' ? value.trim() : JSON.stringify(value);
      if (!s || s === 'null' || s === '""') return;
      items.push({ label, value: s });
    };

    push('Kategori', obj?.product?.category?.name);
    push('SKU', obj?.product?.sku);
    push('Ürün Tipi', obj?.product?.productType);
    push('Minimum Sipariş', obj?.product?.minOrderQuantity);
    push('Üretim Süresi (Gün)', obj?.product?.productionDays);

    const dim = obj?.product?.dimensions;
    if (dim && typeof dim === 'object') {
      const parts: string[] = [];
      if (dim.width) parts.push(`En: ${dim.width}`);
      if (dim.height) parts.push(`Yükseklik: ${dim.height}`);
      if (dim.depth) parts.push(`Derinlik: ${dim.depth}`);
      if (dim.weight) parts.push(`Ağırlık: ${dim.weight}`);
      if (dim.desi) parts.push(`Desi: ${dim.desi}`);
      if (parts.length) items.push({ label: 'Ölçüler', value: parts.join(' • ') });
    }

    const highlights = obj?.highlights;
    if (highlights && typeof highlights === 'object' && !Array.isArray(highlights)) {
      for (const [k, v] of Object.entries(highlights as Record<string, unknown>)) {
        if (!k || v === null || v === undefined) continue;
        const s = String(v).trim();
        if (!s) continue;
        items.push({ label: k, value: s });
      }
    }

    const dyn = obj?.dynamicAttributes;
    if (dyn && typeof dyn === 'object' && !Array.isArray(dyn)) {
      for (const [k, v] of Object.entries(dyn as Record<string, unknown>)) {
        if (!k || v === null || v === undefined) continue;
        const s = String(v).trim();
        if (!s) continue;
        items.push({ label: k, value: s });
      }
    }

    return items;
  }, [snapshot]);

  if (loading) {
    return <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-gray-600">Yükleniyor...</div>;
  }

  if (error || !offer) {
    return (
      <div className="space-y-4">
        <Link href="/seller-dashboard/verilen-teklifler" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Geri
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-gray-600">{error || 'Teklif bulunamadı.'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/seller-dashboard/verilen-teklifler" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Verilen Teklifler
        </Link>
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          <BadgeCheck className="h-4 w-4" />
          {String(offer.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <h1 className="text-lg font-bold text-gray-900">Teklif Detayı</h1>
            <p className="text-sm text-gray-500 mt-1">Talep: {request?.requestNo ?? '-'}</p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-600">Referans Ürün</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                  {referenceImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={referenceImageUrl} alt={referenceName || 'Ürün'} className="h-full w-full object-contain" />
                  ) : (
                    <div className="text-[11px] text-slate-400">Ürün</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-slate-900 truncate">{referenceName || '-'}</p>
                  {request?.referenceProductId ? (
                    <p className="text-[11px] text-slate-500 truncate">ID: {String(request.referenceProductId)}</p>
                  ) : null}
                </div>
              </div>
            </div>

            {specsRows.length ? (
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold text-gray-600">Teknik Özellikler (Snapshot)</p>
                <div className="mt-3 overflow-hidden rounded-lg border border-gray-100">
                  <table className="w-full text-sm">
                    <tbody>
                      {specsRows.map((r) => (
                        <tr key={`${r.label}-${r.value}`} className="border-b border-gray-100 last:border-b-0">
                          <td className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 w-44">{r.label}</td>
                          <td className="px-3 py-2 text-xs text-gray-800 whitespace-pre-wrap break-words">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">İş</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{request?.productName ?? '-'}</p>
                <p className="text-xs text-gray-600 mt-1">Adet: {Number(request?.quantity ?? 0).toLocaleString('tr-TR')}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Teklif Tutarı</p>
                <p className="text-base font-extrabold text-[#16a34a] mt-1">{Number(offer.totalPrice ?? offer.price).toLocaleString('tr-TR')} TL</p>
                <p className="text-xs text-gray-600 mt-1">Teslimat: {offer.deliveryTime}</p>
              </div>
            </div>

            {offer.note ? (
              <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
                <p className="text-xs font-semibold text-gray-600">Notunuz</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap mt-1">{offer.note}</p>
              </div>
            ) : null}

            {request?.fileUrl ? (
              <div className="mt-3">
                <a href={request.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF6000] hover:underline">
                  <FileText className="h-4 w-4" />
                  Ekli dosyayı görüntüle
                </a>
              </div>
            ) : null}
          </div>

          <QuoteChatBox quoteId={String(offer.id)} />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-900">Müşteri</h2>
            <p className="text-sm text-gray-700 mt-2">{request?.contactName || request?.user?.name || 'Müşteri'}</p>

            <p className="text-xs text-gray-500 mt-4">
              Tüm iletişim ve anlaşmalar Matbaagross Chat üzerinden yapılmalıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
