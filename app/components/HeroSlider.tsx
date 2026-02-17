'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'Ramazan Ayına Özel İmsakiye',
      subtitle: 'Şimdi Sipariş Ver, %20 İndirimli',
      buttonText: 'Hemen Sipariş Ver',
      buttonLink: '/urun/imsakiye-basim',
      bgColor: 'from-[#1e3a8a] to-[#3b82f6]',
    },
    {
      id: 2,
      title: 'Toptan Bristol Kartonda Dev Kampanya',
      subtitle: 'Büyük Parti Siparişlerde Özel Fiyatlar',
      buttonText: 'Kampanyayı Gör',
      buttonLink: '/kampanyalar',
      bgColor: 'from-[#FF6000] to-[#e55a00]',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-gray-100">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className={`w-full h-full bg-gradient-to-r ${slide.bgColor} flex items-center justify-center`}>
            <div className="container mx-auto px-4 text-center text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{slide.title}</h1>
              <p className="text-lg md:text-xl mb-8 text-white/90">{slide.subtitle}</p>
              <Link
                href={slide.buttonLink}
                className="inline-block bg-white text-[#FF6000] hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors text-lg"
              >
                {slide.buttonText}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
        aria-label="Önceki slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
        aria-label="Sonraki slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
