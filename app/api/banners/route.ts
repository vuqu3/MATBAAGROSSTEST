import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// GET: Banner'ları getir (admin için tümü, public için sadece aktifler)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminMode = searchParams.get('admin') === 'true';
    const session = await auth();

    console.log('BANNERS_GET_REQUEST:', { adminMode, userRole: session?.user?.role });

    // Admin modu için auth kontrolü
    if (adminMode && (!session?.user?.id || session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const banners = await prisma.banner.findMany({
      where: adminMode ? {} : { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        imageUrl: true,
        title: true,
        subtitle: true,
        link: true,
        order: true,
        isActive: adminMode, // Sadece admin modunda göster
        createdAt: adminMode, // Sadece admin modunda göster
        updatedAt: adminMode, // Sadece admin modunda göster
      },
    });

    console.log('BANNERS_GET_SUCCESS:', { count: banners.length, adminMode });

    return NextResponse.json(banners);
  } catch (error) {
    console.error('BANNERS_GET_ERROR:', error);
    return NextResponse.json(
      { 
        error: 'Banner\'lar yüklenirken hata oluştu', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// POST: Yeni banner ekle (admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, title, subtitle, link, order } = body;

    console.log('BANNERS_POST_REQUEST:', { imageUrl, title, subtitle, link, order });

    // Validation
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
      return NextResponse.json({ error: 'Görsel URL zorunludur' }, { status: 400 });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Başlık zorunludur' }, { status: 400 });
    }

    if (!subtitle || typeof subtitle !== 'string' || subtitle.trim().length === 0) {
      return NextResponse.json({ error: 'Alt başlık zorunludur' }, { status: 400 });
    }

    if (typeof order !== 'number' || order < 0) {
      return NextResponse.json({ error: 'Sıra 0 veya pozitif bir sayı olmalıdır' }, { status: 400 });
    }

    // Banner oluştur
    const banner = await prisma.banner.create({
      data: {
        imageUrl: imageUrl.trim(),
        title: title.trim(),
        subtitle: subtitle.trim(),
        link: link && typeof link === 'string' && link.trim() ? link.trim() : null,
        order: parseInt(order.toString()),
      },
    });

    console.log('BANNERS_POST_SUCCESS:', banner);

    // Ana sayfayı yenile
    revalidatePath('/');

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('BANNERS_POST_ERROR:', error);
    return NextResponse.json(
      { 
        error: 'Banner eklenirken hata oluştu', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
