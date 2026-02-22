'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Package, Clock } from 'lucide-react';

function formatTRY(n: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(n);
}

const statusLabel: Record<string, string> = {
  PENDING: 'Beklemede',
  PROCESSING: 'Hazırlanıyor',
  SHIPPED: 'Kargolandı',
  COMPLETED: 'Tamamlandı',
};

type OverviewData = {
  totalSales: number;
  pendingOrders: number;
  pendingProducts: number;
  chartData?: { date: string; total: number }[];
  recentOrders?: { id: string; barcode: string | null; status: string; totalPrice: number; createdAt: string }[];
};

type CustomerQuestion = {
  id: string;
  text: string;
  date: string;
  customerName: string;
};

export default function SellerOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [questions, setQuestions] = useState<CustomerQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [overviewRes, questionsRes] = await Promise.all([
          fetch('/api/seller/overview'),
          fetch('/api/seller/questions'),
        ]);

        if (overviewRes.ok) {
          const overviewData = await overviewRes.json();
          setData(overviewData);
        }

        if (questionsRes.ok) {
          const questionsData = await questionsRes.json();
          setQuestions(questionsData.questions || []);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Toplam Satış (TL)',
      value: formatTRY(data?.totalSales ?? 0),
      icon: ShoppingCart,
      color: 'bg-orange-500',
      href: '/seller-dashboard/orders',
    },
    {
      title: 'Bekleyen Siparişler',
      value: String(data?.pendingOrders ?? 0),
      icon: Package,
      color: 'bg-blue-500',
      href: '/seller-dashboard/orders',
    },
    {
      title: 'Onay Bekleyen Ürünler',
      value: String(data?.pendingProducts ?? 0),
      icon: Clock,
      color: 'bg-amber-500',
      href: '/seller-dashboard/products',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Özet</h1>

      {/* 1. İstatistik Kartları */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          const card = (
            <div
              key={s.title}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{s.title}</p>
                  <p className="mt-1 text-xl font-bold text-gray-800">{s.value}</p>
                </div>
                <div className={`rounded-lg p-2.5 ${s.color} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
          return s.href ? (
            <Link key={s.title} href={s.href} className="block">
              {card}
            </Link>
          ) : (
            <div key={s.title}>{card}</div>
          );
        })}
      </div>

      {/* 2. Satış Grafiği Alanı */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Son 30 Günlük Satış</h2>
        {data?.chartData && data.chartData.length > 0 ? (
          <>
            <div className="flex items-end justify-between gap-2 h-48 px-2">
              {data.chartData.map((day, i) => {
                const maxValue = Math.max(...data.chartData!.map(d => d.total));
                const height = maxValue > 0 ? (day.total / maxValue) * 100 : 0;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-orange-200 min-w-0"
                    style={{ height: `${height}%` }}
                    title={`${new Date(day.date).toLocaleDateString('tr-TR')}: ${formatTRY(day.total)}`}
                  />
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Günlük satış (son 30 gün)</p>
          </>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-400">
            <p>Henüz satış verisi bulunmuyor</p>
          </div>
        )}
      </div>

      {/* 3. Alt Bölüm: Son Siparişler + Müşteri Soruları */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Son Gelen Siparişler</h2>
          {data?.recentOrders?.length ? (
            <ul className="space-y-3">
              {data.recentOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <span className="font-mono text-sm text-gray-600">
                    {o.barcode || o.id.slice(0, 8)}
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {formatTRY(o.totalPrice)}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      o.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : o.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {statusLabel[o.status] ?? o.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 py-4">Henüz sipariş yok.</p>
          )}
          <Link
            href="/seller-dashboard/orders"
            className="mt-4 inline-block text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            Tümünü gör →
          </Link>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Son Müşteri Soruları</h2>
          {questions.length > 0 ? (
            <ul className="space-y-3">
              {questions.map((q) => (
                <li
                  key={q.id}
                  className="flex items-start justify-between gap-2 py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{q.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{q.customerName}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{q.date}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 py-4">Henüz yeni mesajınız bulunmamuyor</p>
          )}
          <Link
            href="/seller-dashboard/questions"
            className="mt-4 inline-block text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            Tümünü gör →
          </Link>
        </div>
      </div>
    </div>
  );
}
