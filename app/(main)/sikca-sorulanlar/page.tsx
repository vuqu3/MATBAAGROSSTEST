'use client';

import { useState } from 'react';
import { Package, AlertTriangle, HelpCircle, Phone, MessageCircle, HeadphonesIcon, Search, ChevronRight, MessageSquare, Clock, Truck, CreditCard, FileText } from 'lucide-react';
import Link from 'next/link';

export default function SikcaSorulanlarPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Aranan soru:', searchTerm);
    // Burada arama fonksiyonu çalışacak
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const sorular = {
    siparis: [
      {
        soru: 'Siparişim ne zaman kargoya verilir?',
        cevap: 'Siparişleriniz baskı onayından sonra 1-2 iş günü içinde kargoya verilir.'
      },
      {
        soru: 'Baskı onayı nasıl verilir?',
        cevap: 'Baskı onayı için tasarım dosyanızı sistemimize yükleyebilir veya tasarım hizmetimizden faydalanabilirsiniz.'
      }
    ],
    kargo: [
      {
        soru: 'Hangi kargo ile çalışıyorsunuz?',
        cevap: 'Yurtiçi Kargo, Aras Kargo ve MNG Kargo ile çalışmaktayız. Teslimat süresi 2-4 iş günüdür.'
      },
      {
        soru: 'Kargo takip numaramı nasıl öğrenebilirim?',
        cevap: 'Kargo takip numaranız sipariş onayı e-postasında veya sipariş takip sayfasından görüntüleyebilirsiniz.'
      }
    ],
    odeme: [
      {
        soru: 'Havale ile ödeme yapabilir miyim?',
        cevap: 'Evet, havale ile ödeme kabul ediyoruz. Ödeme adımları için müşteri hizmetlerimizle iletişime geçebilirsiniz.'
      },
      {
        soru: 'Kapıda ödeme seçeneği var mı?',
        cevap: 'Evet, kapıda ödeme seçeneğimiz mevcuttur. Teslimat sırasında nakit ödeme yapabilirsiniz.'
      }
    ]
  };

  const menuItems = [
    { id: 1, title: 'Sipariş Takibi', href: '/siparis-takip', active: false, icon: Package },
    { id: 2, title: 'İade ve İptal', href: '/iade-ve-iptal', active: false, icon: AlertTriangle },
    { id: 3, title: 'Sıkça Sorulanlar', href: '/sikca-sorulanlar', active: true, icon: HelpCircle },
    { id: 4, title: 'Bize Ulaşın', href: '/iletisim', icon: Phone },
    { id: 5, title: 'Canlı Destek', href: '/iletisim', icon: HeadphonesIcon }
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
                Size Nasıl Yardımcı Olabiliriz?
              </h1>
            </div>

            {/* Arama Çubuğu */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Sorunuzu buraya yazın..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Ara
                </button>
              </form>
            </div>

            {/* Sorular Kategorileri */}
            <div className="space-y-6">
              {/* Sipariş Soruları */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleCategory('siparis')}
                  className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">Sipariş</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedCategory === 'siparis' ? 'rotate-90' : ''}`} />
                </button>
                
                {expandedCategory === 'siparis' && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-white">
                    <div className="space-y-4">
                      {sorular.siparis.map((item, index) => (
                        <div key={index} className="border-l-4 border-orange-500 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {item.soru}
                          </h4>
                          <p className="text-gray-600">
                            {item.cevap}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Kargo Soruları */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleCategory('kargo')}
                  className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">Kargo</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedCategory === 'kargo' ? 'rotate-90' : ''}`} />
                </button>
                
                {expandedCategory === 'kargo' && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-white">
                    <div className="space-y-4">
                      {sorular.kargo.map((item, index) => (
                        <div key={index} className="border-l-4 border-orange-500 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {item.soru}
                          </h4>
                          <p className="text-gray-600">
                            {item.cevap}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ödeme Soruları */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleCategory('odeme')}
                  className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">Ödeme</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedCategory === 'odeme' ? 'rotate-90' : ''}`} />
                </button>
                
                {expandedCategory === 'odeme' && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-white">
                    <div className="space-y-4">
                      {sorular.odeme.map((item, index) => (
                        <div key={index} className="border-l-4 border-orange-500 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {item.soru}
                          </h4>
                          <p className="text-gray-600">
                            {item.cevap}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>    </div>
  );
}
