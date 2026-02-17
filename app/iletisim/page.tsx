'use client';

import { useState } from 'react';
import { Package, AlertTriangle, HelpCircle, Phone, MessageCircle, HeadphonesIcon, MapPin, Mail, User, MessageSquare, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function IletisimPage() {
  const [formData, setFormData] = useState({
    adSoyad: '',
    konu: '',
    mesaj: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('İletişim formu:', formData);
    // Burada API çağrısı yapılacak
  };

  const menuItems = [
    { id: 1, title: 'Sipariş Takibi', href: '/siparis-takip', active: false, icon: Package },
    { id: 2, title: 'İade ve İptal', href: '/iade-ve-iptal', active: false, icon: AlertTriangle },
    { id: 3, title: 'Sıkça Sorulanlar', href: '/sikca-sorulanlar', active: false, icon: HelpCircle },
    { id: 4, title: 'Bize Ulaşın', href: '/iletisim', active: true, icon: Phone },
    { id: 5, title: 'Canlı Destek', href: '/iletisim', active: false, icon: HeadphonesIcon }
  ];

  const iletisimBilgileri = [
    {
      icon: MapPin,
      title: 'Adres',
      content: 'MatbaaGross Merkez Ofis, Organize Sanayi Bölgesi, Istanbul, Türkiye'
    },
    {
      icon: Phone,
      title: 'Telefon',
      content: '+90 212 123 45 67'
    },
    {
      icon: Mail,
      title: 'E-posta',
      content: 'info@matbaagross.com'
    },
    {
      icon: Clock,
      title: 'Çalışma Saatleri',
      content: 'Pazartesi - Cuma: 09:00 - 18:00, Cumartesi: 10:00 - 16:00'
    }
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
                İletişim & Adres Bilgileri
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sol Taraf - İletişim Bilgileri */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    İletişim Bilgileri
                  </h2>
                  
                  <div className="space-y-4">
                    {iletisimBilgileri.map((bilgi, index) => {
                      const Icon = bilgi.icon;
                      return (
                        <div key={index} className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-orange-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {bilgi.title}
                            </h3>
                            <p className="text-gray-600">
                              {bilgi.content}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Google Maps Placeholder */}
                <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      Harita Yükleniyor...
                    </p>
                  </div>
                </div>
              </div>

              {/* Sağ Taraf - İletişim Formu */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Bize Yazın
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="adSoyad"
                        value={formData.adSoyad}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        placeholder="Adınızı ve soyadınızı giriniz"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Konu
                    </label>
                    <input
                      type="text"
                      name="konu"
                      value={formData.konu}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      placeholder="Mesaj konusu"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mesaj
                    </label>
                    <textarea
                      name="mesaj"
                      value={formData.mesaj}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      placeholder="Mesajınızı buraya yazınız..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Mesajı Gönder
                  </button>
                </form>
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
