'use client';

import { useState } from 'react';
import { Package, AlertTriangle, HelpCircle, Phone, MessageCircle, HeadphonesIcon, Search, Clock, CheckCircle2, Truck, ArrowRight, MapPin, Mail, User, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function IadeIptalPage() {
  const [formData, setFormData] = useState({
    siparisNo: '',
    email: '',
    iadeNedeni: '',
    aciklama: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('İade talebi:', formData);
    // Burada API çağrısı yapılacak
  };

  const iadeAdimlari = [
    { id: 1, title: 'Talep Oluştur', completed: true, icon: MessageSquare },
    { id: 2, title: 'Onay', completed: true, icon: CheckCircle2 },
    { id: 3, title: 'Kargo', completed: false, icon: Truck },
    { id: 4, title: 'Para İadesi', completed: false, icon: Package }
  ];

  const menuItems = [
    { id: 1, title: 'Sipariş Takibi', href: '/siparis-takip', active: false, icon: Package },
    { id: 2, title: 'İade ve İptal', href: '/iade-ve-iptal', active: true, icon: AlertTriangle },
    { id: 3, title: 'Sıkça Sorulanlar', href: '/sikca-sorulanlar', icon: HelpCircle },
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
                        <ArrowRight className="w-4 h-4 ml-auto" />
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
                İade ve İptal Koşulları
              </h1>
              <p className="text-gray-600 text-lg">
                Müşteri memnuniyeti önceliğimizdir. Ürünlerimizle ilgili her türlü iade ve iptal talebinizi değerlendiriyoruz.
              </p>
            </div>

            {/* İade Formu */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sipariş No
                    </label>
                    <input
                      type="text"
                      name="siparisNo"
                      value={formData.siparisNo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      placeholder="Sipariş numaranızı giriniz"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      placeholder="E-posta adresiniz"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İade Nedeni
                  </label>
                  <select
                    name="iadeNedeni"
                    value={formData.iadeNedeni}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    required
                  >
                    <option value="">Seçiniz...</option>
                    <option value="urun-hatali">Ürün Hatalı</option>
                    <option value="yanlis-urun">Yanlış Ürün</option>
                    <option value="memnuniyetsizlik">Memnuniyetsizlik</option>
                    <option value="hasarli-kargo">Hasarlı Kargo</option>
                    <option value="diger">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    name="aciklama"
                    value={formData.aciklama}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="İade talebinizi detaylı olarak açıklayınız..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Talep Oluştur
                </button>
              </form>
            </div>

            {/* İade Prosedürü */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                İade Prosedürü
              </h2>
              
              <div className="space-y-6">
                {iadeAdimlari.map((adim, index) => {
                  const Icon = adim.icon;
                  return (
                    <div key={adim.id} className="flex items-start gap-4">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                        ${adim.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}
                      `}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {index + 1}. {adim.title}
                        </h3>
                        {adim.completed && (
                          <p className="text-gray-600">
                            {adim.id === 1 && "İade talebiniz sistemimize ulaştığında size otomatik onay e-postası gönderilir."}
                            {adim.id === 2 && "Talebiniz incelenir ve uygun bulunursa onaylanır."}
                            {adim.id === 3 && "Ürünü kargo ile bize göndermeniz için gerekli bilgiler paylaşılır."}
                            {adim.id === 4 && "İadeniz onaylandıktan sonra 5-7 iş günü içinde para iadesi yapılır."}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
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
