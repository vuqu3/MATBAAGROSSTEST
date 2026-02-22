import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// PATCH - Banner güncelle
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
    const { imageUrl, title, subtitle, link, order, isActive } = body;

    console.log('BANNERS_PATCH_REQUEST:', { id, imageUrl, title, subtitle, link, order, isActive });

    // Banner'ın varlığını kontrol et
    const existingBanner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      return NextResponse.json({ error: 'Banner bulunamadı' }, { status: 404 });
    }

    // Validation
    if (imageUrl !== undefined && (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0)) {
      return NextResponse.json({ error: 'Görsel URL zorunludur' }, { status: 400 });
    }

    if (title !== undefined && (!title || typeof title !== 'string' || title.trim().length === 0)) {
      return NextResponse.json({ error: 'Başlık zorunludur' }, { status: 400 });
    }

    if (subtitle !== undefined && (!subtitle || typeof subtitle !== 'string' || subtitle.trim().length === 0)) {
      return NextResponse.json({ error: 'Alt başlık zorunludur' }, { status: 400 });
    }

    if (order !== undefined && (typeof order !== 'number' || order < 0)) {
      return NextResponse.json({ error: 'Sıra 0 veya pozitif bir sayı olmalıdır' }, { status: 400 });
    }

    // Banner'ı güncelle
    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: {
        ...(imageUrl !== undefined && { imageUrl: imageUrl.trim() }),
        ...(title !== undefined && { title: title.trim() }),
        ...(subtitle !== undefined && { subtitle: subtitle.trim() }),
        ...(link !== undefined && { link: link && typeof link === 'string' && link.trim() ? link.trim() : null }),
        ...(order !== undefined && { order: parseInt(order.toString()) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    console.log('BANNERS_PATCH_SUCCESS:', updatedBanner);

    // Ana sayfayı yenile
    revalidatePath('/');

    return NextResponse.json(updatedBanner);
  } catch (error) {
    console.error('BANNERS_PATCH_ERROR:', error);
    return NextResponse.json(
      { 
        error: 'Banner güncellenirken hata oluştu', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Banner sil
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

    console.log('BANNERS_DELETE_REQUEST:', { id });

    // Banner'ın varlığını kontrol et
    const existingBanner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      return NextResponse.json({ error: 'Banner bulunamadı' }, { status: 404 });
    }

    // Banner'ı sil
    await prisma.banner.delete({
      where: { id },
    });

    console.log('BANNERS_DELETE_SUCCESS:', { id });

    // Ana sayfayı yenile
    revalidatePath('/');

    return NextResponse.json({ success: true, message: 'Banner başarıyla kaldırıldı' });
  } catch (error) {
    console.error('BANNERS_DELETE_ERROR:', error);
    return NextResponse.json(
      { 
        error: 'Banner kaldırılırken hata oluştu', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
