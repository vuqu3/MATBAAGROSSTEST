import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// GET - Tüm öne çıkan ürünleri getir
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const featuredWidgets = await prisma.featuredWidget.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            basePrice: true,
            salePrice: true,
            compareAtPrice: true,
            isPublished: true,
            isActive: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(featuredWidgets);
  } catch (error) {
    console.error('FEATURED_GET_ERROR:', error);
    return NextResponse.json(
      { error: 'Öne çıkan ürünler yüklenirken hata oluştu', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Yeni öne çıkan ürün ekle
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, customTitle, order } = body;

    console.log('FEATURED_POST_REQUEST:', { productId, customTitle, order });

    // Validation
    if (!productId) {
      return NextResponse.json({ error: 'Ürün ID zorunludur' }, { status: 400 });
    }

    if (typeof order !== 'number' || order < 0) {
      return NextResponse.json({ error: 'Sıra 0 veya pozitif bir sayı olmalıdır' }, { status: 400 });
    }

    // Product'ın varlığını kontrol et
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, isPublished: true, isActive: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    if (!product.isPublished || !product.isActive) {
      return NextResponse.json({ error: 'Sadece yayında ve aktif olan ürünler öne çıkanlara eklenebilir' }, { status: 400 });
    }

    // Aynı productId'nin zaten ekli olup olmadığını kontrol et
    const existingWidget = await prisma.featuredWidget.findFirst({
      where: { productId },
    });

    if (existingWidget) {
      return NextResponse.json({ error: 'Bu ürün zaten öne çıkanlarda mevcut' }, { status: 400 });
    }

    // FeaturedWidget oluştur
    const featuredWidget = await prisma.featuredWidget.create({
      data: {
        productId,
        customTitle: customTitle || null,
        order: parseInt(order.toString()),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            basePrice: true,
            salePrice: true,
            compareAtPrice: true,
            isPublished: true,
            isActive: true,
          },
        },
      },
    });

    console.log('FEATURED_POST_SUCCESS:', featuredWidget);

    // Ana sayfa ve admin sayfasını yenile
    revalidatePath('/');
    revalidatePath('/admin/featured');

    return NextResponse.json(featuredWidget);
  } catch (error) {
    console.error('FEATURED_POST_ERROR:', error);
    return NextResponse.json(
      { 
        error: 'Öne çıkan ürün kaydedilirken hata oluştu', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
