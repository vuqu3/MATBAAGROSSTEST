import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { Package } from 'lucide-react';

interface Props {
  params: { slug: string };
}

async function getVendorBySlug(slug: string) {
  return prisma.vendor.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isPublished: true, isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 24,
      },
    },
  });
}

export async function generateMetadata({ params }: Props) {
  const vendor = await getVendorBySlug(params.slug);
  if (!vendor) return { title: 'Mağaza Bulunamadı' };
  return {
    title: `${vendor.name} | MatbaaGross`,
    description: `${vendor.name} mağazasının ürünlerini keşfedin.`,
  };
}

export default async function MagazaPage({ params }: Props) {
  const vendor = await getVendorBySlug(params.slug);

  if (!vendor) notFound();

  const products = vendor.products ?? [];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Mağaza Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Logo placeholder (harf avatarı) */}
            <div className="w-24 h-24 rounded-2xl bg-[#FF6000]/10 border border-[#FF6000]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-[#FF6000]">
                {vendor.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Bilgiler */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
              <p className="text-gray-500 text-sm mt-1">MatbaaGross Onaylı Satıcı</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
                {/* Ürün sayısı */}
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Package className="w-4 h-4" />
                  <span>{products.length} ürün</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ürün Listesi */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">
          {vendor.name} Ürünleri
        </h2>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">Bu mağazada henüz ürün bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => {
              const base = Number(product.basePrice);
              const sale = product.salePrice != null ? Number(product.salePrice) : null;
              const compareAt = product.compareAtPrice != null ? Number(product.compareAtPrice) : null;
              const price = sale ?? base;
              // compareAtPrice > price ise indirim var (satıcı/admin piyasa fiyatı)
              const originalPrice = compareAt != null && compareAt > price
                ? compareAt
                : (sale != null && base > sale ? base : undefined);
              const discount = originalPrice
                ? Math.round((1 - price / originalPrice) * 100)
                : undefined;
              const imageUrl =
                product.imageUrl ||
                (Array.isArray(product.images) && product.images.length
                  ? (product.images as string[])[0]
                  : null) ||
                '/placeholder-product.svg';

              return (
                <Link
                  key={product.id}
                  href={`/urun/${product.id}`}
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-[#FF6000]/30 transition-all overflow-hidden group"
                >
                  <div className="relative aspect-square bg-gray-50">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                    {discount && (
                      <span className="absolute top-2 left-2 bg-[#FF6000] text-white text-xs font-bold px-1.5 py-0.5 rounded">
                        -{discount}%
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-700 line-clamp-2 font-medium leading-snug">
                      {product.name}
                    </p>
                    <div className="mt-2">
                      <span className="text-[#FF6000] font-bold text-sm">
                        {price.toLocaleString('tr-TR')} TL
                      </span>
                      {originalPrice && (
                        <span className="ml-1.5 text-xs text-gray-400 line-through">
                          {originalPrice.toLocaleString('tr-TR')} TL
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
