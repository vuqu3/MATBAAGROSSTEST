'use client';

import { useState } from 'react';
import { Search, CheckCircle2, Truck, Package, Clock, AlertTriangle, ChevronRight, Phone, MessageCircle, HelpCircle, HeadphonesIcon } from 'lucide-react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function KargoTakipPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSearched, setIsSearched] = useState(false);

  const handleSearch = () => {
    if (trackingNumber.trim()) {
      setIsSearched(true);
    }
  };

  const trackingSteps = [
    { id: 1, title: 'Sipariş Alındı', completed: true, icon: CheckCircle2 },
    { id: 2, title: 'Baskıda', completed: true, icon: Package },
    { id: 3, title: 'Kalite Kontrol', completed: true, icon: CheckCircle2 },
    { id: 4, title: 'Kargoya Verildi', completed: true, active: true, icon: Truck },
    { id: 5, title: 'Teslim Edildi', completed: false, icon: Package }
  ];

  const cargoPartners = [
    { name: 'Yurtiçi Kargo', logo: 'YK' },
    { name: 'Aras Kargo', logo: 'AK' },
    { name: 'MNG Kargo', logo: 'MK' },
    { name: 'PTT Kargo', logo: 'PTT' },
    { name: 'Sürat Kargo', logo: 'SK' }
  ];

  const menuItems = [
    { id: 1, title: 'Sipariş Takibi', href: '/siparis-takip', active: true, icon: Package },
    { id: 2, title: 'İade ve İptal', href: '/iade-iptal', icon: AlertTriangle },
    { id: 3, title: 'Sıkça Sorulanlar', href: '/sss', icon: HelpCircle },
    { id: 4, title: 'Bize Ulaşın', href: '/iletisim', icon: Phone },
    { id: 5, title: 'Canlı Destek', href: '/iletisim', icon: HeadphonesIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Ana İçerik */}
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
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${item.active 
                          ? 'bg-orange-50 text-orange-600 font-semibold' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-orange-500'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.title}</span>
                      {item.active && (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
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
                Sipariş Takibi & Durum Sorgulama
              </h1>
              <p className="text-gray-600 text-lg">
                Siparişinizin son durumunu ve kargo takip bilgisini buradan sorgulayabilirsiniz.
              </p>
            </div>
            
            {/* Sipariş Takip Formu */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Sipariş Numarası veya Kargo Takip No Giriniz"
                  className="flex-1 px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-lg"
                />
                <button
                  onClick={handleSearch}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Sorgula
                </button>
              </div>
            </div>

            {/* Örnek Takip Sonucu */}
            <div className="bg-gray-50 rounded-xl p-8 mb-8 opacity-60">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nasıl Görünecek?
                </h3>
                <p className="text-gray-500">
                  Sipariş takip sonucunuz aşağıdaki gibi görünecektir
                </p>
              </div>
              
              {/* Stepper */}
              <div className="relative">
                <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200"></div>
                <div className="absolute top-8 left-0 h-1 bg-green-500" style={{ width: '75%' }}></div>
                
                <div className="relative flex justify-between">
                  {trackingSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.id} className="flex flex-col items-center text-center">
                        <div className={`
                          w-16 h-16 rounded-full flex items-center justify-center mb-3 z-10
                          ${step.completed ? 'bg-green-500 text-white' : 
                            step.active ? 'bg-orange-500 text-white' : 
                            'bg-gray-200 text-gray-400'}
                        `}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <span className={`
                          text-sm font-medium max-w-24
                          ${step.completed ? 'text-gray-900' : 
                            step.active ? 'text-orange-500' : 
                            'text-gray-400'}
                        `}>
                          {step.title}
                        </span>
                        {step.active && (
                          <div className="mt-2 flex items-center text-orange-500 text-sm">
                            <Clock className="w-4 h-4 mr-1" />
                            Aktif
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Yardımcı Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kargom ne zaman gelir? */}
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

              {/* Hasarlı kargo durumunda ne yapmalıyım? */}
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
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
