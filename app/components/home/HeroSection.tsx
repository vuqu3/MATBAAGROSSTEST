'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Package, Star, ShoppingCart } from 'lucide-react';

const HERO_ORANGE = '#FF6000';

const PLACEHOLDER_IMG = 'https://placehold.co/100x100/png?text=Urun';

type HeroWidgetItem = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  targetUrl: string;
  order: number;
};

/** Açılış lansmanı slider: başlık, alt başlık, buton metni, link, arka plan görseli */
const campaignSlides = [
  {
    id: 1,
    title: "TÜRKİYE'NİN ONLINE MATBAASI AÇILDI!",
    subtitle: 'Tüm Baskı Ürünlerinde Açılışa Özel %50 İndirim Fırsatı',
    buttonText: 'Hemen İncele',
    link: '/kampanyalar',
    bgImage: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1200&h=500&fit=crop',
  },
  {
    id: 2,
    title: 'TOPTAN AL, ÇOK KAZAN',
    subtitle: "Koli Bazlı Alımlarda Ekstra %20 İskonto MatbaaGross'ta!",
    buttonText: 'Fiyat Listesi',
    link: '/kampanyalar',
    bgImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1200&h=500&fit=crop',
  },
  {
    id: 3,
    title: 'BEKLEMEK YOK, ÜRETİM VAR',
    subtitle: "Saat 14:00'e kadar verdiğin siparişler aynı gün kargoda.",
    buttonText: 'Acil Baskı Ürünleri',
    link: '/kategori',
    bgImage: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=1200&h=500&fit=crop',
  },
];

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
  const [widgets, setWidgets] = useState<HeroWidgetItem[]>([]);

  useEffect(() => {
    fetch('/api/hero-widgets')
      .then((res) => res.ok ? res.json() : [])
      .then((data: HeroWidgetItem[]) => setWidgets(Array.isArray(data) ? data : []))
      .catch(() => setWidgets([]));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % campaignSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % campaignSlides.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + campaignSlides.length) % campaignSlides.length);

  const product = featuredProduct ?? {
    id: '',
    name: 'Öne çıkan ürünler',
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* SOL: Büyük Kampanya Slider — Sabit arka plan + değişen yazılar (lg:col-span-3) */}
          <div className="lg:col-span-3 relative h-[280px] sm:h-[320px] overflow-hidden rounded-xl shadow-md">
            {/* Sabit arka plan görseli */}
            <Image
              src="/images/hero-bg.png"
              alt=""
              fill
              className="object-cover absolute inset-0 z-0"
              sizes="(max-width: 1024px) 100vw, 75vw"
              priority
            />
            {/* Okunabilirlik için koyu katman */}
            <div className="absolute inset-0 bg-black/50 z-10 rounded-xl" aria-hidden />
            {/* Slider içeriği (sadece yazılar kayar, arka plan sabit) */}
            <div className="absolute inset-0 z-20">
              {campaignSlides.map((slide, index) => (
                <Link
                  key={slide.id}
                  href={slide.link}
                  className={`absolute inset-0 flex flex-col items-end justify-center pr-6 sm:pr-12 pl-6 sm:pl-12 text-right transition-opacity duration-700 ease-in-out ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <h2 className="text-white font-black text-2xl sm:text-4xl md:text-5xl drop-shadow-lg leading-tight max-w-[90%]">
                    {slide.title}
                  </h2>
                  <p className="text-white/95 text-sm sm:text-base md:text-lg mt-2 max-w-[85%] drop-shadow-md">
                    {slide.subtitle}
                  </p>
                  <span className="inline-block mt-3 sm:mt-4 px-4 py-2 bg-white text-[#FF6000] font-bold rounded-lg text-sm sm:text-base shadow-lg hover:bg-gray-50 transition-colors">
                    {slide.buttonText}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-mono px-2 py-1 rounded">
                    {currentSlide + 1}/{campaignSlides.length}
                  </span>
                </Link>
              ))}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); prevSlide(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-800 hover:bg-gray-50 transition-colors"
                aria-label="Önceki"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); nextSlide(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-800 hover:bg-gray-50 transition-colors"
                aria-label="Sonraki"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>

          {/* SAĞ: Senin İçin Seçtiklerimiz (lg:col-span-1) - turuncu noktalı arka plan */}
          <div
            className="lg:col-span-1 rounded-xl overflow-hidden shadow-md relative min-h-[280px] sm:min-h-[320px] flex flex-col bg-[#FF6000]"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 50%),
                radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 40%),
                repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 4px, rgba(255,255,255,0.06) 4px, rgba(255,255,255,0.06) 5px)`,
            }}
          >
            <div className="p-3 flex items-center justify-between">
              <h2 className="text-white font-bold text-base sm:text-lg drop-shadow-md">
                Senin İçin Seçtiklerimiz
              </h2>
              <span className="text-[10px] text-white/90 bg-white/20 px-1.5 py-0.5 rounded">Reklam</span>
            </div>
            <div className="flex-1 p-3 pt-0 flex flex-col">
              <div className="bg-white rounded-xl p-3 shadow-sm flex-1 flex flex-col">
                {product.id ? (
                  <>
                    <Link href={`/urun/${product.id}`} className="flex gap-3 flex-1 min-h-0">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-xs text-gray-600">
                            {product.rating ?? 4.5} ({product.reviewCount ?? 0})
                          </span>
                        </div>
                        <p className="text-sm font-bold text-[#FF6000] mt-1">
                          {Number(product.price).toLocaleString('tr-TR')} TL
                        </p>
                      </div>
                    </Link>
                    <Link
                      href={`/urun/${product.id}`}
                      className="mt-2 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ShoppingCart size={14} />
                      Sepete Ekle
                    </Link>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-sm text-center py-4">
                    <Package className="w-10 h-10 text-gray-300 mb-2" />
                    <p>Öne çıkan ürün yok</p>
                    <Link href="/kategori" className="text-[#FF6000] text-xs font-medium mt-1 hover:underline">
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
