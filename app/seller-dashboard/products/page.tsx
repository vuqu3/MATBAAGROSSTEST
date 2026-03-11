'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Edit, Trash2, AlertTriangle, CheckCircle, MinusCircle, ChevronDown, ChevronRight } from 'lucide-react';

type SellerMeVendor = {
  id: string;
  isBlocked: boolean;
  canAddRetailProducts: boolean;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  imageUrl: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  isActive: boolean;
  isPublished: boolean;
  stock: number | null;
  stockQuantity: number | null;
  category: { id: string; name: string; slug: string };
  variants?: {
    id: string;
    name: string;
    price: number;
    stock: number;
    sku?: string | null;
  }[];
};

function getStokDurumu(product: Product): { label: string; className: string; icon: React.ReactNode } {
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

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [vendorLoading, setVendorLoading] = useState(true);
  const [vendor, setVendor] = useState<SellerMeVendor | null>(null);
  const [vendorError, setVendorError] = useState<string | null>(null);

  useEffect(() => {
    setVendorLoading(true);
    setVendorError(null);
    fetch('/api/seller/me')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setVendor((data?.vendor ?? null) as SellerMeVendor | null);
      })
      .catch(() => setVendorError('Yetkileriniz doğrulanamadı. Lütfen tekrar deneyin.'))
      .finally(() => setVendorLoading(false));
  }, []);

  useEffect(() => {
    if (vendorLoading) return;
    if (!vendor || vendorError) {
      setLoading(false);
      setProducts([]);
      setTotal(0);
      return;
    }
    if (vendor.isBlocked || !vendor.canAddRetailProducts) {
      setLoading(false);
      setProducts([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    fetch(`/api/seller/products?page=${page}&pageSize=10`)
      .then((res) => res.ok ? res.json() : { products: [], total: 0 })
      .then((data) => {
        setProducts(data.products ?? []);
        setTotal(data.total ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, vendorLoading, vendor, vendorError]);

  const toggleRowExpansion = (productId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setDeleting(productId);
    try {
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        alert(error.error || 'Ürün silinirken bir hata oluştu.');
        return;
      }

      // Listeyi güncelle
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch {
      alert('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Ürünlerim</h1>

      {vendorLoading ? (
        <div className="text-slate-500 py-8">Yükleniyor...</div>
      ) : vendorError || !vendor ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {vendorError ?? 'Yetkileriniz doğrulanamadı.'}
        </div>
      ) : vendor.isBlocked ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-full max-w-3xl rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Hesabınız Engellendi</h2>
            <p className="mt-2 text-gray-700 leading-relaxed">
              Satıcı hesabınız şu anda kısıtlı durumdadır. Detaylı bilgi için lütfen destek ekibimizle iletişime geçiniz.
            </p>
          </div>
        </div>
      ) : !vendor.canAddRetailProducts ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-full max-w-3xl rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Perakende Ürün Modülü Kapalı</h2>
            <p className="mt-2 text-gray-700 leading-relaxed">
              Matbaagross Premium Üretici modeline geçiş sürecindeyiz. Mevcut yetkilerinizle sadece Premium Havuzdaki taleplere teklif verebilirsiniz. Sisteme perakende ürün yüklemek ve Türkiye geneline satış yapmak için lütfen destek@matbaagross.com adresi üzerinden ekibimizle iletişime geçiniz.
            </p>
          </div>
        </div>
      ) : (
      loading ? (
        <div className="text-slate-500 py-8">Yükleniyor...</div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Henüz ürün bulunmuyor. Ürünleriniz burada listelenecektir.
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-700 w-8"></th>
                  <th className="px-4 py-3 font-medium text-slate-700">Ürün</th>
                  <th className="px-4 py-3 font-medium text-slate-700">SKU</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Kategori</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Fiyat</th>
                  <th className="px-4 py-3 font-medium text-slate-700">STOK</th>
                  <th className="px-4 py-3 font-medium text-slate-700">STOK DURUMU</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Durum</th>
                  <th className="px-4 py-3 font-medium text-slate-700">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const stokDurumu = getStokDurumu(p);
                  const stokMiktarı = p.stock ?? p.stockQuantity ?? 0;
                  
                  const hasVariants = p.variants && p.variants.length > 0;
                  const isExpanded = expandedRows.has(p.id);
                  
                  return (
                    <>
                      <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          {hasVariants && (
                            <button
                              type="button"
                              onClick={() => toggleRowExpansion(p.id)}
                              className="flex items-center justify-center w-6 h-6 rounded hover:bg-slate-100 transition-colors"
                              title="Varyasyonları göster/gizle"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                              )}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-slate-100">
                              {p.imageUrl ? (
                                <Image src={p.imageUrl} alt="" fill className="object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">—</div>
                              )}
                            </div>
                            <span className="font-medium text-slate-800">{p.name}</span>
                          </div>
                        </td>
                      <td className="px-4 py-3 text-slate-600">{p.sku}</td>
                      <td className="px-4 py-3 text-slate-600">{p.category.name}</td>
                      <td className="px-4 py-3">
                        {p.compareAtPrice && p.compareAtPrice > p.basePrice ? (
                          <div>
                            <span className="text-xs text-gray-500 line-through">
                              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.compareAtPrice)}
                            </span>
                            <div className="text-sm font-medium text-green-600">
                              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.basePrice)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm font-medium">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.basePrice)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {stokMiktarı} adet
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${stokDurumu.className}`}
                        >
                          {stokDurumu.icon}
                          {stokDurumu.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.isPublished && p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.isPublished && p.isActive ? 'Yayında' : 'Yayında değil'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/seller-dashboard/products/${p.id}`}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4 text-slate-600" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            disabled={deleting === p.id}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-red-300 bg-white hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                      </tr>
                      
                      {/* Varyasyonlar Satırı */}
                      {hasVariants && isExpanded && (
                        <tr className="bg-slate-50/30">
                          <td colSpan={9} className="px-4 py-0">
                            <div className="py-4">
                              <div className="text-xs font-medium text-slate-500 mb-3">Varyasyonlar ({p.variants!.length})</div>
                              <div className="space-y-2">
                                {p.variants!.map((variant) => {
                                  const variantStockStatus = getStokDurumu({ ...p, stock: variant.stock, stockQuantity: variant.stock } as Product);
                                  return (
                                    <div key={variant.id} className="flex items-center gap-4 p-3 bg-white rounded-lg border border-slate-200">
                                      <div className="flex-1">
                                        <div className="font-medium text-sm text-slate-800">{variant.name}</div>
                                        <div className="text-xs text-slate-500 mt-1">
                                          SKU: {variant.sku || `${p.sku}-${variant.name.toLowerCase().replace(/\s+/g, '-')}`}
                                        </div>
                                      </div>
                                      <div className="text-right min-w-[100px]">
                                        <div className="text-sm font-medium text-green-600">
                                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(variant.price)}
                                        </div>
                                      </div>
                                      <div className="text-center min-w-[80px]">
                                        <div className="text-sm font-medium text-slate-700">{variant.stock} adet</div>
                                      </div>
                                      <div className="min-w-[100px]">
                                        <span
                                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${variantStockStatus.className}`}
                                        >
                                          {variantStockStatus.icon}
                                          {variantStockStatus.label}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
          {total > 10 && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>
                Toplam {total} ürün • Sayfa {page} / {Math.ceil(total / 10)}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded border border-slate-300 px-3 py-1.5 disabled:opacity-50"
                >
                  Önceki
                </button>
                <button
                  type="button"
                  disabled={page >= Math.ceil(total / 10)}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded border border-slate-300 px-3 py-1.5 disabled:opacity-50"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </>
      ))}
    </div>
  );
}
