import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Tüm banner'ları getir
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error('Banner GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Yeni banner oluştur
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, title, subtitle, link, order, isActive } = body;

    if (!imageUrl || !title || !subtitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        imageUrl,
        title,
        subtitle,
        link: link || null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('Banner POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
