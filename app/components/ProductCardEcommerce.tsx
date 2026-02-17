'use client';

import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';

interface ProductCardEcommerceProps {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  productType?: 'READY' | 'CUSTOM';
  stockQuantity?: number | null;
}

export default function ProductCardEcommerce({
  id,
  name,
  image,
  price,
  originalPrice,
  discount,
  rating = 4.5,
  reviewCount = 0,
  productType,
  stockQuantity,
}: ProductCardEcommerceProps) {
  const isReady = productType === 'READY';
  const router = useRouter();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isReady) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: id,
      name,
      imageUrl: image,
      quantity: 1,
      unitPrice: price,
      totalPrice: price,
      options: {},
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  const handleAddButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isReady) {
      handleQuickAdd(e);
      return;
    }
    router.push(`/urun/${id}`);
  };

  return (
    <div className="bg-white rounded-md border border-gray-200 shadow-sm hover:border-[#FF6000] hover:shadow-md transition-all overflow-hidden group flex flex-col min-h-[280px]">
      <Link href={`/urun/${id}`} className="flex-shrink-0">
        <div className="relative w-full aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-1"
          />
          {discount != null && discount > 0 && (
            <div className="absolute top-1 left-1 bg-red-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold z-10">
              %{discount}
            </div>
          )}
        </div>
      </Link>
      <div className="p-2 flex flex-col flex-grow">
        <Link href={`/urun/${id}`}>
          <h3 className="font-medium text-sm text-[#484848] mb-1 line-clamp-2 hover:text-[#FF6000] transition-colors">
            {name}
          </h3>
        </Link>

        {reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-1">
            <Star className="text-yellow-400 fill-yellow-400" size={12} />
            <span className="text-xs text-gray-600">{rating}</span>
            <span className="text-xs text-gray-400">({reviewCount})</span>
          </div>
        )}

        <div className="mt-auto pt-2 space-y-1">
          <div>
            {originalPrice != null && originalPrice > price ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-500 line-through">
                  {originalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                </span>
                <span className="text-sm font-semibold text-[#FF6000]">
                  {price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                </span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-[#484848]">
                {price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
              </span>
            )}
          </div>
          {productType != null && (
            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded ${
              isReady ? 'bg-gray-100 text-gray-600' : 'bg-[#0f766e]/10 text-[#0f766e]'
            }`}>
              {isReady ? 'Hazır Stok' : 'Firmanıza Özel Baskılı'}
            </span>
          )}
          <button
            type="button"
            onClick={handleAddButtonClick}
            className={`w-full font-medium py-1.5 px-3 rounded-md text-sm transition-colors flex items-center justify-center gap-1.5 ${
              added
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-[#FF6000] hover:bg-[#e55a00] text-white'
            }`}
          >
            <ShoppingCart size={14} />
            {added ? 'Eklendi!' : 'Sepete Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
}
