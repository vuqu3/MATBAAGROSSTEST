'use client';

import { use, useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ShoppingCart } from 'lucide-react';
import { useCart } from '../../../context/CartContext';

interface PageProps {
  params: Promise<{ slug: string }>;
}

type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  images: unknown;
  basePrice: number;
  salePrice: number | null;
  productType: string;
  stockQuantity: number | null;
};

type CategoryData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  products: Product[];
};

export default function CategoryPage({ params }: PageProps) {
  const { slug } = use(params);
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { addItem } = useCart();
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    fetch(`/api/categories/${slug}`)
      .then((res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data: CategoryData | null) => {
        if (cancelled) return;
        if (data == null) {
          setNotFound(true);
          setCategory(null);
        } else {
          setCategory(data);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleAddToCart = (
    e: React.MouseEvent,
    product: Product,
    imageUrl: string,
    unitPrice: number,
    isReady: boolean
  ) => {
    if (!isReady) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      name: product.name,
      imageUrl,
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice,
      options: {},
    });

    setAddedProductId(product.id);
    window.setTimeout(() => setAddedProductId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4 text-center text-gray-600">
            Yükleniyor...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !category) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center py-16">
          <div className="container mx-auto px-4 text-center">
            <Package className="mx-auto text-gray-400 mb-6" size={80} />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Kategori Bulunamadı</h1>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Aradığınız kategori mevcut değil veya kaldırılmış olabilir.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-3 bg-[#FF6000] text-white rounded-lg hover:bg-[#e55a00] transition-colors"
              >
                Ana Sayfaya Dön
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Tüm Kategoriler
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const products = category.products || [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <nav className="mb-2 text-xs text-gray-500" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5">
              <li><Link href="/" className="hover:text-[#FF6000] transition-colors">Ana Sayfa</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/kategori" className="hover:text-[#FF6000] transition-colors">Kategoriler</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-700 truncate max-w-[200px] sm:max-w-none">{category.name}</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <h1 className="text-lg font-medium text-gray-900 sm:text-xl">{category.name}</h1>
            <p className="text-xs text-gray-500">{products.length} ürün bulundu</p>
          </div>
          {category.description && (
            <p className="text-sm text-gray-600 mb-4">{category.description}</p>
          )}

          {products.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <Package className="mx-auto text-gray-400 mb-4" size={64} />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Bu kategoride henüz ürün bulunmuyor
              </h2>
              <p className="text-gray-600 mb-6">
                Yakında bu kategoride ürünler eklenecektir.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6000] text-white rounded-lg hover:bg-[#e55a00] transition-colors"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((product) => {
                const imgArr = Array.isArray(product.images) ? product.images : null;
                const imageUrl = product.imageUrl || (imgArr?.length ? (imgArr as string[])[0] : null) || '/placeholder-product.svg';
                const price = product.salePrice ?? product.basePrice;
                const originalPrice = product.salePrice != null && product.basePrice > product.salePrice
                  ? product.basePrice
                  : null;
                const discount = originalPrice != null && product.salePrice != null
                  ? Math.round(((originalPrice - product.salePrice) / originalPrice) * 100)
                  : 0;
                const isReady = product.productType === 'READY';
                const isAdded = addedProductId === product.id;

                return (
                  <Link
                    key={product.id}
                    href={`/urun/${product.id}`}
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:border-[#FF6000] hover:shadow-md transition-all group flex flex-col min-h-[320px]"
                  >
                    <div className="relative w-full aspect-square bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      {discount > 0 && (
                        <div className="absolute top-1 right-1 bg-red-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                          %{discount}
                        </div>
                      )}
                    </div>

                    <h3 className="font-medium text-sm text-gray-900 mt-2 line-clamp-2 flex-shrink-0">
                      {product.name}
                    </h3>

                    <div className="mt-auto pt-2 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[#FF6000]">
                          {Number(price).toLocaleString('tr-TR')} TL
                        </span>
                        {originalPrice != null && (
                          <span className="text-xs text-gray-500 line-through">
                            {Number(originalPrice).toLocaleString('tr-TR')} TL
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isReady
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-[#0f766e]/10 text-[#0f766e]'
                        }`}>
                          {isReady ? 'Hazır Stok' : 'Firmanıza Özel Baskılı'}
                        </span>
                      </div>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => handleAddToCart(e, product, imageUrl, Number(price), isReady)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            if (!isReady) return;
                            e.preventDefault();
                            handleAddToCart(e as unknown as React.MouseEvent, product, imageUrl, Number(price), isReady);
                          }
                        }}
                        className={`w-full font-medium py-1.5 px-3 rounded-md text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                          isAdded
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-[#FF6000] hover:bg-[#e55a00] text-white'
                        }`}
                      >
                        <ShoppingCart size={14} />
                        {isAdded ? 'Eklendi!' : 'Sepete Ekle'}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
