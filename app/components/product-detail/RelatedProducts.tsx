'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type RelatedProductCard = {
  id: string;
  slug?: string;
  name: string;
  imageUrl: string | null;
  images: unknown;
  basePrice: number;
  salePrice: number | null;
  compareAtPrice: number | null;
  category: { slug: string };
};

const TARGET_COUNT = 12;

interface RelatedProductsProps {
  title?: string;
  products: RelatedProductCard[];
}

function getImageUrl(p: RelatedProductCard): string {
  if (p.imageUrl) return p.imageUrl;
  const arr = Array.isArray(p.images) ? (p.images as string[]) : [];
  return (arr[0] as string) || '';
}

function isRealImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const u = url.trim();
  if (!u) return false;
  const lower = u.toLowerCase();
  if (lower.includes('placeholder')) return false;
  if (lower.includes('no-image')) return false;
  if (lower.includes('noimage')) return false;
  if (lower.includes('default')) return false;
  if (lower.endsWith('/placeholder-product.svg')) return false;
  return true;
}

function hasRealImage(p: RelatedProductCard): boolean {
  if (isRealImageUrl(p.imageUrl)) return true;
  const arr = Array.isArray(p.images) ? (p.images as string[]) : [];
  return arr.some((u) => isRealImageUrl(u));
}

function getDisplayList(products: RelatedProductCard[]): RelatedProductCard[] {
  return products.filter(hasRealImage).slice(0, TARGET_COUNT);
}

export default function RelatedProducts({
  title = 'Bunlar da İlginizi Çekebilir',
  products,
}: RelatedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const list = getDisplayList(products);

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
            const isPlaceholder = !src || src.includes('placeholder') || src.endsWith('.svg');
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

            return (
              <Link
                key={p.id}
                href={`/urun/${p.slug || p.id}`}
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
