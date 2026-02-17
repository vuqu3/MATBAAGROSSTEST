import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public: Menüde gösterilecek kategoriler (showOnNavbar + isActive, order'a göre, children dahil)
export const revalidate = 60; // 60 saniyede bir cache yenilensin

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
        showOnNavbar: true,
        isActive: true,
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        order: true,
        children: {
          where: { showOnNavbar: true, isActive: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            order: true,
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error: unknown) {
    console.error('[GET /api/categories/navbar] Hata detayı:', {
      message: error instanceof Error ? error.message : String(error),
      code: (error as { code?: string })?.code,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
