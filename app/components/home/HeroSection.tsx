'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Package, Star, ShoppingCart } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const HERO_ORANGE = '#FF6000';

const PLACEHOLDER_IMG = 'https://placehold.co/100x100/png?text=Urun';

type Banner = {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  link?: string;
  order: number;
  isActive: boolean;
};

type FeaturedWidget = {
  id: string;
  productId: string;
  customTitle?: string;
  order: number;
  product: {
    id: string;
    name: string;
    imageUrl: string;
    basePrice: number;
    salePrice?: number;
    compareAtPrice?: number;
    isPublished: boolean;
    isActive: boolean;
  };
};

type FeaturedProduct = {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
};

export default function HeroSection({ featuredProduct }: { featuredProduct?: FeaturedProduct | null }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredWidgets, setFeaturedWidgets] = useState<FeaturedWidget[]>([]);
  const [promoText, setPromoText] = useState('GÜNÜN FIRSATI');

  useEffect(() => {
    fetch('/api/hero-widgets')
      .then((res) => res.ok ? res.json() : [])
      .then((data: any[]) => setWidgets(Array.isArray(data) ? data : []))
      .catch(() => setWidgets([]));
  }, []);

  useEffect(() => {
    fetch('/api/banners')
      .then((res) => res.ok ? res.json() : [])
      .then((data: Banner[]) => setBanners(data.filter(b => b.isActive)))
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    console.log('HEROSECTION: Fetching featured widgets...');
    fetch('/api/featured')
      .then((res) => {
        console.log('HEROSECTION: Featured widgets response status:', res.status);
        return res.ok ? res.json() : [];
      })
      .then((data: FeaturedWidget[]) => {
        console.log('HEROSECTION: Featured widgets data:', data);
        const activeWidgets = data.filter(w => w.product.isPublished && w.product.isActive);
        console.log('HEROSECTION: Active filtered widgets:', activeWidgets);
        setFeaturedWidgets(activeWidgets);
      })
      .catch((error) => {
        console.error('HEROSECTION: Error fetching featured widgets:', error);
        setFeaturedWidgets([]);
      });
  }, []);

  useEffect(() => {
    if (banners.length > 0) {
      const t = setInterval(() => setCurrentSlide((p) => (p + 1) % banners.length), 5000);
      return () => clearInterval(t);
    }
  }, [banners.length]);

  // Dynamic promo text animation
  useEffect(() => {
    const promoTexts = ['GÜNÜN FIRSATI', 'SÜPER İNDİRİM'];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % promoTexts.length;
      setPromoText(promoTexts[index]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % banners.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + banners.length) % banners.length);

  const product = featuredProduct ?? {
    id: '',
    buttonLink: '/urunler?kategori=kurumsal-urunler',
    image: '/placeholder-product.svg',
    price: 0,
    rating: 4.5,
    reviewCount: 0,
  };

  return (
    <section className="bg-[#f5f5f5] py-4">
      <div className="container mx-auto px-4">
        {/* 1. ÜST: Resimli Kart Bar — Mobilde kaydırma, tablet 6 sütun, masaüstü 12 sütun */}
        <div className="mb-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
          <div className="flex gap-2 pb-2 min-w-max md:grid md:grid-cols-6 md:min-w-0 md:w-full md:gap-1 lg:grid-cols-12 md:pb-2">
            {widgets.map((item) => (
              <Link
                key={item.id}
                href={item.targetUrl}
                className="flex-shrink-0 w-[85px] flex flex-col items-center gap-y-1.5 snap-center group md:w-full md:flex-shrink md:min-w-0"
              >
                <div className="w-[85px] h-[85px] sm:w-24 sm:h-24 flex flex-col rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm group-hover:shadow-md transition-shadow md:w-full md:aspect-square md:h-auto">
                  <div className="h-6 flex-shrink-0 flex items-center justify-center bg-[#FF6000]">
                    <span className="text-[9px] sm:text-[10px] font-bold text-white leading-none truncate max-w-full px-0.5">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl || PLACEHOLDER_IMG}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      width={80}
                      height={80}
                    />
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-gray-900 text-center leading-tight max-w-[85px] sm:max-w-24 md:max-w-full">
                  {item.subtitle}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* 2. ALT: Asimetrik Grid - Slider + Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch lg:h-[340px]">
          {/* SOL: Büyük Kampanya Slider — Dinamik banner'lar (lg:col-span-3) */}
          <div className="lg:col-span-3 relative h-[280px] sm:h-[320px] lg:h-full overflow-hidden rounded-xl shadow-md w-full min-h-0">
            {/* Dinamik banner görselleri */}
            <div className="relative w-full h-full min-h-0">
              {banners.length > 0 ? (
                banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className={`absolute inset-0 w-full h-full min-h-0 transition-opacity duration-700 ease-in-out ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title}
                      fill
                      className="object-cover object-center w-full h-full rounded-xl"
                      sizes="(max-width: 1024px) 100vw, 75vw"
                      priority={index === 0}
                    />
                    {/* Okunabilirlik için koyu katman */}
                    <div className="absolute inset-0 bg-black/50 z-10 rounded-xl" aria-hidden />
                    
                    {/* Banner içeriği */}
                    <Link
                      href={banner.link || '#'}
                      className="absolute inset-0 z-20 flex flex-col items-end justify-center pr-6 sm:pr-12 pl-6 sm:pl-12 text-right"
                    >
                      <h2 className="text-white font-black text-2xl sm:text-4xl md:text-5xl drop-shadow-lg leading-tight max-w-[90%]">
                        {banner.title}
                      </h2>
                      <p className="text-white/95 text-sm sm:text-base md:text-lg mt-2 max-w-[85%] drop-shadow-md">
                        {banner.subtitle}
                      </p>
                      <span className="inline-block mt-3 sm:mt-4 px-4 py-2 bg-white text-[#FF6000] font-bold rounded-lg text-sm sm:text-base shadow-lg hover:bg-gray-50 transition-colors">
                        Hemen İncele
                      </span>
                      <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-mono px-2 py-1 rounded">
                        {currentSlide + 1}/{banners.length}
                      </span>
                    </Link>
                  </div>
                ))
              ) : (
                /* Varsayılan banner (veritabanında banner yoksa) */
                <div className="absolute inset-0 w-full h-full min-h-0">
                  <Image
                    src="/images/hero-bg.png"
                    alt=""
                    fill
                    className="object-cover object-center w-full h-full rounded-xl"
                    sizes="(max-width: 1024px) 100vw, 75vw"
                    priority
                  />
                  {/* Okunabilirlik için koyu katman */}
                  <div className="absolute inset-0 bg-black/50 z-10 rounded-xl" aria-hidden />
                  
                  {/* Varsayılan içerik */}
                  <div className="absolute inset-0 z-20 flex flex-col items-end justify-center pr-6 sm:pr-12 pl-6 sm:pl-12 text-right">
                    <h2 className="text-white font-black text-2xl sm:text-4xl md:text-5xl drop-shadow-lg leading-tight max-w-[90%]">
                      TÜRKİYE'NİN ONLINE MATBAASI
                    </h2>
                    <p className="text-white/95 text-sm sm:text-base md:text-lg mt-2 max-w-[85%] drop-shadow-md">
                      Profesyonel baskı ürünleri için güvenilir adresiniz
                    </p>
                    <Link href="/urunler" className="inline-block mt-3 sm:mt-4 px-4 py-2 bg-white text-[#FF6000] font-bold rounded-lg text-sm sm:text-base shadow-lg hover:bg-gray-50 transition-colors">
                      Hemen İncele
                    </Link>
                  </div>
                </div>
              )}

              {/* Slider kontrolleri */}
              {banners.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevSlide(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-800 hover:bg-white transition-colors z-30"
                    aria-label="Önceki"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextSlide(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-800 hover:bg-white transition-colors z-30"
                    aria-label="Sonraki"
                  >
                    <ChevronRight size={22} />
                  </button>
                  
                  {/* Pagination dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                    {banners.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentSlide(index); }}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentSlide ? 'bg-white' : 'bg-white/50'
                        }`}
                        aria-label={`Slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* SAĞ: Senin İçin Seçtiklerimiz (lg:col-span-1) - turuncu noktalı arka plan */}
          <div
            className="lg:col-span-1 rounded-xl overflow-hidden shadow-md relative h-full min-h-[280px] sm:min-h-[320px] lg:h-full flex flex-col bg-[#FF6000] overflow-hidden min-h-0"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 50%),
                radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 40%),
                repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 4px, rgba(255,255,255,0.06) 4px, rgba(255,255,255,0.06) 5px)`,
            }}
          >
            <div className="p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-sm sm:text-base drop-shadow-md">
                  Öne Çıkanlar
                </h2>
                <span className="bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white font-extrabold text-xs px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                  {promoText}
                </span>
              </div>
            </div>
            <div className="flex-1 p-2 pt-0 flex flex-col min-h-0">
              <div className="bg-white rounded-xl p-2 shadow-sm flex-1 flex flex-col justify-between overflow-hidden min-h-0">
                {featuredWidgets.length > 0 ? (
                  <div className="flex-1 flex flex-col gap-1 overflow-hidden min-h-0">
                    {featuredWidgets.slice(0, 3).map((widget) => {
                      const product = widget.product;
                      const price = product.salePrice ?? product.basePrice;
                      
                      return (
                        <Link
                          key={widget.id}
                          href={`/urun/${product.id}`}
                          className="flex flex-row items-center gap-2 p-2 hover:bg-orange-50 rounded-lg transition-colors group flex-shrink-0"
                        >
                          {/* Sol: Küçük kare resim */}
                          <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={product.imageUrl || '/placeholder-product.svg'}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          
                          {/* Sağ: Metinler */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-[#FF6000] transition-colors">
                              {widget.customTitle || product.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {/* İndirimli Fiyat Gösterimi */}
                              {product.compareAtPrice && product.compareAtPrice > price ? (
                                <>
                                  {/* Eski Fiyat (Üstü Çizili) */}
                                  <span className="text-gray-400 text-xs line-through">
                                    {product.compareAtPrice.toLocaleString('tr-TR')} TL
                                  </span>
                                  {/* Güncel Fiyat */}
                                  <span className="text-orange-600 font-extrabold text-sm">
                                    {price.toLocaleString('tr-TR')} TL
                                  </span>
                                  {/* İndirim Rozeti */}
                                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse whitespace-nowrap">
                                    -{Math.round(((product.compareAtPrice - price) / product.compareAtPrice) * 100)}%
                                  </span>
                                </>
                              ) : (
                                /* Normal Fiyat */
                                <span className="text-orange-600 font-extrabold text-sm">
                                  {price.toLocaleString('tr-TR')} TL
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xs text-center py-3">
                    <Package className="w-8 h-8 text-gray-300 mb-1" />
                    <p>Öne çıkan ürün yok</p>
                    <Link href="/urunler" className="text-[#FF6000] text-xs font-medium mt-1 hover:underline">
                      Kategorilere git
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
