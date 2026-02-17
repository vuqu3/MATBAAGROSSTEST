'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentCampaignSlide, setCurrentCampaignSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'MatbaaGross Açıldı! %40\'a Varan Açılış İndirimleri',
      subtitle: 'Tüm kategorilerde özel fiyatlar. Hemen keşfedin!',
      buttonText: 'Kampanyaları Gör',
      buttonLink: '/kampanyalar',
      bgImage: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1200&h=600&fit=crop',
      bgColor: 'from-[#FF6000] to-[#e55a00]',
    },
    {
      id: 2,
      title: 'Kurumsal Baskı Çözümleri - İşinizi Profesyonelleştirin',
      subtitle: 'Kartvizit, antetli kağıt, zarf ve daha fazlası',
      buttonText: 'Ürünleri İncele',
      buttonLink: '/kategori/kurumsal-urunler',
      bgImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=600&fit=crop',
      bgColor: 'from-[#1e3a8a] to-[#3b82f6]',
    },
    {
      id: 3,
      title: 'Toptan Koli ve Ambalaj Fırsatları',
      subtitle: 'Büyük partilerde özel fiyatlar. Minimum sipariş avantajları',
      buttonText: 'Fırsatları Gör',
      buttonLink: '/kategori/kutu-ve-ambalaj',
      bgImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1200&h=600&fit=crop',
      bgColor: 'from-[#059669] to-[#10b981]',
    },
  ];

  const campaigns = [
    {
      id: 1,
      title: 'Kartvizitlerde 1000 Adet Kampanyası',
      subtitle: '%30 İndirim',
      link: '/kampanyalar/kartvizit',
      bgImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop',
      bgColor: 'from-[#FF6000] to-[#e55a00]',
    },
    {
      id: 2,
      title: 'Fason Kesim İndirimi',
      subtitle: 'Özel Fiyatlar',
      link: '/fason-uretim',
      bgImage: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop',
      bgColor: 'from-[#1e3a8a] to-[#3b82f6]',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCampaignSlide((prev) => (prev + 1) % campaigns.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="bg-white py-3">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-3">
          {/* Sol: Ana Slider (%70) */}
          <div className="lg:col-span-7 relative h-[320px] overflow-hidden rounded-lg shadow-sm">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="relative w-full h-full overflow-hidden">
                  {/* Background Image with Overlay */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${slide.bgImage})`,
                    }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} opacity-85`}></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <div className="px-4 text-center text-white max-w-2xl">
                      <h1 className="text-xl md:text-2xl font-semibold mb-2 drop-shadow-lg">{slide.title}</h1>
                      <p className="text-sm md:text-base mb-4 text-white/95 drop-shadow-md">{slide.subtitle}</p>
                      <Link
                        href={slide.buttonLink}
                        className="inline-block bg-white text-[#FF6000] hover:bg-gray-100 font-semibold py-2 px-5 rounded-md transition-colors text-sm shadow-md"
                      >
                        {slide.buttonText}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
              aria-label="Önceki slide"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
              aria-label="Sonraki slide"
            >
              <ChevronRight size={20} />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Sağ: Kampanya Slider (%30) */}
          <div className="lg:col-span-3 relative h-[320px] overflow-hidden rounded-lg shadow-sm">
            {campaigns.map((campaign, index) => (
              <Link
                key={campaign.id}
                href={campaign.link}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentCampaignSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="relative w-full h-full overflow-hidden">
                  {/* Background Image with Overlay */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${campaign.bgImage})`,
                    }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${campaign.bgColor} opacity-80`}></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <div className="text-center text-white px-3">
                      <h3 className="text-base font-semibold mb-1 drop-shadow-lg">{campaign.title}</h3>
                      <p className="text-sm text-white/95 drop-shadow-md">{campaign.subtitle}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Campaign Dots Indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {campaigns.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentCampaignSlide(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentCampaignSlide ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                  aria-label={`Kampanya ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
