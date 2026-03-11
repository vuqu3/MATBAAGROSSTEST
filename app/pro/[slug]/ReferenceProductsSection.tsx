'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BadgeCheck, FileText, X } from 'lucide-react';

export type ReferenceProductItem = {
  id: string;
  vendorId: string;
  title: string;
  imageUrl: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export default function ReferenceProductsSection({
  vendorId,
  vendorSlug,
  items,
}: {
  vendorId: string;
  vendorSlug: string;
  items: ReferenceProductItem[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const selected = useMemo(() => items.find((x) => x.id === openId) || null, [items, openId]);

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-base font-extrabold text-gray-900">Referans Ürünler / Üretim Kataloğu</h2>
        <p className="text-sm text-gray-600 mt-3">Bu üretici henüz teknik referans ürün eklemedi.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Referans Ürünler / Üretim Kataloğu</h2>
            <p className="text-sm text-gray-600 mt-1">Teknik detayları görmek için kartı açın.</p>
          </div>
          <Link
            href={`/premium?preferredVendorId=${encodeURIComponent(vendorId)}`}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[#FF6000] px-4 py-2.5 text-white font-extrabold hover:bg-[#e55a00] transition-colors"
          >
            Bu üreticiden teklif iste
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpenId(item.id)}
                className="text-left rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[4/3] bg-gray-100">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-extrabold text-gray-900 line-clamp-2">{item.title}</p>
                    <BadgeCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.description || 'Detay eklenmedi'}</p>

                  <div className="mt-4">
                    <span className="inline-flex items-center gap-2 text-xs font-extrabold text-[#FF6000]">
                      <FileText className="h-4 w-4" />
                      Detayı Aç
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/55" onClick={() => setOpenId(null)} />
          <div className="absolute inset-0 flex items-end sm:items-center justify-center p-4">
            <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-gray-100 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-lg sm:text-xl font-extrabold text-gray-900">{selected.title}</p>
                  <p className="text-sm text-gray-600 mt-1">Ürün detayı</p>
                </div>
                <button type="button" onClick={() => setOpenId(null)} className="rounded-xl p-2 hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-700" />
                </button>
              </div>

              <div className="p-5 sm:p-6">
                {selected.imageUrl ? (
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                    <Image src={selected.imageUrl} alt={selected.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 768px" />
                  </div>
                ) : null}

                <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.description || 'Detay eklenmedi.'}</p>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <Link
                    href={`/premium?preferredVendorId=${encodeURIComponent(vendorId)}&productName=${encodeURIComponent(selected.title)}&referenceProductId=${encodeURIComponent(selected.id)}&vendorSlug=${encodeURIComponent(vendorSlug)}`}
                    className="inline-flex items-center justify-center rounded-2xl bg-[#FF6000] px-5 py-3 text-white font-extrabold hover:bg-[#e55a00] transition-colors"
                  >
                    Bu Ürünün Benzerinden Teklif İste
                  </Link>

                  <button
                    type="button"
                    onClick={() => setOpenId(null)}
                    className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-3 text-gray-900 font-extrabold hover:bg-gray-50"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
