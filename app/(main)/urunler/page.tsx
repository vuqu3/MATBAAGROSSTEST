import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductCardEcommerce from '@/app/components/ProductCardEcommerce';
import DiscountBanner from '@/app/components/DiscountBanner';

// Sayfanın yeni ürün eklendiğinde anında güncellenmesini sağlar
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Ürün veritabanı tipi
type ProductWithRelations = {
  id: string;
  name: string;
  imageUrl: string | null;
  basePrice: number;
  salePrice: number | null;
  compareAtPrice: number | null;
  productType: 'READY' | 'CUSTOM' | null;
  stock: number | null;
  stockQuantity: number | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  variants: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedSearchParams?.kategori as string | undefined;
  const isDiscountPage = categorySlug === '50-indirimli-urunler';
  const isReadyStockPage = categorySlug === 'stoktan-teslim';
  const isAmbalajGrossPage = categorySlug === 'ambalaj-gross';
  const title = isDiscountPage ? 'Yarı Fiyatına Fırsatlar' : 
              isReadyStockPage ? 'Stoktan Hemen Teslim Ürünler' : 
              isAmbalajGrossPage ? 'Ambalaj Gross - Toptan Fiyatına Fırsatlar' :
              (categorySlug ? `${categorySlug} Ürünleri` : 'Tüm Ürünler');
  
  return {
    title: `${title} | MatbaaGross`,
    description: isReadyStockPage
      ? 'Beklemek yok! Sipariş verdiğiniz an kargoya verilmeye hazır, stoklarımızda bulunan tüm ürünler.'
      : isAmbalajGrossPage
        ? 'Gıda, restoran ve içecek ambalajlarında toptan fiyatına perakende satış fırsatları.'
        : categorySlug 
          ? `${categorySlug} kategorisindeki tüm matbaa ürünlerimiz. Kaliteli baskı çözümleri uygun fiyatlarla.`
          : 'MatbaaGross - Tüm matbaa ürünleri. Kartvizit, broşür, el ilanı, afiş ve daha fazlası.',
  };
}

