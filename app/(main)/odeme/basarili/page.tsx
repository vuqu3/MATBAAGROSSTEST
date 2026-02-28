'use client';

import { useEffect, useState } from 'react';

export default function OdemeBasariliPage() {
  const [orderId, setOrderId] = useState('');
  const [orderNo, setOrderNo] = useState<string | null>(null);

  const redirectToOrder = (oid: string) => {
    const target = `/siparis-basarili?orderId=${encodeURIComponent(oid)}`;
    try {
      if (window.top) {
        window.top.location.href = target;
      } else {
        window.location.href = target;
      }
    } catch {
      window.location.href = target;
    }
  };

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const oid = String(sp.get('orderId') || '').trim();
    setOrderId(oid);

    const run = async () => {
      if (!oid) return;
      try {
        const res = await fetch(`/api/orders/track?code=${encodeURIComponent(oid)}`);
        if (!res.ok) return;
        const data = (await res.json()) as { barcode?: string | null };
        const resolved = typeof data?.barcode === 'string' ? data.barcode.trim() : '';
        if (resolved) setOrderNo(resolved);
      } catch {
        // ignore
      }
    };
    run();

    const timeoutId = setTimeout(() => {
      redirectToOrder(oid);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      {orderId ? (
        <script
          key={orderId}
          dangerouslySetInnerHTML={{
            __html:
              "window.top.location.href = '/siparis-basarili?orderId=" +
              encodeURIComponent(orderId) +
              "';",
          }}
        />
      ) : null}
      <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-8">
          <h1 className="text-2xl font-extrabold text-slate-900">
            Ödeme Başarılı{orderNo ? ` — Sipariş No: ${orderNo}` : ''}
          </h1>
          <p className="mt-2 text-sm text-slate-600">Ödemeniz başarıyla alınmıştır. Siparişiniz işleme alındı.</p>

          {orderNo ? (
            <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-600">Sipariş No</p>
              <p className="mt-1 font-mono text-sm text-slate-900 break-all">{orderNo}</p>
            </div>
          ) : null}

          <p className="mt-6 text-sm text-slate-600">Lütfen bekleyin...</p>

          <button
            type="button"
            onClick={() => {
              try {
                const target = '/siparis-basarili?orderId=' + encodeURIComponent(orderId);
                if (window.top) {
                  window.top.location.href = target;
                } else {
                  window.location.href = target;
                }
              } catch {
                window.location.href = '/siparis-basarili?orderId=' + encodeURIComponent(orderId);
              }
            }}
            className="mt-6 w-full rounded-2xl bg-blue-600 px-6 py-4 text-white text-lg font-extrabold hover:bg-blue-700 transition-colors"
          >
            Sipariş Detaylarına Git
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
