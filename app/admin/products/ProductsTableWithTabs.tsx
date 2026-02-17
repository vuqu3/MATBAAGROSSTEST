'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Edit, Plus, AlertTriangle, CheckCircle, MinusCircle, Check, X } from 'lucide-react';
import DeleteButton from './DeleteButton';

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ProductStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type ProductWithCategory = {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  imageUrl: string | null;
  images: unknown;
  supplier: string | null;
  vendorName: string | null;
  status?: ProductStatus | null;
  buyPrice: number | null;
  purchasePrice: number | null;
  basePrice: number;
  salePrice: number | null;
  stock: number;
  stockQuantity: number | null;
  isPublished: boolean;
  isActive: boolean;
  category: Category;
};

type Props = {
  products: ProductWithCategory[];
  categories: Category[];
};

function getStokDurumu(product: ProductWithCategory): { label: string; className: string; icon: React.ReactNode } {
  const stok = product.stock ?? product.stockQuantity ?? 0;
  if (stok <= 0) {
    return {
      label: 'Stok yok',
      className: 'bg-red-100 text-red-800',
      icon: <MinusCircle size={14} className="flex-shrink-0" />,
    };
  }
  if (stok < 10) {
    return {
      label: 'Kritik',
      className: 'bg-amber-100 text-amber-800',
      icon: <AlertTriangle size={14} className="flex-shrink-0" />,
    };
  }
  return {
    label: 'Yeterli',
    className: 'bg-green-100 text-green-800',
    icon: <CheckCircle size={14} className="flex-shrink-0" />,
  };
}

export default function ProductsTableWithTabs({ products, categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');

  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'REJECTED'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string | null>(() => {
    if (!categorySlug) return null;
    const cat = categories.find((c) => c.slug === categorySlug);
    return cat?.id ?? null;
  });

  useEffect(() => {
    if (!categorySlug) {
      setActiveTab(null);
      return;
    }
    const cat = categories.find((c) => c.slug === categorySlug);
    setActiveTab(cat?.id ?? null);
  }, [categorySlug, categories]);

  const pendingCount = useMemo(() => products.filter((p) => p.status === 'PENDING').length, [products]);
  const rejectedCount = useMemo(() => products.filter((p) => p.status === 'REJECTED').length, [products]);

  const filteredByStatus = useMemo(() => {
    if (statusFilter === 'all') return products;
    return products.filter((p) => p.status === statusFilter);
  }, [products, statusFilter]);

  const filteredProducts = useMemo(() => {
    if (!activeTab) return filteredByStatus;
    return filteredByStatus.filter((p) => p.category.id === activeTab);
  }, [filteredByStatus, activeTab]);

  const setTab = (categoryId: string | null) => {
    setActiveTab(categoryId);
    const slug = categoryId ? categories.find((c) => c.id === categoryId)?.slug : null;
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set('category', slug);
    else url.searchParams.delete('category');
    window.history.replaceState({}, '', url.pathname + url.search);
  };

  const setProductStatus = async (productId: string, status: 'APPROVED' | 'REJECTED') => {
    setActionLoading(productId);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Ürünler</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus size={18} />
          Yeni Ürün Ekle
        </Link>
      </div>

      {/* Onay Yönetimi sekmeleri */}
      <div className="border-b border-gray-200 mb-3">
        <nav className="flex flex-wrap gap-1" aria-label="Onay durumu">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              statusFilter === 'all'
                ? 'border-[#1e3a8a] text-[#1e3a8a] bg-slate-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Tüm Ürünler
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors flex items-center gap-1.5 ${
              statusFilter === 'PENDING'
                ? 'border-amber-500 text-amber-700 bg-amber-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Onay Bekleyenler
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-amber-200 text-amber-900 text-xs font-semibold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors flex items-center gap-1.5 ${
              statusFilter === 'REJECTED'
                ? 'border-red-500 text-red-700 bg-red-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Reddedilenler
            {rejectedCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-200 text-red-900 text-xs font-semibold">
                {rejectedCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Kategori sekmeleri */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex flex-wrap gap-1" aria-label="Kategori filtreleri">
          <button
            type="button"
            onClick={() => setTab(null)}
            className={`px-3 py-2 text-xs font-medium rounded-t border-b-2 transition-colors ${
              activeTab === null
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Tüm kategoriler
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setTab(cat.id)}
              className={`px-3 py-2 text-xs font-medium rounded-t border-b-2 transition-colors ${
                activeTab === cat.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tablo veya boş durum */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab ? 'Bu kategoride henüz ürün yok' : 'Henüz ürün eklenmemiş'}
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              {activeTab
                ? 'Bu kategoriye ürün eklemek için "Yeni Ürün Ekle" ile ürün oluşturup kategori seçebilirsiniz.'
                : 'İlk ürününüzü eklemek için "Yeni Ürün Ekle" butonuna tıklayın.'}
            </p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus size={18} />
              Yeni Ürün Ekle
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resim
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İsim
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satıcı / Tedarikçi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alış
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satış
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok Durumu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const imgArr = Array.isArray(product.images) ? product.images : null;
                  const imageUrl =
                    product.imageUrl ||
                    (imgArr?.length ? (imgArr as string[])[0] : null) ||
                    '/placeholder-product.svg';
                  const price = product.salePrice ?? product.basePrice;
                  const stokDurumu = getStokDurumu(product);
                  const isPending = product.status === 'PENDING';
                  const isRejected = product.status === 'REJECTED';

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50 ${isPending ? 'bg-amber-50/70' : ''} ${isRejected ? 'bg-red-50/30' : ''}`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        {product.description && (
                          <div className="text-xs text-gray-500 line-clamp-1">{product.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-mono">
                        {product.sku}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {product.vendorName || product.supplier || '—'}
                        </span>
                        {product.supplier && product.vendorName && product.supplier !== product.vendorName && (
                          <span className="block text-xs text-gray-500">{product.supplier}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {product.buyPrice != null
                          ? `${Number(product.buyPrice).toLocaleString('tr-TR')} TL`
                          : product.purchasePrice != null
                            ? `${Number(product.purchasePrice).toLocaleString('tr-TR')} TL`
                            : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {Number(price).toLocaleString('tr-TR')} TL
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {product.stock ?? product.stockQuantity ?? 0} adet
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${stokDurumu.className}`}
                        >
                          {stokDurumu.icon}
                          {stokDurumu.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1 items-center">
                          {isPending && (
                            <span className="px-2 py-0.5 text-xs rounded font-medium bg-amber-200 text-amber-900">
                              Onay Bekliyor
                            </span>
                          )}
                          {product.status === 'REJECTED' && (
                            <span className="px-2 py-0.5 text-xs rounded font-medium bg-red-100 text-red-800">
                              Reddedildi
                            </span>
                          )}
                          {product.status === 'APPROVED' && (
                            <span className="px-2 py-0.5 text-xs rounded font-medium bg-green-100 text-green-800">
                              Onaylandı
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 text-xs rounded ${
                              product.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {product.isPublished ? 'Yayında' : 'Taslak'}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded ${
                              product.isActive ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                disabled={actionLoading === product.id}
                                onClick={() => setProductStatus(product.id, 'APPROVED')}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 text-xs"
                              >
                                <Check size={14} />
                                Onayla
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading === product.id}
                                onClick={() => setProductStatus(product.id, 'REJECTED')}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 text-xs"
                              >
                                <X size={14} />
                                Reddet
                              </button>
                            </>
                          )}
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          >
                            <Edit size={14} />
                            Düzenle
                          </Link>
                          <DeleteButton productId={product.id} productName={product.name} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
