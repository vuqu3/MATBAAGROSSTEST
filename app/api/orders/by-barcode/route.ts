import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** Barkod okutulduğunda sipariş durumunu Hazırlanıyor (PROCESSING) yapar. Sadece ADMIN. */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const barcode = typeof body.barcode === 'string' ? body.barcode.trim() : null;
    if (!barcode) {
      return NextResponse.json(
        { error: 'Barkod gerekli (body: { barcode: "MG-2024-XXXXXX" })' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: { barcode },
      include: {
        user: { select: { id: true, email: true, name: true } },
        address: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Bu barkoda ait sipariş bulunamadı.' },
        { status: 404 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PROCESSING' },
      include: {
        user: { select: { id: true, email: true, name: true } },
        address: true,
        items: true,
      },
    });

    return NextResponse.json({
      message: 'Sipariş durumu "Hazırlanıyor" olarak güncellendi.',
      order: updated,
    });
  } catch (error) {
    console.error('Orders by-barcode POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
