'use client';

import { useState } from 'react';
import { TrendingUp, Shield, Truck, Package, Users, MapPin, Clock, ArrowRight, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TedarikciOlPage() {
  const [formData, setFormData] = useState({
    firmaAdi: '',
    yetkiliKisi: '',
    telefon: '',
    email: '',
    urunGrubu: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Tedarikçi başvurusu:', formData);
    // Burada API çağrısı yapılacak
  };

  const avantajlar = [
    {
      icon: Package,
      title: 'Satış Hacmi',
      description: 'Sürekli ve yüksek hacimli sipariş akışı.'
    },
    {
      icon: Shield,
      title: 'Garanti Ödeme',
      description: 'Vadeli değil, planlı ve garanti ödeme sistemi.'
    },
    {
      icon: TrendingUp,
      title: 'Marka Bilinirliği',
      description: 'Firmanızı Türkiye geneline tanıtma fırsatı.'
    }
  ];

  const urunGruplari = [
    'Kağıt & Karton',
    'Matbaa Boyaları',
    'Ambalaj Malzemeleri',
    'Promosyon Ürünleri',
    'Makine Yedek Parça'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Hero Bölümü */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Sol Taraf - İçerik */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="text-orange-500">Tedarikçimiz Olun</span>, Birlikte Büyüyelim
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Ürünlerinizi binlerce kurumsal müşteriye doğrudan ulaştırın. Pazarlama, lojistik ve tahsilat süreçlerini biz yönetelim, siz üretime odaklanın.
              </p>
              
              <button
                onClick={() => document.getElementById('basvuru-formu')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
              >
                Hemen Başvurun
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Sağ Taraf - Görsel */}
            <div className="relative">
              <Image
                src='https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1600&auto=format&fit=crop'
                alt="MatbaaGross Kurumsal İş Ortaklığı ve Lojistik Ağı"
                width={600}
                height={400}
                className="rounded-2xl shadow-xl object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Güç Veren İstatistikler */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">5000+ Kurumsal Müşteri</span>
            </div>
            <div className="hidden md:block text-gray-400">|</div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">81 İle Kargo</span>
            </div>
            <div className="hidden md:block text-gray-400">|</div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">Zamanında Ödeme Garantisi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tedarikçi Avantajları */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tedarikçi Avantajları
            </h2>
            <p className="text-xl text-gray-600">
              Türkiye'nin en büyük matbaa platformunun avantajları
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {avantajlar.map((avantaj, index) => {
              const Icon = avantaj.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {avantaj.title}
                  </h3>
                  <p className="text-gray-600">
                    {avantaj.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Aradığımız Kategoriler */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tedarik Edebileceğiniz Ürün Grupları
            </h2>
            <p className="text-xl text-gray-600">
              Geniş ürün yelpazemize katkıda bulunun
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {urunGruplari.map((urun, index) => (
              <div
                key={index}
                className="bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-700 px-6 py-3 rounded-full font-medium border border-gray-200 hover:border-orange-300 transition-all"
              >
                {urun}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Başvuru Formu */}
      <div id="basvuru-formu" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Tedarikçi Başvuru Formu
              </h2>
              <p className="text-xl text-gray-600">
                Formu doldurun, en kısa sürede sizinle iletişime geçelim
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Firma Adı
                  </label>
                  <input
                    type="text"
                    name="firmaAdi"
                    value={formData.firmaAdi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="Firma adınız"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yetkili Kişi
                  </label>
                  <input
                    type="text"
                    name="yetkiliKisi"
                    value={formData.yetkiliKisi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="Adınız soyadınız"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      name="telefon"
                      value={formData.telefon}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      placeholder="Telefon numaranız"
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
                    Ürün Grubu
                  </label>
                  <select
                    name="urunGrubu"
                    value={formData.urunGrubu}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    required
                  >
                    <option value="">Seçiniz...</option>
                    {urunGruplari.map((urun, index) => (
                      <option key={index} value={urun}>
                        {urun}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-6 py-4 rounded-lg transition-colors"
                >
                  Başvuruyu Gönder
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
