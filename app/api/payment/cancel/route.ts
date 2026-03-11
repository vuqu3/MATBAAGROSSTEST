import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as { orderId?: string } | null;
    const orderId = String(body?.orderId ?? '').trim();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId gerekli' }, { status: 400 });
    }

    // Only allow cancelling unpaid card orders.
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, paymentMethod: true, paymentStatus: true },
    });

    if (!order) {
      return NextResponse.json({ ok: true });
    }

    if (order.paymentMethod !== 'CARD' || order.paymentStatus !== 'AWAITING_PAYMENT') {
      return NextResponse.json({ ok: true });
    }

    // Delete the pending order. Since we do NOT decrement stock on CARD checkout anymore,
    // removing the order is enough to restore cart flow.
    await prisma.order.delete({ where: { id: orderId } }).catch(() => null);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('PAYMENT_CANCEL_POST_ERROR:', error);
    return NextResponse.json({ ok: true });
  }
}
