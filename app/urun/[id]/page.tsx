'use client';

import { use, useEffect, useState } from 'react';
import ProductDetailClient from './ProductDetailClient';
// Design Studio paused – uncomment to re-enable custom design flow:
// import ProductStudioClient from './ProductStudioClient';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface PageProps {
  params: Promise<{ id: string }>;
}

// const CUSTOM_PRINT_SURCHARGE = 50;

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
  category: { id: string; name: string; slug: string };
  attributes?: { label: string; options: { label: string; priceImpact: number }[] }[] | null;
  vendorName?: string | null;
  highlights?: Record<string, string> | null;
  descriptionDetail?: { productInfo?: string; extraInfo?: string } | null;
  relatedProducts?: string[] | null;
  isCustomizable?: boolean;
};

type ProductCard = {
  id: string;
  name: string;
  imageUrl: string | null;
  images: unknown;
  basePrice: number;
  salePrice: number | null;
  category: { slug: string };
};

export default function ProductPage({ params }: PageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductCard[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  // Design Studio paused – uncomment to re-enable:
  // const [isDesigning, setIsDesigning] = useState(false);
  // const isCustomizable = product != null && (product.productType === 'CUSTOM' || product.isCustomizable === true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setRelatedProducts([]);
    setRecommendedProducts([]);

    fetch(`/api/products/${id}`)
      .then((res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(async (data: Product | null) => {
        if (cancelled) return;
        if (data == null) {
          setNotFound(true);
          setProduct(null);
          return;
        }
        setProduct(data);

        const relatedIds = (data.relatedProducts && Array.isArray(data.relatedProducts) ? data.relatedProducts : []).filter((rid: string) => rid !== data.id);
        if (relatedIds.length > 0) {
          const resRelated = await fetch(`/api/products?ids=${relatedIds.join(',')}`);
          if (resRelated.ok) {
            const related = await resRelated.json();
            if (!cancelled) setRelatedProducts(Array.isArray(related) ? related : []);
          }
        }

        const resRec = await fetch('/api/products');
        if (resRec.ok) {
          const all = await resRec.json();
          const rec = (Array.isArray(all) ? all : []).filter((p: { id: string }) => p.id !== data.id).slice(0, 12);
          if (!cancelled) setRecommendedProducts(rec);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center py-16">
          <p className="text-gray-600">Yükleniyor...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center py-16">
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-900 mb-4">Ürün bulunamadı</p>
            <a href="/" className="text-[#FF6000] hover:underline">
              Ana Sayfaya Dön
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Design Studio paused – always show standard product page for high conversion speed.
  // if (isDesigning && isCustomizable) {
  //   return <ProductStudioClient ... />;
  // }

  return (
    <ProductDetailClient
      product={{
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        images: product.images,
        basePrice: Number(product.basePrice),
        salePrice: product.salePrice != null ? Number(product.salePrice) : null,
        productType: product.productType,
        minOrderQuantity: product.minOrderQuantity,
        productionDays: (product as { productionDays?: number | null }).productionDays ?? null,
        category: product.category,
        attributes: product.attributes ?? null,
        vendorName: product.vendorName ?? null,
        highlights: product.highlights ?? null,
        descriptionDetail: product.descriptionDetail ?? null,
        relatedProducts: product.relatedProducts ?? null,
        dynamicAttributes: (product as { dynamicAttributes?: Record<string, string> | null }).dynamicAttributes ?? null,
      }}
      relatedProducts={relatedProducts}
      recommendedProducts={recommendedProducts}
      // Design Studio paused – no design toggle; add-to-cart works immediately:
      // onEnterDesignStudio={isCustomizable ? () => setIsDesigning(true) : undefined}
      // customPrintSurcharge={isCustomizable ? CUSTOM_PRINT_SURCHARGE : undefined}
    />
  );
}
