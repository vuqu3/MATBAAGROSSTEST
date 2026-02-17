import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { id: true, barcode: true, totalAmount: true, createdAt: true } },
        messages: { orderBy: { createdAt: 'asc' }, take: 1 },
      },
    });
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Support tickets GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { orderId, subject, message } = body as { orderId?: string | null; subject: string; message: string };
    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Konu ve mesaj gerekli' },
        { status: 400 }
      );
    }
    if (orderId) {
      const order = await prisma.order.findFirst({
        where: { id: orderId, userId: session.user.id! },
      });
      if (!order) {
        return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 400 });
      }
    }
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        orderId: orderId?.trim() || null,
        subject: subject.trim(),
        messages: {
          create: { message: message.trim(), isStaffReply: false },
        },
      },
      include: {
        order: { select: { id: true, barcode: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Support tickets POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
