'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Barcode from 'react-barcode';

type OrderItemType = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type OrderPrint = {
  id: string;
  barcode: string | null;
  status: string;
  createdAt: string;
  orderItems: OrderItemType[];
  address?: {
    city: string;
    district: string | null;
    line1: string;
    line2: string | null;
    postalCode: string | null;
    title: string | null;
  } | null;
  user?: { name: string | null; email: string | null; phoneNumber: string | null } | null;
  guestFirstName?: string | null;
  guestLastName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  guestCity?: string | null;
  guestDistrict?: string | null;
  guestAddress?: string | null;
};

export default function OrderPrintPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      }
    >
      <OrderPrintPageInner />
    </Suspense>
  );
}

function OrderPrintPageInner() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<OrderPrint | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Sipariş ID eksik');
      return;
    }
    fetch(`/api/seller/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Sipariş yüklenemedi');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setError(null);
      })
      .catch(() => setError('Sipariş bulunamadı'));
  }, [orderId]);

  useEffect(() => {
    if (!order) return;
    const t = setTimeout(() => {
      window.print();
    }, 600);
    return () => clearTimeout(t);
  }, [order]);

  if (error) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  const total = order.orderItems.reduce((sum, i) => sum + i.totalPrice, 0);

  const buyerName =
    order.user?.name ||
    order.user?.email ||
    order.address?.title ||
    `${order.guestFirstName ?? ''} ${order.guestLastName ?? ''}`.trim() ||
    order.guestEmail ||
    'Misafir Müşteri';

  const buyerPhone = order.user?.phoneNumber || order.guestPhone || null;

  const addressLine1 = order.address?.line1 || order.guestAddress || '';
  const addressLine2 = order.address?.line2 || '';
  const district = order.address?.district || order.guestDistrict || '';
  const city = order.address?.city || order.guestCity || '';
  const postalCode = order.address?.postalCode || '';

  return (
    <>
      {/* Tam sayfa beyaz overlay: panel (sidebar/header) görünmez, sadece etiket */}
      <div className="print-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-white">
        {/* A6 dikey kargo etiketi - ortada */}
        <div className="print-label w-[105mm] min-h-[148mm] max-w-[105mm] bg-white text-black p-5 flex flex-col gap-4 shadow-lg print:shadow-none">
          <div className="flex justify-center border-b border-gray-400 pb-3">
            <img
              src="/logo.svg"
              alt="Matbaagross"
              className="h-10 w-auto object-contain grayscale contrast-200"
              style={{ printColorAdjust: 'exact' }}
            />
          </div>
          <p className="text-center text-xs text-gray-600 font-medium">MatbaaGross Pazaryeri</p>

          <div className="text-center flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Sipariş No</p>
            <p className="text-xl font-bold font-mono text-gray-900">
              #{order.barcode ?? order.id.slice(0, 8)}
            </p>
            {order.barcode && (
              <div className="flex justify-center mt-3">
                <Barcode
                  value={order.barcode}
                  height={40}
                  width={1.3}
                  fontSize={11}
                  margin={0}
                />
              </div>
            )}
          </div>

          <div className="border border-gray-400 rounded p-3 text-sm">
            <p className="font-semibold text-gray-900 mb-1.5">
              Alıcı: {buyerName}
            </p>
            <p className="text-gray-800">
              {addressLine1}
              {addressLine2 ? `, ${addressLine2}` : ''}
            </p>
            <p className="text-gray-800">
              {district ? `${district}, ` : ''}
              {city}
              {postalCode ? ` ${postalCode}` : ''}
            </p>
            {buyerPhone && (
              <p className="text-gray-800 mt-1 font-medium">Tel: {buyerPhone}</p>
            )}
          </div>

          <div className="border-t border-gray-400 pt-3">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Paket İçeriği (bu satıcı)
            </p>
            <ul className="space-y-1 text-sm text-gray-800">
              {order.orderItems.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="font-mono">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.totalPrice)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-sm font-semibold mt-2 flex justify-between border-t border-gray-300 pt-2 text-gray-900">
              <span>Toplam</span>
              <span>
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(total)}
              </span>
            </p>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .print-overlay {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @media print {
              body * { visibility: hidden; }
              .print-overlay,
              .print-overlay * { visibility: visible; }
              .print-overlay {
                position: fixed !important;
                inset: 0 !important;
                z-index: 99999 !important;
                background: white !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .print-label {
                box-shadow: none !important;
                margin: 0 !important;
                max-width: 105mm !important;
              }
              @page {
                size: 105mm 148mm;
                margin: 8mm;
              }
            }
          `,
        }}
      />
    </>
  );
}
