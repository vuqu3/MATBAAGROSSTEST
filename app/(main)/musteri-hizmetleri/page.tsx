'use client';

import { Package, AlertTriangle, HelpCircle, Phone, MessageCircle, HeadphonesIcon, ChevronRight, Clock, Truck, MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MusteriHizmetleriPage() {
  const menuItems = [
    { id: 1, title: 'Sipariş Takibi', href: '/siparis-takip', active: false, icon: Package },
    { id: 2, title: 'İade ve İptal', href: '/iade-ve-iptal', active: false, icon: AlertTriangle },
    { id: 3, title: 'Sıkça Sorulanlar', href: '/sikca-sorulanlar', active: false, icon: HelpCircle },
    { id: 4, title: 'Bize Ulaşın', href: '/iletisim', active: false, icon: Phone },
    { id: 5, title: 'Canlı Destek', href: '/iletisim', active: false, icon: HeadphonesIcon }
  ];

  const hizliErisimKartlari = [
    {
      id: 1,
      icon: Truck,
      title: 'Sipariş Takibi',
      description: 'Kargom Nerede?',
      href: '/siparis-takip',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      id: 2,
      icon: AlertTriangle,
      title: 'İade ve İptal',
      description: 'İade Talebi Oluştur',
      href: '/iade-ve-iptal',
      color: 'bg-red-50 hover:bg-red-100 border-red-200'
    },
    {
      id: 3,
      icon: HelpCircle,
      title: 'Sıkça Sorulanlar',
      description: 'Merak Ettikleriniz',
      href: '/sikca-sorulanlar',
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      id: 4,
      icon: Phone,
      title: 'Bize Ulaşın',
      description: 'İletişim Bilgileri',
      href: '/iletisim',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">      {/* Ana İçerik */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sol Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Müşteri Hizmetleri
              </h3>
              
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-orange-500"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Sağ Ana İçerik */}
          <div className="lg:col-span-3">
            {/* Sayfa Başlığı */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Size Nasıl Yardımcı Olabiliriz?
              </h1>
              <p className="text-gray-600 text-lg">
                Tüm sorularınız ve talepleriniz için hızlı çözümler sunuyoruz.
              </p>
            </div>

            {/* Hızlı Erişim Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {hizliErisimKartlari.map((kart) => {
                const Icon = kart.icon;
                return (
                  <Link
                    key={kart.id}
                    href={kart.href}
                    className={`
                      group bg-white rounded-xl border-2 ${kart.color} p-6 
                      hover:shadow-lg transition-all duration-300 hover:scale-105
                    `}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Icon className="w-6 h-6 text-gray-700" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {kart.title}
                    </h3>
                    
                    <p className="text-gray-600">
                      {kart.description}
                    </p>
                  </Link>
                );
              })}
            </div>

            {/* Destek Bilgisi */}
            <div className="bg-gray-100 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">
                  Çalışma Saatleri
                </span>
              </div>
              <p className="text-gray-600">
                Hafta içi 09:00 - 18:00 saatleri arasında 0850 123 45 67 numaralı hattan bize ulaşabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>    </div>
  );
}
