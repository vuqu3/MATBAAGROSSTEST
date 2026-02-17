'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type Product = {
  id: string;
  name: string;
  sku: string;
  imageUrl: string | null;
  basePrice: number;
  isActive: boolean;
  isPublished: boolean;
  category: { id: string; name: string; slug: string };
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

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
                  <th className="px-4 py-3 font-medium text-slate-700">Durum</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
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
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.basePrice)}
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
                  </tr>
                ))}
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
