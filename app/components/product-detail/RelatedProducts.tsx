'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type RelatedProductCard = {
  id: string;
  name: string;
  imageUrl: string | null;
  images: unknown;
  basePrice: number;
  salePrice: number | null;
  compareAtPrice: number | null;
  category: { slug: string };
};

/** Vitrinde en az 10-12 ürün göstermek için kullanılan dummy veri (gerçek ürün azsa tamamlar) */
const MOCK_RELATED_PRODUCTS: RelatedProductCard[] = [
  { id: 'mock-1', name: 'Kuşe Kağıt A4 80gr 500 Yaprak', imageUrl: '/placeholder-product.svg', images: null, basePrice: 89.9, salePrice: null, compareAtPrice: null, category: { slug: 'kagit' } },
  { id: 'mock-2', name: 'Mat Kuşe Kartvizit 350gr', imageUrl: '/placeholder-product.svg', images: null, basePrice: 145.5, salePrice: 129.9, compareAtPrice: 180, category: { slug: 'kartvizit' } },
  { id: 'mock-3', name: 'Selofan Ambalaj 25x35 cm', imageUrl: '/placeholder-product.svg', images: null, basePrice: 249, salePrice: null, compareAtPrice: null, category: { slug: 'ambalaj' } },
  { id: 'mock-4', name: 'Etiket Sticker 50x70mm 1000 Adet', imageUrl: '/placeholder-product.svg', images: null, basePrice: 189, salePrice: 169, compareAtPrice: 220, category: { slug: 'etiket' } },
  { id: 'mock-5', name: 'Bristol Kart 300gr A4', imageUrl: '/placeholder-product.svg', images: null, basePrice: 125, salePrice: null, compareAtPrice: null, category: { slug: 'kagit' } },
  { id: 'mock-6', name: 'Folyo Baskılı Broşür 100 Adet', imageUrl: '/placeholder-product.svg', images: null, basePrice: 420, salePrice: 379, compareAtPrice: 480, category: { slug: 'brosur' } },
  { id: 'mock-7', name: 'Kraft Torba 20x30 cm 100 Adet', imageUrl: '/placeholder-product.svg', images: null, basePrice: 95, salePrice: null, compareAtPrice: null, category: { slug: 'ambalaj' } },
  { id: 'mock-8', name: 'PVC Kart 85x54mm 100 Adet', imageUrl: '/placeholder-product.svg', images: null, basePrice: 310, salePrice: 289, compareAtPrice: 350, category: { slug: 'kartvizit' } },
  { id: 'mock-9', name: 'Zarf C6 114x162mm 100 Adet', imageUrl: '/placeholder-product.svg', images: null, basePrice: 78, salePrice: null, compareAtPrice: null, category: { slug: 'zarf' } },
  { id: 'mock-10', name: 'Roll Up Banner 85x200 cm', imageUrl: '/placeholder-product.svg', images: null, basePrice: 599, salePrice: 549, compareAtPrice: 680, category: { slug: 'banner' } },
  { id: 'mock-11', name: 'Magnet 10x15 cm 100 Adet', imageUrl: '/placeholder-product.svg', images: null, basePrice: 195, salePrice: null, compareAtPrice: null, category: { slug: 'magnet' } },
  { id: 'mock-12', name: 'Katalog A4 32 Sayfa Kuşe', imageUrl: '/placeholder-product.svg', images: null, basePrice: 12.5, salePrice: null, compareAtPrice: null, category: { slug: 'katalog' } },
];

const TARGET_COUNT = 12;

interface RelatedProductsProps {
  title?: string;
  products: RelatedProductCard[];
}

function getImageUrl(p: RelatedProductCard): string {
  if (p.imageUrl) return p.imageUrl;
  const arr = Array.isArray(p.images) ? (p.images as string[]) : [];
  return (arr[0] as string) || '/placeholder-product.svg';
}

function getDisplayList(products: RelatedProductCard[]): RelatedProductCard[] {
  if (products.length >= TARGET_COUNT) return products.slice(0, TARGET_COUNT);
  const needed = TARGET_COUNT - products.length;
  const mockIds = new Set(products.map((p) => p.id));
  const toAdd = MOCK_RELATED_PRODUCTS.filter((m) => !mockIds.has(m.id)).slice(0, needed);
  return [...products, ...toAdd];
}

export default function RelatedProducts({
  title = 'Bunlar da İlginizi Çekebilir',
  products,
}: RelatedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const list = getDisplayList(products);
  const isMock = (id: string) => id.startsWith('mock-');

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, list.length]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  if (list.length === 0) return null;

  return (
    <section className="border-t border-gray-200 pt-8 pb-10">
      <h2 className="text-xl font-semibold text-gray-900 mb-5">{title}</h2>

      <div className="relative -mx-4 sm:mx-0">
        {/* Sol ok */}
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Önceki ürünler"
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all ${!canScrollLeft ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Sağ ok */}
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Sonraki ürünler"
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all ${!canScrollRight ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Carousel: scroll snap + gizli scrollbar */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide scroll-smooth flex gap-4 pb-2 px-12 sm:px-12"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {list.map((p) => {
            const src = getImageUrl(p);
            const price = p.salePrice ?? p.basePrice;
            const isPlaceholder = src.includes('placeholder') || src.endsWith('.svg');
            const itemClass =
              'flex-shrink-0 w-[55%] min-w-[55%] sm:w-[220px] sm:min-w-[220px] md:w-[240px] md:min-w-[240px] lg:w-[200px] lg:min-w-[200px] snap-start group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow';

            // İndirim mantığı
            const effectiveOriginalPrice = p.compareAtPrice;
            const discount = effectiveOriginalPrice && effectiveOriginalPrice > price
              ? Math.round(((effectiveOriginalPrice - price) / effectiveOriginalPrice) * 100)
              : undefined;

            const cardContent = (
              <>
                <div className="aspect-square bg-gray-50 relative">
                  {discount != null && discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold z-10">
                      %{discount}
                    </div>
                  )}
                  {isPlaceholder ? (
                    <img src={src} alt={p.name} className="w-full h-full object-contain p-4" />
                  ) : (
                    <Image
                      src={src}
                      alt={p.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform"
                      sizes="(max-width: 640px) 55vw, 220px"
                    />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#f97316] transition-colors">
                    {p.name}
                  </p>
                  {effectiveOriginalPrice && effectiveOriginalPrice > price ? (
                    <div className="mt-1">
                      <span className="text-xs text-gray-500 line-through">
                        {effectiveOriginalPrice.toLocaleString('tr-TR')} TL
                      </span>
                      <p className="text-[#16a34a] font-bold">{price.toLocaleString('tr-TR')} TL</p>
                    </div>
                  ) : (
                    <p className="text-[#16a34a] font-bold mt-1">{price.toLocaleString('tr-TR')} TL</p>
                  )}
                </div>
              </>
            );

            if (isMock(p.id)) {
              return (
                <div key={p.id} className={itemClass} style={{ scrollSnapAlign: 'start' }}>
                  {cardContent}
                </div>
              );
            }
            return (
              <Link
                key={p.id}
                href={`/urun/${p.id}`}
                className={itemClass}
                style={{ scrollSnapAlign: 'start' }}
              >
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
