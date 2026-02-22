'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Printer, Upload, FileText, CheckCircle, X } from 'lucide-react';

type OrderItemType = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl: string | null;
};

type OrderType = {
  id: string;
  barcode: string | null;
  status: string;
  createdAt: string;
  invoiceUrl: string | null;
  orderItems: OrderItemType[];
  address: { city: string; line1: string; title?: string | null };
  user: { name: string | null; email: string | null };
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessId, setUploadSuccessId] = useState<string | null>(null);

  const handleInvoiceUpload = async (orderId: string, file: File) => {
    setUploadingId(orderId);
    setUploadError(null);
    setUploadSuccessId(null);
    const form = new FormData();
    form.append('invoice', file);
    try {
      const res = await fetch(`/api/seller/orders/${orderId}/invoice`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? 'Yükleme başarısız.');
        return;
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, invoiceUrl: data.invoiceUrl } : o))
      );
      setUploadSuccessId(orderId);
      setTimeout(() => setUploadSuccessId(null), 3000);
    } catch {
      setUploadError('Bir hata oluştu.');
    } finally {
      setUploadingId(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/seller/orders?page=${page}&pageSize=10`)
      .then((res) => res.ok ? res.json() : { orders: [], total: 0 })
      .then((data) => {
        setOrders(data.orders ?? []);
        setTotal(data.total ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page]);

  const statusLabel: Record<string, string> = {
    PENDING: 'Beklemede',
    PROCESSING: 'Hazırlanıyor',
    SHIPPED: 'Kargolandı',
    COMPLETED: 'Tamamlandı',
  };

  const formatTRY = (n: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

  const getOrderTotal = (order: OrderType) =>
    order.orderItems.reduce((sum, i) => sum + i.totalPrice, 0);

  const openPrintWindow = (orderId: string) => {
    const url = `/seller-dashboard/orders/print?orderId=${encodeURIComponent(orderId)}`;
    window.open(url, '_blank', 'width=420,height=640,scrollbars=yes');
  };

  if (loading) {
    return (
      <div className="py-8 text-gray-500">Yükleniyor...</div>
    );
  }

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Siparişler</h1>
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Henüz sipariş bulunmuyor.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Siparişler</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const orderTotal = getOrderTotal(order);
          const orderImage = (item: OrderItemType) =>
            item.imageUrl || '/placeholder-product.svg';
          // API zaten sadece bu satıcının orderItems'ını döndürüyor (multi-vendor filtre)
          const itemsToShow = order.orderItems;

          return (
            <div
              key={order.id}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm"
            >
              {/* Kart Başlığı */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-100 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <span className="font-mono font-semibold text-gray-800">
                    #{order.barcode ?? order.id.slice(0, 8)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-800">
                    {order.user?.name || order.user?.email || '—'}
                  </div>
                  <button
                    type="button"
                    onClick={() => openPrintWindow(order.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 print:hidden"
                    title="Barkod Yazdır"
                  >
                    <Printer size={14} />
                    Barkod Yazdır
                  </button>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    order.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800'
                      : order.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {statusLabel[order.status] ?? order.status}
                </span>
              </div>

              {/* Kart İçeriği - Sadece bu satıcının ürünleri (API'de filtrelenmiş) */}
              <div className="px-4 py-3">
                <ul className="divide-y divide-gray-100">
                  {itemsToShow.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={orderImage(item)}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-gray-800">
                          {item.productName}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 shrink-0">
                        {item.quantity} adet
                      </span>
                      <span className="text-sm text-gray-600 shrink-0 w-20 text-right">
                        {formatTRY(item.unitPrice)}
                      </span>
                      <span className="text-sm font-medium text-gray-800 shrink-0 w-24 text-right">
                        {formatTRY(item.totalPrice)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Kart Altı - Toplam + Fatura */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Toplam (sizin ürünleriniz):</span>
                  <span className="text-base font-semibold text-gray-900">{formatTRY(orderTotal)}</span>
                </div>

                {/* Fatura Yükle / Görüntüle */}
                <div className="flex items-center gap-2">
                  {order.invoiceUrl ? (
                    <>
                      <a
                        href={order.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                      >
                        <FileText size={13} />
                        Fatura Yüklendi
                      </a>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                        <Upload size={13} />
                        Değiştir
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleInvoiceUpload(order.id, f);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </>
                  ) : (
                    <label className={`inline-flex items-center gap-1.5 cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      uploadingId === order.id
                        ? 'border-gray-200 bg-gray-100 text-gray-400 pointer-events-none'
                        : uploadSuccessId === order.id
                          ? 'border-green-300 bg-green-50 text-green-700'
                          : 'border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100'
                    }`}>
                      {uploadingId === order.id ? (
                        <><Upload size={13} className="animate-pulse" />Yükleniyor...</>
                      ) : uploadSuccessId === order.id ? (
                        <><CheckCircle size={13} />Yüklendi!</>
                      ) : (
                        <><Upload size={13} />Fatura Yükle (PDF)</>
                      )}
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleInvoiceUpload(order.id, f);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Upload error */}
              {uploadError && uploadingId === null && (
                <div className="flex items-center justify-between px-4 py-2 bg-red-50 border-t border-red-100 text-xs text-red-600">
                  {uploadError}
                  <button onClick={() => setUploadError(null)}><X size={12} /></button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {total > 10 && (
        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <span>
            Toplam {total} sipariş • Sayfa {page} / {Math.ceil(total / 10)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-50 hover:bg-gray-50"
            >
              Önceki
            </button>
            <button
              type="button"
              disabled={page >= Math.ceil(total / 10)}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-50 hover:bg-gray-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
