'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCart } from '@/context/CartContext';
import ProductGallery from '@/app/components/product-detail/ProductGallery';
import ProductInfo from '@/app/components/product-detail/ProductInfo';
import ProductActionCard from '@/app/components/product-detail/ProductActionCard';
import RelatedProducts from '@/app/components/product-detail/RelatedProducts';
import type { RelatedProductCard } from '@/app/components/product-detail/RelatedProducts';

type ProductAttributeOption = { label: string; priceImpact: number };
type ProductAttribute = { label: string; options: ProductAttributeOption[] };

type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  images: unknown;
  basePrice: number;
  salePrice: number | null;
  productType: string;
  minOrderQuantity: number | null;
  productionDays?: number | null;
  category: { id?: string; name: string; slug: string };
  attributes?: ProductAttribute[] | null;
  vendorName?: string | null;
  highlights?: Record<string, string> | null;
  descriptionDetail?: { productInfo?: string; extraInfo?: string } | null;
  relatedProducts?: string[] | null;
  dynamicAttributes?: Record<string, string> | null;
  /** API'den gelirse birim fiyat (alt satırda gösterilir) */
  unitPrice?: number | null;
};

export default function ProductDetailClient({
  product,
  relatedProducts = [],
  recommendedProducts = [],
}: {
  product: Product;
  relatedProducts?: RelatedProductCard[];
  recommendedProducts?: RelatedProductCard[];
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selections, setSelections] = useState<Record<string, ProductAttributeOption>>({});
  const [uploading, setUploading] = useState(false);

  const attributes = (product.attributes && Array.isArray(product.attributes) ? product.attributes : []) as ProductAttribute[];
  const vendorName = product.vendorName ?? 'MatbaaGross';

  const basePrice = Number(product.basePrice);
  const salePrice = product.salePrice != null ? Number(product.salePrice) : null;
  const displayBase = salePrice ?? basePrice;
  const optionsTotal = useMemo(
    () => Object.values(selections).reduce((sum, opt) => sum + (opt?.priceImpact ?? 0), 0),
    [selections]
  );
  const unitPrice = displayBase + optionsTotal;
  const totalPrice = unitPrice * quantity;

  const imageList = useMemo(() => {
    const main = product.imageUrl;
    const arr = Array.isArray(product.images) ? (product.images as string[]) : [];
    if (main && !arr.includes(main)) return [main, ...arr];
    if (arr.length) return arr;
    return [main || '/placeholder-product.svg'];
  }, [product.imageUrl, product.images]);
  const mainImageUrl = imageList[0] || '/placeholder-product.svg';

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: mainImageUrl,
      quantity,
      unitPrice,
      totalPrice: unitPrice * quantity,
      options: Object.fromEntries(
        Object.entries(selections).filter(([, opt]) => opt?.label).map(([k, v]) => [k, v!.label])
      ),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSelectionChange = (attrLabel: string, option: ProductAttributeOption) => {
    setSelections((prev) => ({ ...prev, [attrLabel]: option }));
  };

  /** Ürün özellikleri tablosu: dynamicAttributes varsa onu, yoksa highlights kullan */
  const specTable = product.dynamicAttributes && typeof product.dynamicAttributes === 'object'
    ? (product.dynamicAttributes as Record<string, string>)
    : (product.highlights && typeof product.highlights === 'object' ? product.highlights : null);

  const relatedList = useMemo(() => {
    const ids = new Set<string>();
    const out: RelatedProductCard[] = [];
    [...relatedProducts, ...recommendedProducts].forEach((p) => {
      if (p.id !== product.id && !ids.has(p.id)) {
        ids.add(p.id);
        out.push(p);
      }
    });
    return out.slice(0, 12);
  }, [product.id, relatedProducts, recommendedProducts]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow py-6 md:py-8">
        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6">
          {/* Breadcrumb — full width, Header altında */}
          <nav className="w-full py-3 mb-4 text-sm text-gray-600 flex items-center gap-2 flex-wrap" aria-label="Sayfa yolu">
            <Link href="/" className="hover:text-orange-600 transition-colors flex items-center" aria-label="Anasayfa">
              <Home className="w-4 h-4" />
            </Link>
            <span className="text-gray-300 select-none">/</span>
            <Link href="/" className="hover:text-orange-600 transition-colors">
              Tüm Ürünler
            </Link>
            <span className="text-gray-300 select-none">/</span>
            <Link href={`/kategori/${product.category.slug}`} className="hover:text-orange-600 transition-colors">
              {product.category.name}
            </Link>
            <span className="text-gray-300 select-none">/</span>
            <span className="font-medium text-gray-900 truncate max-w-[280px] sm:max-w-[400px]" title={product.name}>
              {product.name}
            </span>
          </nav>

          {/* 3 blok: Gallery | Info | Sticky Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-10">
            {/* Sol: Görsel alanı */}
            <div className="lg:col-span-4">
              <ProductGallery
                productName={product.name}
                imageUrl={product.imageUrl}
                images={product.images}
                minOrderQuantity={product.minOrderQuantity}
                productionDays={product.productionDays}
                productType={product.productType}
              />
            </div>

            {/* Orta: Ürün bilgileri */}
            <div className="lg:col-span-4">
              <ProductInfo
                name={product.name}
                category={product.category}
                vendorName={vendorName}
                highlights={product.highlights ?? null}
                attributes={attributes.length > 0 ? attributes : null}
                description={product.description}
                descriptionDetail={product.descriptionDetail ?? null}
                specTable={specTable}
                selections={selections}
                onSelectionChange={handleSelectionChange}
              />
            </div>

            {/* Sağ: Sticky aksiyon kartı */}
            <div className="lg:col-span-4">
              <ProductActionCard
                unitPrice={unitPrice}
                totalPrice={totalPrice}
                dbUnitPrice={product.unitPrice ?? null}
                quantity={quantity}
                onQuantityChange={setQuantity}
                onAddToCart={handleAddToCart}
                addedToCart={added}
                loading={uploading}
                minOrderQuantity={product.minOrderQuantity}
                canAddToCart={true}
              />
            </div>
          </div>

          {/* İlginizi çekebilecek ürünler */}
          <RelatedProducts
            title="Bunlar da İlginizi Çekebilir"
            products={relatedList}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
