import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true, phoneNumber: true } },
        address: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }

    if (session.user.role !== 'ADMIN' && order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status: newStatus } = body as { status?: string };

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED'];
    if (!newStatus || !validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: 'Geçerli bir durum girin: PENDING, PROCESSING, SHIPPED, COMPLETED' },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: newStatus as 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' },
      include: {
        user: { select: { id: true, email: true, name: true } },
        address: true,
        items: true,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
