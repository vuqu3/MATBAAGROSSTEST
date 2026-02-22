'use client';

import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCardEcommerce from './ProductCardEcommerce';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  compareAtPrice?: number;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  productType?: 'READY' | 'CUSTOM';
  stock?: number | null;
  stockQuantity?: number | null;
}

interface ProductCarouselProps {
  title: string;
  products: Product[];
  showTimer?: boolean;
  timerEndTime?: string;
}

export default function ProductCarousel({ title, products, showTimer = false, timerEndTime }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (showTimer && timerEndTime) {
      const calculateTimeLeft = () => {
        const now = new Date().getTime();
        const end = new Date(timerEndTime).getTime();
        const difference = end - now;

        if (difference > 0) {
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeLeft('00:00:00');
        }
      };

      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(interval);
    }
  }, [showTimer, timerEndTime]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="bg-[#f5f5f5] py-4">
      <div className="container mx-auto px-4">
        {/* Başlık */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-[#484848]">{title}</h2>
            {showTimer && timeLeft && (
              <div className="flex items-center gap-1.5 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-mono font-semibold">
                <Clock size={12} />
                <span>{timeLeft}</span>
              </div>
            )}
          </div>
          <Link
            href="/urunler"
            className="text-[#FF6000] hover:text-[#e55a00] font-semibold text-sm transition-colors hidden md:block"
          >
            Tümünü Gör →
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Scroll Buttons */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
            aria-label="Sola kaydır"
          >
            <ChevronLeft size={24} className="text-[#484848]" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
            aria-label="Sağa kaydır"
          >
            <ChevronRight size={24} className="text-[#484848]" />
          </button>

          {/* Products Grid */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-10"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[180px]">
                <ProductCardEcommerce
                  id={product.id}
                  name={product.name}
                  image={product.image}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  compareAtPrice={product.compareAtPrice}
                  discount={product.discount}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  productType={product.productType}
                  stock={product.stock}
                  stockQuantity={product.stockQuantity}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
