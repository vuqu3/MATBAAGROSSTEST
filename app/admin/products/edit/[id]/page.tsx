'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductEditForm from './ProductEditForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

type Product = {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  imageUrl: string | null;
  categoryId: string;
  basePrice: number;
  buyPrice: number | null;
  salePrice: number | null;
  taxRate: number;
  supplier: string | null;
  stock: number;
  stockQuantity: number | null;
  minOrderQuantity: number | null;
  productionDays: number | null;
  productType: string;
  isPublished: boolean;
  isActive: boolean;
  attributes?: { label: string; options: { label: string; priceImpact: number }[] }[] | null;
  vendorName?: string | null;
  images?: string[] | null;
  highlights?: Record<string, string> | null;
  descriptionDetail?: { productInfo?: string; extraInfo?: string } | null;
  relatedProducts?: string[] | null;
};

export default function EditProductPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data: Product | null) => {
        if (cancelled) return;
        if (data == null) {
          setNotFound(true);
          setProduct(null);
        } else {
          setProduct(data);
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
  }, [id]);

  if (loading) {
    return (
      <div className="py-8">
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="py-8">
        <p className="text-xl font-semibold text-gray-900 mb-4">Ürün bulunamadı</p>
        <Link href="/admin/products" className="text-[#FF6000] hover:underline">
          Ürün listesine dön
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Ürünü Düzenle</h1>
      <p className="text-gray-600 mb-8">{product.name}</p>
      <ProductEditForm product={product} />
    </div>
  );
}
