import HeroSection from '../components/home/HeroSection';
import ProductCarousel from '../components/ProductCarousel';
import { prisma } from '@/lib/prisma';

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
    };
  });
}

export default async function Home() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const timerEndTime = tomorrow.toISOString();

  const carouselProducts = await getPublishedProducts(16);
  const gununFirsatlari = carouselProducts.slice(0, 8);
  const populerUrunler = carouselProducts.slice(0, 10);
  const featuredProduct = carouselProducts[0] ?? null;

  return (
    <>
      <HeroSection featuredProduct={featuredProduct} />

      <ProductCarousel
        title="Günün Fırsat Ürünleri"
        products={gununFirsatlari}
        showTimer={true}
        timerEndTime={timerEndTime}
      />

      <ProductCarousel
        title="Popüler Ürünler"
        products={populerUrunler}
      />
    </>
  );
}
