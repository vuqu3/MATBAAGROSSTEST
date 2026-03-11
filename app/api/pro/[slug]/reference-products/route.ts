import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const s = String(slug || '').trim();
    if (!s) {
      return NextResponse.json({ error: 'slug gerekli' }, { status: 400 });
    }

    const vendor = await (prisma as any).vendor.findUnique({
      where: { slug: s },
      select: { id: true, name: true, slug: true },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    let items: any[] = [];
    try {
      items = await (prisma as any).referenceProduct.findMany({
        where: { vendorId: vendor.id },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error: any) {
      if (error?.code !== 'P2021') throw error;
    }

    return NextResponse.json({ vendor, items });
  } catch (error) {
    console.error('PRO_REFERENCE_PRODUCTS_GET_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
