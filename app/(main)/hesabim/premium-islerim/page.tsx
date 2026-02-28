'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FileText, Package, Clock, CheckCircle, Truck, Archive, Check } from 'lucide-react';

type TabKey = 'pending' | 'quoted' | 'processing' | 'completed';

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'pending', label: 'Teklif Bekleyen Taleplerim', icon: Clock },
  { key: 'quoted', label: 'Teklif Gelen Talepler', icon: FileText },
  { key: 'processing', label: 'İşlemdeki Siparişlerim', icon: Truck },
  { key: 'completed', label: 'Tamamlanan Premium İşlerim', icon: Archive },
];

export default function PremiumIslerimPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const searchParams = useSearchParams();
  const successOfferId = searchParams?.get('success');
  const successRequestNo = searchParams?.get('requestNo');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/user/premium-requests', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setRequests(Array.isArray(data) ? data : []);
        } else {
          setRequests([]);
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // Auto-switch to processing tab if payment was successful
  useEffect(() => {
    if (successOfferId && successRequestNo) {
      setActiveTab('processing');
    }
  }, [successOfferId, successRequestNo]);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const status = r.status;
      const hasOffers = r._count?.offers > 0;
      
      switch (activeTab) {
        case 'pending':
          return status === 'PENDING' && !hasOffers;
        case 'quoted':
          return (status === 'PENDING' || status === 'QUOTED') && hasOffers;
        case 'processing':
          return status === 'PROCESSING' || status === 'PAID';
        case 'completed':
          return status === 'COMPLETED';
        default:
          return false;
      }
    });
  }, [requests, activeTab]);

  const rows = useMemo(() => {
    return filteredRequests.map((r) => ({
      ...r,
      createdAtText: r.createdAt ? new Date(r.createdAt).toLocaleString('tr-TR') : '-',
    }));
  }, [filteredRequests]);

  const statusText: Record<string, string> = {
    PENDING: 'Beklemede',
    QUOTED: 'Teklif Geldi',
    REJECTED: 'Reddedildi',
    PROCESSING: 'İşlemde',
    COMPLETED: 'Tamamlandı',
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    QUOTED: 'bg-blue-100 text-blue-700',
    REJECTED: 'bg-red-100 text-red-700',
    PROCESSING: 'bg-orange-100 text-orange-700',
    COMPLETED: 'bg-green-100 text-green-700',
  };

  return (
    <div className="py-2 space-y-5">
      {/* Success Notification */}
      {successOfferId && successRequestNo && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Ödeme Başarılı!</h3>
              <p className="text-sm text-green-800 mt-1">
                {successRequestNo} numaralı Premium siparişiniz alınmıştır ve üreticiye bilgi geçilmiştir. 
                Siparişleriniz Matbaagross güvencesi altında üretime başlayacaktır.
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Premium İşlerim</h1>
        <p className="text-gray-600 text-sm mt-0.5">Premium taleplerinizi ve gelen teklifleri buradan takip edin.</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                className={`flex items-center gap-2 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-[#FF6000] text-[#FF6000]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-gray-600">
            Yükleniyor...
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-gray-600">
            {activeTab === 'pending' && 'Henüz teklif bekleyen talebiniz yok.'}
            {activeTab === 'quoted' && 'Henüz teklif gelen talebiniz yok.'}
            {activeTab === 'processing' && 'Henüz işlemdeki siparişiniz yok.'}
            {activeTab === 'completed' && 'Henüz tamamlanan premium işiniz yok.'}
          </div>
        ) : (
          rows.map((request) => (
            <div key={request.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Talep No</p>
                  <p className="font-mono text-sm text-gray-800">{request.requestNo}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{request.productName}</p>
                  <p className="text-xs text-gray-600 mt-1">Adet: {Number(request.quantity).toLocaleString('tr-TR')}</p>
                  {request._count?.offers > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      {request._count.offers} teklif geldi
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">Durum</p>
                  <div className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusColors[request.status] || 'bg-gray-100 text-gray-700'}`}>
                    <Package className="h-4 w-4" />
                    {statusText[request.status] ?? request.status}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Tarih</p>
                  <p className="text-xs text-gray-700">{request.createdAtText}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Link
                  href={`/hesabim/premium-islerim/${request.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#FF6000] px-4 py-2 text-white font-semibold hover:bg-[#e55a00] transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Detay & Teklifler
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
