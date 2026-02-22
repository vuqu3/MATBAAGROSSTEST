'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calculator } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  basePrice?: number;
  compareAtPrice?: number;
}

export default function ProductCard({ id, name, image, basePrice, compareAtPrice }: ProductCardProps) {
  // İndirim mantığı: compareAtPrice > basePrice ise indirim var
  const discount = compareAtPrice && basePrice && compareAtPrice > basePrice
    ? Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100)
    : undefined;
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-200">
      <Link href={`/urun/${id}`}>
        <div className="relative w-full h-64 bg-gray-100">
          {discount != null && discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold z-10">
              %{discount} İndirim
            </div>
          )}
          {image.endsWith('.svg') ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>
      </Link>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
          {name}
        </h3>
        <div className="mb-3">
          {compareAtPrice && basePrice && compareAtPrice > basePrice ? (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 line-through">
                {compareAtPrice.toLocaleString('tr-TR')} TL
              </span>
              <span className="text-lg font-bold text-[#1e3a8a]">
                {basePrice.toLocaleString('tr-TR')} TL
              </span>
            </div>
          ) : basePrice ? (
            <p className="text-sm text-gray-600">
              Başlangıç: <span className="font-bold text-[#1e3a8a]">{basePrice.toLocaleString('tr-TR')} TL</span>
            </p>
          ) : null}
        </div>
        <Link
          href={`/urun/${id}`}
          className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Calculator size={18} />
          Hemen Hesapla
        </Link>
      </div>
    </div>
  );
}
