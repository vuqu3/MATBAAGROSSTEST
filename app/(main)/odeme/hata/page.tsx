import Link from 'next/link';

export default async function OdemeHataPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const sp = await searchParams;
  const orderId = typeof sp?.orderId === 'string' ? sp.orderId.trim() : '';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-8">
          <h1 className="text-2xl font-extrabold text-slate-900">Ödeme Başarısız</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ödeme işlemi tamamlanamadı. Dilerseniz tekrar deneyebilirsiniz.
          </p>

          {orderId ? (
            <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-600">Sipariş ID</p>
              <p className="mt-1 font-mono text-sm text-slate-900 break-all">{orderId}</p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Link
              href="/sepetim/onay"
              className="inline-flex items-center justify-center rounded-xl bg-[#FF6000] px-5 py-3 text-white font-bold hover:bg-[#e55a00] transition-colors"
            >
              Tekrar Dene
            </Link>
            <Link
              href="/sepetim"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-slate-800 font-semibold hover:bg-slate-50 transition-colors"
            >
              Sepete Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
