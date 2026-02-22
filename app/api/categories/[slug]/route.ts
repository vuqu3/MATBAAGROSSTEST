import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: {
            isPublished: true,
            isActive: true,
            OR: [
              { vendorId: null },
              { vendor: { isBlocked: false } },
            ],
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Kategori bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Category GET [slug] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
