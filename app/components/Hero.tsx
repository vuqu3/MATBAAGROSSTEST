'use client';

import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'MatbaaGross ile Maliyetlerinizi Düşürün',
      subtitle: '1000 Adet Kartvizit Sadece 250 TL',
      image: '/hero-1.jpg',
    },
    {
      title: 'Profesyonel Baskı Çözümleri',
      subtitle: 'Ofset ve Dijital Baskı Hizmetleri',
      image: '/hero-2.jpg',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Slider */}
          <div className="lg:col-span-2 relative bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-96 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6]">
              <div className="absolute inset-0 flex items-center justify-center text-white p-8">
                <div className="text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    {slides[currentSlide].title}
                  </h2>
                  <p className="text-xl md:text-2xl mb-6">{slides[currentSlide].subtitle}</p>
                  <Link
                    href="/urunler"
                    className="inline-block bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                  >
                    Hemen Keşfet
                  </Link>
                </div>
              </div>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
              >
                <ChevronRight size={24} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Günün Fırsat Ürünü */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-[#f97316]">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-[#f97316]" size={20} />
              <h3 className="font-bold text-lg text-gray-900">Günün Fırsat Ürünü</h3>
            </div>
            <div className="bg-gray-100 rounded-lg h-48 mb-4 flex items-center justify-center">
              <span className="text-gray-400">Ürün Görseli</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Kartvizit Baskı</h4>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold text-[#f97316]">199 TL</span>
              <span className="text-sm text-gray-500 line-through">299 TL</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-[#f97316] h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-xs text-gray-600 mb-4">Kalan: 12 adet</p>
            <div className="text-center mb-4">
              <p className="text-xs text-gray-600 mb-1">Kampanya Bitiş:</p>
              <div className="flex gap-2 justify-center">
                <div className="bg-[#1e3a8a] text-white px-3 py-1 rounded">
                  <div className="text-lg font-bold">02</div>
                  <div className="text-xs">Saat</div>
                </div>
                <div className="bg-[#1e3a8a] text-white px-3 py-1 rounded">
                  <div className="text-lg font-bold">45</div>
                  <div className="text-xs">Dakika</div>
                </div>
                <div className="bg-[#1e3a8a] text-white px-3 py-1 rounded">
                  <div className="text-lg font-bold">30</div>
                  <div className="text-xs">Saniye</div>
                </div>
              </div>
            </div>
            <Link
              href="/urun/kartvizit-firsat"
              className="block w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold py-2 px-4 rounded-lg transition-colors text-center"
            >
              Hemen Al
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
