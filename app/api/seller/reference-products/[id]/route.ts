import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resolveVendorForSession } from '@/lib/getMatbaaGrossVendor';

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await ctx.params;
    const referenceProductId = String(id || '').trim();
    if (!referenceProductId) {
      return NextResponse.json({ error: 'id gerekli' }, { status: 400 });
    }

    const vendor = await resolveVendorForSession(session.user.id, session.user.role).catch(() => null);
    const vendorId: string | null = vendor ? String((vendor as any).id) : null;
    if (!vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as any;

    const next: any = {
      title: typeof body?.title === 'string' ? body.title.trim() : undefined,
      imageUrl: typeof body?.imageUrl === 'string' ? body.imageUrl.trim() || null : undefined,
      description: typeof body?.description === 'string' ? body.description.trim() || null : undefined,
    };

    if (typeof next.title === 'string' && !next.title) {
      return NextResponse.json({ error: 'Ürün adı zorunlu' }, { status: 400 });
    }

    if (typeof next.imageUrl === 'string' && !next.imageUrl) {
      return NextResponse.json({ error: 'Görsel zorunlu' }, { status: 400 });
    }

    if (typeof next.description === 'string' && !next.description) {
      return NextResponse.json({ error: 'Açıklama zorunlu' }, { status: 400 });
    }

    const result = await (prisma as any).referenceProduct.updateMany({
      where: { id: referenceProductId, vendorId },
      data: next,
    });

    if (!result?.count) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const item = await (prisma as any).referenceProduct.findFirst({
      where: { id: referenceProductId, vendorId },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('SELLER_REFERENCE_PRODUCTS_PATCH_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await ctx.params;
    const referenceProductId = String(id || '').trim();
    if (!referenceProductId) {
      return NextResponse.json({ error: 'id gerekli' }, { status: 400 });
    }

    const vendor = await resolveVendorForSession(session.user.id, session.user.role).catch(() => null);
    const vendorId: string | null = vendor ? String((vendor as any).id) : null;
    if (!vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await (prisma as any).referenceProduct.deleteMany({
      where: { id: referenceProductId, vendorId },
    });

    if (!result?.count) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('SELLER_REFERENCE_PRODUCTS_DELETE_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
