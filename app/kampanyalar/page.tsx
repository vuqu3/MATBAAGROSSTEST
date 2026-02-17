'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Rocket, Clock } from 'lucide-react';

export default function KampanyalarPage() {
  const kampanyaKartlari = [
    {
      id: 1,
      title: 'Süper Sale',
      subtitle: 'İndirimli Ürünler',
      bgColor: 'bg-gradient-to-br from-orange-400 to-orange-600',
      href: '/indirimli-urunler'
    },
    {
      id: 2,
      title: 'Acil Baskı',
      subtitle: 'Baskıya Başla',
      bgColor: 'bg-gradient-to-br from-red-400 to-red-600',
      href: '/hemen-baski'
    },
    {
      id: 3,
      title: 'Bugün Kargo',
      subtitle: 'Bedava Gönderim',
      bgColor: 'bg-gradient-to-br from-green-400 to-green-600',
      href: '/bedava-kargo'
    },
    {
      id: 4,
      title: 'Outlet',
      subtitle: '%50 İndirim',
      bgColor: 'bg-gradient-to-br from-purple-400 to-purple-600',
      href: '/outlet'
    },
    {
      id: 5,
      title: 'Firmanıza Özel',
      subtitle: 'Kurumsal Baskılar',
      bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
      href: '/kurumsal-baskilar'
    },
    {
      id: 6,
      title: 'AmbalajGROSS',
      subtitle: 'Ucuz Ambalaj',
      bgColor: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      href: '/ambalaj'
    },
    {
      id: 7,
      title: 'Toptan Fiyatına',
      subtitle: 'Bu Fırsat Kaçmaz',
      bgColor: 'bg-gradient-to-br from-pink-400 to-pink-600',
      href: '/toptan-fiyat'
    },
    {
      id: 8,
      title: 'Fason Üretim',
      subtitle: 'Kesim & Baskı',
      bgColor: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
      href: '/fason-uretim'
    }
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Arka Plan - Renkli Grid (Bulanık) */}
      <div className="absolute inset-0">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 opacity-30">
          {kampanyaKartlari.map((kart) => (
            <div 
              key={kart.id}
              className={`aspect-square ${kart.bgColor} rounded-lg`}
            >
              {/* Dekoratif Elementler */}
              <div className="w-full h-full relative overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-white/10"></div>
                <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full"></div>
                <div className="absolute bottom-4 right-4 w-12 h-12 bg-white/20 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-16 h-16 bg-white/30 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 bg-white/50 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulanık Katman */}
      <div className="absolute inset-0 backdrop-blur-xl bg-white/60"></div>

      {/* Merkez Kartı */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          {/* Logo */}
          <div className="w-24 h-16 mx-auto mb-8 flex items-center justify-center">
            <Image
              src="/matbaagross-logo.png"
              alt="MatbaaGross"
              width={200}
              height={56}
              className="h-16 w-auto object-contain"
              priority
            />
          </div>
          
          {/* Başlık */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Büyük Fırsatlar Hazırlanıyor!
          </h1>
          
          {/* Açıklama */}
          <p className="text-gray-600 leading-relaxed mb-8">
            Sizlere özel kurumsal kampanyalarımızı ve indirimlerimizi yayına almak için son hazırlıkları yapıyoruz. Takipte kalın!
          </p>
          
          {/* Aksiyon Butonu */}
          <Link 
            href="/"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
