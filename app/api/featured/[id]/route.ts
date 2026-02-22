import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// DELETE - Öne çıkan ürünü sil (admin only)
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

    console.log('PUBLIC_FEATURED_DELETE_REQUEST:', { id });

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

    console.log('PUBLIC_FEATURED_DELETE_SUCCESS:', { id });

    // Ana sayfa ve admin sayfasını yenile
    revalidatePath('/');
    revalidatePath('/admin/featured');

    return NextResponse.json({ success: true, message: 'Öne çıkan ürün başarıyla kaldırıldı' });
  } catch (error) {
    console.error('PUBLIC_FEATURED_DELETE_ERROR:', error);
    return NextResponse.json(
      { 
        error: 'Öne çıkan ürün kaldırılırken hata oluştu', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
