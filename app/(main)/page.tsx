import HeroSection from '../components/home/HeroSection';
import ProductCarousel from '../components/ProductCarousel';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { HomepageSectionType } from '@prisma/client';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getPublishedProducts(limit: number) {
  const products = await prisma.product.findMany({
    where: { isPublished: true, isActive: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      imageUrl: true,
      images: true,
      basePrice: true,
      salePrice: true,
      compareAtPrice: true,
      productType: true,
      stock: true,
      stockQuantity: true,
      category: { select: { slug: true, parent: { select: { slug: true } } } },
    },
  });
  return products.map((p) => {
    const base = Number(p.basePrice);
    const sale = p.salePrice != null ? Number(p.salePrice) : null;
    const compareAt = p.compareAtPrice != null ? Number(p.compareAtPrice) : null;
    const price = sale ?? base;
    // compareAtPrice > price ise indirim var (satıcı/admin piyasa fiyatı)
    const originalPrice = compareAt != null && compareAt > price
      ? compareAt
      : (sale != null && base > sale ? base : undefined);
    const discount = originalPrice != null && originalPrice > 0
      ? Math.round((1 - price / originalPrice) * 100)
      : undefined;
    const imageUrl = p.imageUrl
      || (Array.isArray(p.images) && p.images?.length ? (p.images as string[])[0] : null)
      || '/placeholder-product.svg';
    return {
      id: p.id,
      name: p.name,
      image: imageUrl,
      price,
      originalPrice,
      compareAtPrice: compareAt ?? undefined,
      discount,
      rating: 4.5,
      reviewCount: 0,
      productType: p.productType ?? undefined,
      stock: p.stock ?? undefined,
      stockQuantity: p.stockQuantity ?? undefined,
      categorySlug: (p.category?.slug === 'markaniza-ozel-uretim' || p.category?.parent?.slug === 'markaniza-ozel-uretim')
        ? 'markaniza-ozel-uretim'
        : (p.category?.slug ?? undefined),
    };
  });
}

async function getProductsForCarousel(metadata: unknown) {
  const md = (metadata ?? {}) as { source?: 'LATEST' | 'CATEGORY' | 'MANUAL'; limit?: number; categoryId?: string; productIds?: string[] };
  const limit = Math.min(50, Math.max(1, Number(md.limit) || 10));

  if (md.source === 'CATEGORY' && md.categoryId) {
    const products = await prisma.product.findMany({
      where: { isPublished: true, isActive: true, categoryId: md.categoryId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        imageUrl: true,
        images: true,
        basePrice: true,
        salePrice: true,
        compareAtPrice: true,
        productType: true,
        stock: true,
        stockQuantity: true,
        category: { select: { slug: true, parent: { select: { slug: true } } } },
      },
    });

    return products.map((p) => {
      const base = Number(p.basePrice);
      const sale = p.salePrice != null ? Number(p.salePrice) : null;
      const compareAt = p.compareAtPrice != null ? Number(p.compareAtPrice) : null;
      const price = sale ?? base;
      const originalPrice = compareAt != null && compareAt > price
        ? compareAt
        : (sale != null && base > sale ? base : undefined);
      const discount = originalPrice != null && originalPrice > 0
        ? Math.round((1 - price / originalPrice) * 100)
        : undefined;
      const imageUrl = p.imageUrl
        || (Array.isArray(p.images) && p.images?.length ? (p.images as string[])[0] : null)
        || '/placeholder-product.svg';
      return {
        id: p.id,
        name: p.name,
        image: imageUrl,
        price,
        originalPrice,
        compareAtPrice: compareAt ?? undefined,
        discount,
        rating: 4.5,
        reviewCount: 0,
        productType: p.productType ?? undefined,
        stock: p.stock ?? undefined,
        stockQuantity: p.stockQuantity ?? undefined,
        categorySlug: (p.category?.slug === 'markaniza-ozel-uretim' || p.category?.parent?.slug === 'markaniza-ozel-uretim')
          ? 'markaniza-ozel-uretim'
          : (p.category?.slug ?? undefined),
      };
    });
  }

  if (md.source === 'MANUAL' && md.productIds && Array.isArray(md.productIds) && md.productIds.length > 0) {
    const products = await prisma.product.findMany({
      where: { 
        isPublished: true, 
        isActive: true, 
        id: { in: md.productIds } 
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        images: true,
        basePrice: true,
        salePrice: true,
        compareAtPrice: true,
        productType: true,
        stock: true,
        stockQuantity: true,
        category: { select: { slug: true, parent: { select: { slug: true } } } },
      },
    });

    // Preserve the order from productIds
    const orderedProducts = md.productIds
      .map((productId) => products.find((p) => p.id === productId))
      .filter((p): p is NonNullable<typeof p> => p !== undefined)
      .slice(0, limit);

    return orderedProducts.map((p) => {
      const base = Number(p.basePrice);
      const sale = p.salePrice != null ? Number(p.salePrice) : null;
      const compareAt = p.compareAtPrice != null ? Number(p.compareAtPrice) : null;
      const price = sale ?? base;
      const originalPrice = compareAt != null && compareAt > price
        ? compareAt
        : (sale != null && base > sale ? base : undefined);
      const discount = originalPrice != null && originalPrice > 0
        ? Math.round((1 - price / originalPrice) * 100)
        : undefined;
      const imageUrl = p.imageUrl
        || (Array.isArray(p.images) && p.images?.length ? (p.images as string[])[0] : null)
        || '/placeholder-product.svg';
      return {
        id: p.id,
        name: p.name,
        image: imageUrl,
        price,
        originalPrice,
        compareAtPrice: compareAt ?? undefined,
        discount,
        rating: 4.5,
        reviewCount: 0,
        productType: p.productType ?? undefined,
        stock: p.stock ?? undefined,
        stockQuantity: p.stockQuantity ?? undefined,
        categorySlug: (p.category?.slug === 'markaniza-ozel-uretim' || p.category?.parent?.slug === 'markaniza-ozel-uretim')
          ? 'markaniza-ozel-uretim'
          : (p.category?.slug ?? undefined),
      };
    });
  }

  return getPublishedProducts(limit);
}

