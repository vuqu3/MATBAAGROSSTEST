import Header from './components/Header';
import Footer from './components/Footer';
import HeroSection from './components/home/HeroSection';
import ProductCarousel from './components/ProductCarousel';
import { prisma } from '@/lib/prisma';

async function getPublishedProducts(limit: number) {
  const products = await prisma.product.findMany({
    where: { isPublished: true, isActive: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return products.map((p) => {
    const base = Number(p.basePrice);
    const sale = p.salePrice != null ? Number(p.salePrice) : null;
    const price = sale ?? base;
    const originalPrice = sale != null && base > sale ? base : undefined;
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
      discount,
      rating: 4.5,
      reviewCount: 0,
      productType: p.productType ?? undefined,
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
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <Header />
      <main className="flex-grow">
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
      </main>
      <Footer />
    </div>
  );
}
