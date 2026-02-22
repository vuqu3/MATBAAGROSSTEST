import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DISCOUNT_THRESHOLD = 50; // %50 ve üzeri

export async function GET() {
  try {
    const allProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        isPublished: true,
        OR: [
          { vendorId: null },
          { vendor: { isBlocked: false } },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        images: true,
        basePrice: true,
        salePrice: true,
        compareAtPrice: true,
        productType: true,
        stockQuantity: true,
        stock: true,
        variants: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filtre: compareAtPrice baz alınarak %50+ indirim hesapla
    const discounted = allProducts.filter((p) => {
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

    return NextResponse.json(discounted);
  } catch (error) {
    console.error('Discounted products GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