export default async function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'MatbaaGross',
        url: 'https://www.matbaagross.com',
        logo: 'https://www.matbaagross.com/matbaagross-logo.png',
      },
      {
        '@type': 'WebSite',
        name: 'MatbaaGross',
        url: 'https://www.matbaagross.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.matbaagross.com/urunler?ara={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const timerEndTime = tomorrow.toISOString();

  const sections = await prisma.homepageSection.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const initialProducts = await getPublishedProducts(16);
  const featuredProduct = initialProducts[0] ?? null;

  const sectionNodes = await Promise.all(
    sections.map(async (section) => {
      if (section.type === HomepageSectionType.PRODUCT_CAROUSEL) {
        const products = await getProductsForCarousel(section.metadata);
        return (
          <ProductCarousel
            key={section.id}
            title={section.title}
            products={products}
            showTimer={false}
            timerEndTime={timerEndTime}
          />
        );
      }

      if (section.type === HomepageSectionType.BANNER_GRID) {
        const md = (section.metadata ?? {}) as {
          columns?: 1 | 2 | 3 | 4;
          banners?: { imageUrl: string; link?: string; alt?: string }[];
          aspectRatio?: 'landscape' | 'square';
        };
        const columns = md.columns && [1, 2, 3, 4].includes(md.columns) ? md.columns : 2;
        const banners = Array.isArray(md.banners) ? md.banners.filter((b) => b?.imageUrl) : [];
        const aspectRatio = md.aspectRatio === 'landscape' ? 'landscape' : 'square';
        const gridCols =
          columns === 1
            ? 'grid-cols-1'
            : columns === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : columns === 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : 'grid-cols-2 sm:grid-cols-4';

        return (
          <section key={section.id} className="bg-[#f5f5f5] py-4">
            <div className="container mx-auto px-4">
              <div className={`grid ${gridCols} gap-3`}>
                {banners.map((b, idx) => {
                  const bannerBoxClass =
                    aspectRatio === 'landscape'
                      ? 'aspect-[600/340] min-h-[160px] md:min-h-[200px]'
                      : 'aspect-square min-h-[220px] md:min-h-[260px]';

                  const content = (
                    <div
                      className={`relative w-full ${bannerBoxClass} rounded-xl overflow-hidden bg-slate-50 border-2 border-[#FF6000] shadow-md transition-transform duration-300 ease-in-out group-hover:scale-[1.03] group-hover:-translate-y-1`}
                    >
                      <Image
                        src={b.imageUrl}
                        alt={b.alt ?? section.title}
                        fill
                        className="object-contain object-center"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                  );

                  if (b.link) {
                    return (
                      <Link
                        key={`${section.id}-${idx}`}
                        href={b.link}
                        className="block group"
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div key={`${section.id}-${idx}`} className="group">
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      return null;
    })
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection featuredProduct={featuredProduct} />

      {sectionNodes}
    </>
  );
}
