'use client';

import Link from 'next/link';
import { ShoppingCart, Check, Truck, RotateCcw, ShieldCheck, Crown } from 'lucide-react';

interface ProductActionCardProps {
  /** Gösterilecek satış fiyatı (birim, seçenekler dahil) */
  unitPrice: number;
  /** Toplam fiyat (unitPrice * quantity) */
  totalPrice: number;
  /** Veritabanından gelen birim fiyat (varsa ana fiyatın altında gri yazılır) */
  dbUnitPrice?: number | null;
  quantity: number;
  onQuantityChange: (value: number) => void;
  onAddToCart: () => void;
  addedToCart: boolean;
  loading?: boolean;
  minOrderQuantity?: number | null;
  /** Sepete ekleme için gerekli seçimler yapıldı mı (örn. varyant zorunlu) */
  canAddToCart?: boolean;
}

export default function ProductActionCard({
  unitPrice,
  totalPrice,
  dbUnitPrice,
  quantity,
  onQuantityChange,
  onAddToCart,
  addedToCart,
  loading = false,
  minOrderQuantity,
  canAddToCart = true,
}: ProductActionCardProps) {
  const minQty = minOrderQuantity ?? 1;

  return (
    <div className="lg:sticky lg:top-24 self-start w-full max-w-[380px] bg-white border border-gray-200 rounded-2xl shadow-xl p-4">
      {/* 1. Fiyat alanı — kompakt, yeşil ve okunaklı */}
      <div>
        <p className="text-3xl font-bold text-[#16a34a] tracking-tight">
          {unitPrice.toLocaleString('tr-TR')} <span className="text-xl font-semibold">TL</span>
        </p>
        <p className="text-xs text-gray-500 mt-0.5">KDV Dahil</p>
        {dbUnitPrice != null && (
          <p className="text-xs text-gray-500 mt-0.5">
            (Birim Fiyat: {dbUnitPrice.toLocaleString('tr-TR')} TL)
          </p>
        )}
      </div>

      {/* Ayırıcı */}
      <div className="border-t border-gray-200 my-3" />

      {/* 2. Adet + Toplam — yan yana, kompakt */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Adet</label>
          <input
            type="number"
            min={minQty}
            value={quantity}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!Number.isNaN(v)) onQuantityChange(Math.max(minQty, v));
            }}
            className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316] text-sm"
          />
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Toplam</p>
          <p className="text-lg font-bold text-[#16a34a]">{totalPrice.toLocaleString('tr-TR')} TL</p>
        </div>
      </div>
      {minOrderQuantity != null && minOrderQuantity > 1 && (
        <p className="text-xs text-gray-500 mt-1">Min. sipariş: {minOrderQuantity} adet</p>
      )}

      {/* 3. Sepete Ekle butonu — ince ve zarif */}
      <div className="mt-4">
        <button
          type="button"
          onClick={onAddToCart}
          disabled={loading || !canAddToCart}
          className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            'Yükleniyor...'
          ) : addedToCart ? (
            <>
              <Check className="h-4 w-4" />
              Sepete Eklendi
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              SEPETE EKLE
            </>
          )}
        </button>
      </div>

      {/* 4. Güven rozetleri — kompakt */}
      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
          <Truck className="h-3 w-3 flex-shrink-0" />
          <span>Tahmini teslimat: 3-5 iş günü</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
          <RotateCcw className="h-3 w-3 flex-shrink-0" />
          <span>Kolay iade ve değişim</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
          <ShieldCheck className="h-3 w-3 flex-shrink-0" />
          <span>Güvenli ödeme</span>
        </div>
      </div>

      {/* 5. Premium teaser — ghost style, sepete ekle altında alternatif seçenek */}
      <Link
        href="/premium"
        className="mt-4 flex items-center gap-3 rounded-lg border border-dashed border-amber-400 bg-amber-50/50 p-3 transition-opacity hover:opacity-90"
      >
        <Crown className="h-4 w-4 flex-shrink-0 text-amber-500" />
        <span className="text-sm font-medium text-gray-700 flex-1">
          Bu ürüne logonuzu mu basmak istiyorsunuz?
        </span>
        <span className="text-sm font-bold text-amber-600 whitespace-nowrap">
          Teklif Al →
        </span>
      </Link>
    </div>
  );
}
