'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Edit, Trash2, AlertTriangle, CheckCircle, MinusCircle } from 'lucide-react';

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

  useEffect(() => {
    setLoading(true);
    fetch(`/api/seller/products?page=${page}&pageSize=10`)
      .then((res) => res.ok ? res.json() : { products: [], total: 0 })
      .then((data) => {
        setProducts(data.products ?? []);
        setTotal(data.total ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page]);

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

      {loading ? (
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
                  
                  return (
                    <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
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
      )}
    </div>
  );
}
