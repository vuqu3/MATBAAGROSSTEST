'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Truck, Zap, Factory, Package } from 'lucide-react';

export type ProductGalleryImage = string;

type BadgeId = 'fast_shipping' | 'fast_delivery' | 'custom_production' | 'wholesale';

const BADGES: { id: BadgeId; label: string; icon: React.ElementType; bg: string; text: string }[] = [
  { id: 'fast_shipping', label: 'Hızlı Kargo', icon: Truck, bg: 'bg-emerald-100', text: 'text-emerald-800' },
  { id: 'fast_delivery', label: 'Hızlı Teslimat', icon: Zap, bg: 'bg-amber-100', text: 'text-amber-800' },
  { id: 'custom_production', label: 'Fason Üretim', icon: Factory, bg: 'bg-slate-100', text: 'text-slate-700' },
  { id: 'wholesale', label: 'Toptan Fırsatı', icon: Package, bg: 'bg-blue-100', text: 'text-blue-800' },
];

interface ProductGalleryProps {
  productName: string;
  imageUrl: string | null;
  images: unknown;
  /** Dinamik rozetler: ürüne göre gösterilecek id'ler. Örn: ['fast_delivery', 'wholesale'] */
  badgeIds?: BadgeId[];
  /** productionDays <= 3 ise Hızlı Teslimat, minOrderQuantity > 50 ise Toptan Fırsatı vb. */
  minOrderQuantity?: number | null;
  productionDays?: number | null;
  productType?: string;
}

function getDefaultBadges(props: {
  minOrderQuantity?: number | null;
  productionDays?: number | null;
  productType?: string;
}): BadgeId[] {
  const ids: BadgeId[] = ['fast_shipping']; // Varsayılan: Hızlı Kargo
  if (props.productionDays != null && props.productionDays <= 3) ids.push('fast_delivery');
  if (props.minOrderQuantity != null && props.minOrderQuantity > 50) ids.push('wholesale');
  if (props.productType === 'CUSTOM') ids.push('custom_production');
  return ids;
}

export default function ProductGallery({
  productName,
  imageUrl,
  images,
  badgeIds,
  minOrderQuantity,
  productionDays,
  productType,
}: ProductGalleryProps) {
  const [mainIndex, setMainIndex] = useState(0);

  const imageList = useMemo(() => {
    const main = imageUrl;
    const arr = Array.isArray(images) ? (images as string[]) : [];
    if (main && !arr.includes(main)) return [main, ...arr];
    if (arr.length) return arr;
    return [main || '/placeholder-product.svg'];
  }, [imageUrl, images]);

  const activeBadges = useMemo(() => {
    const ids = badgeIds ?? getDefaultBadges({ minOrderQuantity, productionDays, productType });
    return BADGES.filter((b) => ids.includes(b.id));
  }, [badgeIds, minOrderQuantity, productionDays, productType]);

  const mainSrc = imageList[mainIndex] || imageList[0] || '/placeholder-product.svg';
  const isPlaceholder = mainSrc.includes('placeholder') || mainSrc.endsWith('.svg');

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 shadow-sm aspect-square max-h-[420px] flex items-center justify-center">
        {/* Rozetler - sol üst */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {activeBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <span
                key={badge.id}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium shadow-sm ${badge.bg} ${badge.text}`}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                {badge.label}
              </span>
            );
          })}
        </div>

        {isPlaceholder ? (
          <img src={mainSrc} alt={productName} className="w-full h-full object-contain p-6" />
        ) : (
          <Image
            src={mainSrc}
            alt={productName}
            width={560}
            height={560}
            className="w-full h-full object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 420px"
            priority
          />
        )}
      </div>

      {/* Thumbnail'ler */}
      {imageList.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {imageList.map((url, i) => {
            const isSelected = mainIndex === i;
            const thumbPlaceholder = url.includes('placeholder') || url.endsWith('.svg');
            return (
              <button
                key={i}
                type="button"
                onClick={() => setMainIndex(i)}
                className={`flex-shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden transition-all ${
                  isSelected
                    ? 'border-[#f97316] ring-2 ring-[#f97316]/30'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                aria-label={`Görsel ${i + 1}`}
              >
                {thumbPlaceholder ? (
                  <img src={url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Image src={url} alt="" width={56} height={56} className="w-full h-full object-cover" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
