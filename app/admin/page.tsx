import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import StatCard from './components/StatCard';
import DashboardCharts from './components/DashboardCharts';

function formatTRY(n: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(n);
}

function sparkData(base: number) {
  const b = Math.max(1, base);
  return Array.from({ length: 7 }, (_, i) =>
    Math.round(b * (0.6 + (i / 7) * 0.45 + (i % 2) * 0.05))
  );
}

export default async function AdminDashboard() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    pendingOrdersCount,
    totalRevenueResult,
    orderItemsWithVendor,
    vendorCount,
    ordersLast30,
    recentOrders,
    vendorSalesRaw,
    vendorsById,
  ] = await Promise.all([
    prisma.order.count({ where: { status: 'PENDING' } }).catch(() => 0),
    prisma.order.aggregate({ _sum: { totalAmount: true } }).then((r) => r._sum.totalAmount ?? 0).catch(() => 0),
    prisma.orderItem.findMany({
      where: { vendorId: { not: null } },
      include: { vendor: { select: { commissionRate: true } } },
    }).catch(() => []),
    prisma.vendor.count().catch(() => 0),
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { totalAmount: true, createdAt: true },
    }).catch(() => []),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }).catch(() => []),
    prisma.orderItem.groupBy({
      by: ['vendorId'],
      where: { vendorId: { not: null } },
      _sum: { totalPrice: true },
    }).catch(() => []),
    prisma.vendor.findMany({ select: { id: true, name: true } }).then((list) => Object.fromEntries(list.map((v) => [v.id, v.name]))).catch(() => ({}) as Record<string, string>),
  ]);

  const totalCommission = orderItemsWithVendor.reduce(
    (sum, i) => sum + (i.totalPrice * ((i.vendor?.commissionRate ?? 0) / 100)),
    0
  );

  const salesByDay: { date: string; total: number }[] = [];
  const dayMap: Record<string, number> = {};
  ordersLast30.forEach((o) => {
    const d = o.createdAt.toISOString().slice(0, 10);
    dayMap[d] = (dayMap[d] ?? 0) + o.totalAmount;
  });
  const sortedDays = Object.keys(dayMap).sort();
  sortedDays.forEach((date) => salesByDay.push({ date, total: dayMap[date] }));

  const topVendors = vendorSalesRaw
    .map((v) => ({
      vendorId: v.vendorId!,
      name: vendorsById[v.vendorId!] ?? 'Bilinmeyen',
      total: v._sum.totalPrice ?? 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const ciroTrend = sparkData(totalRevenueResult / 7);
  const komisyonTrend = sparkData(totalCommission / 7);
  const saticiTrend = sparkData(vendorCount * 2);
  const bekleyenTrend = sparkData(pendingOrdersCount * 2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Pazaryeri Yönetim Merkezi</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Genel bakış ve anahtar performans göstergeleri
        </p>
      </div>

      {/* 4 büyük istatistik kartı */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Ciro"
          value={formatTRY(totalRevenueResult)}
          iconName="TrendingUp"
          trend={ciroTrend}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Toplam Komisyon (Net Kar)"
          value={formatTRY(totalCommission)}
          iconName="TrendingUp"
          trend={komisyonTrend}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Aktif Satıcı Sayısı"
          value={vendorCount}
          iconName="Store"
          trend={saticiTrend}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
        />
        <StatCard
          title="Bekleyen Siparişler"
          value={pendingOrdersCount}
          iconName="ClipboardList"
          trend={bekleyenTrend}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      {/* İki grafik alanı */}
      <DashboardCharts salesByDay={salesByDay} topVendors={topVendors} />

      {/* Son siparişler */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">Son Gelen Siparişler</h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-[#f97316]"
          >
            Tümü
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500">Henüz sipariş yok</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Sipariş / Müşteri</th>
                  <th className="px-4 py-2 text-right font-medium text-slate-600">Tutar</th>
                  <th className="px-4 py-2 text-center font-medium text-slate-600">Durum</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-2">
                      <p className="font-medium text-slate-800">#{order.barcode ?? order.id.slice(-8)}</p>
                      <p className="text-xs text-slate-500">{order.user?.name || order.user?.email || '—'}</p>
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-slate-800">
                      {formatTRY(order.totalAmount)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          order.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : order.status === 'PROCESSING'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'SHIPPED'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {order.status === 'PENDING' ? 'Beklemede' : order.status === 'PROCESSING' ? 'Üretimde' : order.status === 'SHIPPED' ? 'Kargoda' : 'Tamamlandı'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