export default async function UrunlerPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedSearchParams?.kategori as string | undefined;
  const isDiscountPage = categorySlug === '50-indirimli-urunler';
  const isReadyStockPage = categorySlug === 'stoktan-teslim';
  const isAmbalajGrossPage = categorySlug === 'ambalaj-gross';

  let products = [];
  let pageTitle = 'Tüm Ürünler';
  let pageDescription = '';

  if (isDiscountPage) {
    // %50+ indirimli ürünleri çek
    const allProducts = await prisma.product.findMany({
      where: {
        status: 'APPROVED',
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
          },
          orderBy: {
            price: 'asc',
          },
        },
      },
      orderBy: [
        { isPublished: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // %50+ indirim filtresi
    const DISCOUNT_THRESHOLD = 50;
    products = allProducts.filter((p) => {
      const salePrice = p.salePrice != null ? Number(p.salePrice) : null;
      const basePrice = Number(p.basePrice);
      const price = salePrice ?? basePrice;

      // Referans fiyat: compareAtPrice veya (salePrice varsa basePrice)
      const compareAt = p.compareAtPrice != null ? Number(p.compareAtPrice) : null;
      const refPrice = compareAt ?? (salePrice != null && basePrice > salePrice ? basePrice : null);

      // Ürün seviyesinde indirim kontrolü
      if (refPrice != null && refPrice > price) {
        const pct = ((refPrice - price) / refPrice) * 100;
        if (pct >= DISCOUNT_THRESHOLD) return true;
      }

      return false;
    });

    pageTitle = 'Yarı Fiyatına Fırsatlar';
    pageDescription = 'Sistemimizde gerçek anlamda %50 ve üzeri indirim uygulanan tüm ürünler.';
  } else if (isReadyStockPage) {
    // Stoktan hemen teslim ürünleri çek
    products = await prisma.product.findMany({
      where: {
        status: 'APPROVED',
        isActive: true,
        stock: {
          gt: 0, // Stok miktarı 0'dan büyük olanlar
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
          },
          orderBy: {
            price: 'asc',
          },
        },
      },
      orderBy: [
        { isPublished: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    pageTitle = 'Stoktan Hemen Teslim Ürünler';
    pageDescription = 'Beklemek yok! Sipariş verdiğiniz an kargoya verilmeye hazır, stoklarımızda bulunan tüm ürünler.';
  } else if (isAmbalajGrossPage) {
    // Ambalaj Gross - Birden fazla kategoriden ürünleri çek
    products = await prisma.product.findMany({
      where: {
        status: 'APPROVED',
        isActive: true,
        category: {
          slug: {
            in: ['bardak-icecek-ambalajlari', 'gida-restoran-kutulari']
          },
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
          },
          orderBy: {
            price: 'asc',
          },
        },
      },
      orderBy: [
        { isPublished: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    pageTitle = 'Ambalaj Gross - Toptan Fiyatına Fırsatlar';
    pageDescription = 'Gıda, restoran ve içecek ambalajlarında toptan fiyatına perakende satış fırsatları.';
  } else if (categorySlug) {
    // Normal kategori filtresi
    products = await prisma.product.findMany({
      where: {
        status: 'APPROVED',
        isActive: true,
        category: {
          slug: categorySlug,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
          },
          orderBy: {
            price: 'asc',
          },
        },
      },
      orderBy: [
        { isPublished: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    pageTitle = `${products[0]?.category?.name || categorySlug} Ürünleri`;
    pageDescription = `${products[0]?.category?.name || categorySlug} kategorisindeki tüm ürünlerimiz.`;
  } else {
    // Tüm ürünler
    products = await prisma.product.findMany({
      where: {
        status: 'APPROVED',
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
          },
          orderBy: {
            price: 'asc',
          },
        },
      },
      orderBy: [
        { isPublished: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    pageTitle = 'Tüm Ürünler';
    pageDescription = 'Sitemizdeki tüm aktif ürünler.';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {/* Sayfa Başlığı */}
        <div className="mb-8">
          {isDiscountPage ? (
            <DiscountBanner productCount={products.length} />
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
              <p className="text-gray-600">
                {pageDescription || `${products.length} ürün listeleniyor.`}
              </p>
            </>
          )}
        </div>

        {/* Ürün Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {products.map((product) => {
              // Fiyat hesaplaması (ana sayfadaki mantıkla aynı)
              const base = Number(product.basePrice);
              const sale = product.salePrice != null ? Number(product.salePrice) : null;
              const compareAt = product.compareAtPrice != null ? Number(product.compareAtPrice) : null;
              const price = sale ?? base;
              const originalPrice = compareAt != null && compareAt > price
                ? compareAt
                : (sale != null && base > sale ? base : undefined);
              const discount = originalPrice != null && originalPrice > 0
                ? Math.round((1 - price / originalPrice) * 100)
                : undefined;
              
              return (
                <ProductCardEcommerce
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  image={product.imageUrl || '/placeholder-product.svg'}
                  price={price}
                  originalPrice={originalPrice}
                  compareAtPrice={compareAt ?? undefined}
                  discount={discount}
                  rating={4.5}
                  reviewCount={0}
                  productType={product.productType ?? undefined}
                  stock={product.stock}
                  stockQuantity={product.stockQuantity}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {categorySlug ? 'Bu kategoride ürün bulunamadı' : 'Henüz ürün bulunmuyor'}
              </h3>
              <p className="text-gray-500 mb-6">
                {categorySlug 
                  ? 'Bu kategori için henüz ürün eklenmemiş. Lütfen başka bir kategori deneyin.'
                  : 'Sitemizde henüz ürün bulunmuyor. Yakında yeni ürünler eklenecek.'
                }
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
