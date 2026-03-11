import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resolveVendorForSession } from '@/lib/getMatbaaGrossVendor';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const vendor = await resolveVendorForSession(session.user.id, session.user.role).catch(() => null);
    const vendorId: string | null = vendor ? String((vendor as any).id) : null;
    if (!vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const items = await (prisma as any).referenceProduct.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    if (error?.code === 'P2021') {
      return NextResponse.json({ items: [] });
    }
    console.error('SELLER_REFERENCE_PRODUCTS_GET_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const vendor = await resolveVendorForSession(session.user.id, session.user.role).catch(() => null);
    const vendorId: string | null = vendor ? String((vendor as any).id) : null;
    if (!vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as any;

    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return NextResponse.json({ error: 'Ürün adı zorunlu' }, { status: 400 });
    }

    const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl.trim() : '';
    if (!imageUrl) {
      return NextResponse.json({ error: 'Görsel zorunlu' }, { status: 400 });
    }

    const description = typeof body?.description === 'string' ? body.description.trim() : '';
    if (!description) {
      return NextResponse.json({ error: 'Açıklama zorunlu' }, { status: 400 });
    }

    const data = {
      vendorId,
      title,
      imageUrl,
      description,
    };

    let created;
    try {
      created = await (prisma as any).referenceProduct.create({ data });
    } catch (error: any) {
      if (error?.code === 'P2021') {
        return NextResponse.json({ error: 'Veritabanı tablosu eksik (reference_products). Lütfen migration/db push çalıştırın.' }, { status: 500 });
      }
      throw error;
    }
    return NextResponse.json({ item: created });
  } catch (error) {
    console.error('SELLER_REFERENCE_PRODUCTS_POST_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
