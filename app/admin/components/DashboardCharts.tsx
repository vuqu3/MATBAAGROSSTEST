'use client';

type SalesByDay = { date: string; total: number };
type TopVendor = { vendorId: string; name: string; total: number };

export default function DashboardCharts({
  salesByDay,
  topVendors,
}: {
  salesByDay: SalesByDay[];
  topVendors: TopVendor[];
}) {
  const formatTRY = (n: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);
  const maxSales = Math.max(1, ...salesByDay.map((d) => d.total));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">Son 30 Günlük Satış Hacmi</h2>
        <p className="mt-0.5 text-xs text-slate-500">Günlük toplam ciro</p>
        <div className="mt-4 flex items-end justify-between gap-1 h-44">
          {salesByDay.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
              Veri yok
            </div>
          ) : (
            salesByDay.slice(-14).map((d) => (
              <div
                key={d.date}
                className="flex-1 min-w-0 flex flex-col items-center"
                title={`${d.date}: ${formatTRY(d.total)}`}
              >
                <div
                  className="w-full rounded-t bg-[#f97316]/80 hover:bg-[#f97316] transition-colors min-h-[4px]"
                  style={{ height: `${Math.max(4, (d.total / maxSales) * 100)}%` }}
                />
                <span className="text-[10px] text-slate-500 mt-1 truncate w-full text-center">
                  {new Date(d.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">En Çok Satan Satıcılar</h2>
        <p className="mt-0.5 text-xs text-slate-500">Satış tutarına göre (toplam)</p>
        <div className="mt-4">
          {topVendors.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">Veri yok</div>
          ) : (
            <ul className="space-y-2">
              {topVendors.map((v, i) => (
                <li
                  key={v.vendorId}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-200 text-xs font-semibold text-slate-700">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-800">{v.name}</span>
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{formatTRY(v.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
