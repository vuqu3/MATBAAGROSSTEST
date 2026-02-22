'use client';

import { useState } from 'react';
import { Search, CheckCircle2, Truck, Package, Clock, AlertTriangle, ChevronRight, Phone, HelpCircle, HeadphonesIcon, ClipboardCheck, Loader2, PackageCheck, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED';

type TrackResult = {
  barcode: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  trackingNumber: string | null;
  shippingCompany: string | null;
  items: {
    id: string;
    productName: string;
    quantity: number;
    imageUrl: string | null;
  }[];
};

const STEPS: { key: OrderStatus; label: string; icon: React.ElementType }[] = [
  { key: 'PENDING',    label: 'Sipariş Alındı',    icon: ClipboardCheck },
  { key: 'PROCESSING', label: 'Hazırlanıyor',       icon: Package },
  { key: 'SHIPPED',    label: 'Kargoya Verildi',    icon: Truck },
  { key: 'COMPLETED',  label: 'Teslim Edildi',      icon: PackageCheck },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  PENDING: 0,
  PROCESSING: 1,
  SHIPPED: 2,
  COMPLETED: 3,
};

export default function KargoTakipPage() {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const code = inputValue.trim();
    if (!code) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`/api/orders/track?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Sipariş bulunamadı.');
      } else {
        setResult(data);
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const cargoPartners = [
    { name: 'Yurtiçi Kargo', logo: 'YK' },
    { name: 'Aras Kargo', logo: 'AK' },
    { name: 'MNG Kargo', logo: 'MK' },
    { name: 'PTT Kargo', logo: 'PTT' },
    { name: 'Sürat Kargo', logo: 'SK' }
  ];

  const menuItems = [
    { id: 1, title: 'Sipariş Takibi', href: '/siparis-takip', active: true, icon: Package },
    { id: 2, title: 'İade ve İptal', href: '/iade-ve-iptal', icon: AlertTriangle },
    { id: 3, title: 'Sıkça Sorulanlar', href: '/sikca-sorulanlar', icon: HelpCircle },
    { id: 4, title: 'Bize Ulaşın', href: '/iletisim', icon: Phone },
    { id: 5, title: 'Canlı Destek', href: '/iletisim', icon: HeadphonesIcon }
  ];

  const currentStepIndex = result ? STATUS_ORDER[result.status] : -1;
  const progressPercent = result
    ? (currentStepIndex / (STEPS.length - 1)) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sol Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Müşteri Hizmetleri</h3>
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        item.active
                          ? 'bg-orange-50 text-orange-600 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-orange-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.title}</span>
                      {item.active && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Sağ Ana İçerik */}
          <div className="lg:col-span-3">
            {/* Başlık */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Sipariş Takibi & Durum Sorgulama
              </h1>
              <p className="text-gray-600 text-lg">
                Siparişinizin son durumunu ve kargo takip bilgisini buradan sorgulayabilirsiniz.
              </p>
            </div>

            {/* Arama Formu */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && handleSearch()}
                  placeholder="Sipariş Numarası Giriniz (Örn: MG-2026-QRRSJP)"
                  className="flex-1 px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-lg"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading || !inputValue.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sorgulanıyor...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Sorgula
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-8 flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Sonuç Kartı */}
            {result && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
                {/* Kart Başlığı */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Sipariş Numarası</p>
                    <p className="font-mono font-bold text-gray-800 text-lg">
                      {result.barcode || '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-0.5">Sipariş Tarihi</p>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(result.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Stepper */}
                <div className="px-6 py-8">
                  <div className="relative">
                    {/* Background track */}
                    <div className="absolute top-8 left-8 right-8 h-1 bg-gray-200 rounded-full" />
                    {/* Progress fill */}
                    <div
                      className="absolute top-8 left-8 h-1 bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `calc(${progressPercent}% * (100% - 64px) / 100)` }}
                    />
                    <div className="relative flex justify-between">
                      {STEPS.map((step, i) => {
                        const Icon = step.icon;
                        const isCompleted = i < currentStepIndex;
                        const isActive = i === currentStepIndex;
                        return (
                          <div key={step.key} className="flex flex-col items-center text-center w-20">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 z-10 transition-colors ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : isActive
                                ? 'bg-orange-500 text-white ring-4 ring-orange-100'
                                : 'bg-gray-200 text-gray-400'
                            }`}>
                              <Icon className="w-7 h-7" />
                            </div>
                            <span className={`text-xs font-medium leading-tight ${
                              isCompleted ? 'text-green-600' :
                              isActive ? 'text-orange-500' : 'text-gray-400'
                            }`}>
                              {step.label}
                            </span>
                            {isActive && (
                              <span className="mt-1 text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                                Aktif
                              </span>
                            )}
                            {isCompleted && (
                              <span className="mt-1 text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                ✓ Tamamlandı
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Kargo Bilgisi — sadece SHIPPED veya COMPLETED ise göster */}
                {(result.status === 'SHIPPED' || result.status === 'COMPLETED') &&
                  (result.shippingCompany || result.trackingNumber) && (
                  <div className="mx-6 mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-blue-500 font-medium">Kargo Firması</p>
                        <p className="text-sm font-bold text-blue-800">
                          {result.shippingCompany || '—'}
                        </p>
                      </div>
                    </div>
                    {result.trackingNumber && (
                      <div className="flex items-center gap-3">
                        <Search className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-blue-500 font-medium">Kargo Takip No</p>
                          <p className="text-sm font-bold text-blue-800 font-mono">
                            {result.trackingNumber}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Ürünler */}
                <div className="px-6 pb-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Sipariş Edilen Ürünler
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2"
                      >
                        {item.imageUrl && (
                          <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-white">
                            <Image
                              src={item.imageUrl}
                              alt={item.productName}
                              fill
                              className="object-contain"
                              sizes="32px"
                            />
                          </div>
                        )}
                        <span className="text-sm text-gray-700 line-clamp-1 max-w-[180px]">
                          {item.productName}
                          {item.quantity > 1 && (
                            <span className="text-gray-400 ml-1">× {item.quantity}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Yardımcı Bilgiler — sonuç yokken göster */}
            {!result && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Kargom ne zaman gelir?
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Standart teslimat süremiz 2-4 iş günüdür. Büyük şehirlere 1-2 gün,
                        diğer bölgelere 3-4 gün içinde teslimat yapılmaktadır.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Hasarlı kargo durumunda ne yapmalıyım?
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Lütfen teslimat sırasında kargonuzu kontrol ediniz.
                        Hasarlı durumda tutanak tutarak müşteri hizmetlerimizi arayınız.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
