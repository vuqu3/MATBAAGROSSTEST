import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// PATCH - Öne çıkan ürünü güncelle
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { productId, customTitle, order } = body;

    console.log('FEATURED_PATCH_REQUEST:', { id, productId, customTitle, order });

    // FeaturedWidget'ın varlığını kontrol et
    const existingWidget = await prisma.featuredWidget.findUnique({
      where: { id },
    });

    if (!existingWidget) {
      return NextResponse.json({ error: 'Öne çıkan ürün bulunamadı' }, { status: 404 });
    }

    // Eğer productId değiştiriliyorsa, yeni product'ın varlığını kontrol et
    if (productId && productId !== existingWidget.productId) {
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
      const duplicateWidget = await prisma.featuredWidget.findFirst({
        where: { 
          productId,
          id: { not: id }
        },
      });

      if (duplicateWidget) {
        return NextResponse.json({ error: 'Bu ürün zaten öne çıkanlarda mevcut' }, { status: 400 });
      }
    }

    // Validation
    if (order !== undefined && (typeof order !== 'number' || order < 0)) {
      return NextResponse.json({ error: 'Sıra 0 veya pozitif bir sayı olmalıdır' }, { status: 400 });
    }

    // FeaturedWidget'ı güncelle
    const updatedWidget = await prisma.featuredWidget.update({
      where: { id },
      data: {
        ...(productId && { productId }),
        ...(customTitle !== undefined && { customTitle: customTitle || null }),
        ...(order !== undefined && { order: parseInt(order.toString()) }),
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

    console.log('FEATURED_PATCH_SUCCESS:', updatedWidget);

    // Ana sayfa ve admin sayfasını yenile
    revalidatePath('/');
    revalidatePath('/admin/featured');

    return NextResponse.json(updatedWidget);
  } catch (error) {
    console.error('FEATURED_PATCH_ERROR:', error);
    return NextResponse.json(
      { 
        error: 'Öne çıkan ürün güncellenirken hata oluştu', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Öne çıkan ürünü sil
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    console.log('FEATURED_DELETE_REQUEST:', { id });

    // FeaturedWidget'ın varlığını kontrol et
    const existingWidget = await prisma.featuredWidget.findUnique({
      where: { id },
    });

    if (!existingWidget) {
      return NextResponse.json({ error: 'Öne çıkan ürün bulunamadı' }, { status: 404 });
    }

    // FeaturedWidget'ı sil
    await prisma.featuredWidget.delete({
      where: { id },
    });

    console.log('FEATURED_DELETE_SUCCESS:', { id });

    // Ana sayfa ve admin sayfasını yenile
    revalidatePath('/');
    revalidatePath('/admin/featured');

    return NextResponse.json({ success: true, message: 'Öne çıkan ürün başarıyla kaldırıldı' });
  } catch (error) {
    console.error('FEATURED_DELETE_ERROR:', error);
    return NextResponse.json(
      { 
        error: 'Öne çıkan ürün kaldırılırken hata oluştu', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
