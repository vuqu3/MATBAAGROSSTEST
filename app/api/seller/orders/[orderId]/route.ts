import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resolveVendorForSession } from '@/lib/getMatbaaGrossVendor';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendor = await resolveVendorForSession(session.user.id, session.user.role);
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  const { orderId } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      items: { some: { vendorId: vendor.id } },
    },
    include: {
      items: {
        where: { vendorId: vendor.id },
      },
      address: true,
      user: { select: { name: true, email: true, phoneNumber: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
  }

  return NextResponse.json({
    ...order,
    orderItems: order.items,
    items: undefined,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendor = await resolveVendorForSession(session.user.id, session.user.role);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const { orderId } = await params;
    const body = await request.json().catch(() => ({}));
    const { status: newStatus } = body as { status?: string };

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED'] as const;
    if (!newStatus || !validStatuses.includes(newStatus as any)) {
      return NextResponse.json(
        { error: 'Geçerli bir durum girin: PENDING, PROCESSING, SHIPPED, COMPLETED' },
        { status: 400 }
      );
    }

    const existing = await prisma.order.findFirst({
      where: {
        id: orderId,
        items: { some: { vendorId: vendor.id } },
      },
      select: {
        id: true,
        status: true,
        items: { select: { vendorId: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }

    const hasOtherVendorItems = existing.items.some((i) => i.vendorId !== vendor.id);
    if (hasOtherVendorItems) {
      return NextResponse.json(
        { error: 'Bu sipariş birden fazla satıcı içerdiği için durum güncellemesi desteklenmiyor.' },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus as any },
      include: {
        items: {
          where: { vendorId: vendor.id },
        },
        address: true,
        user: { select: { name: true, email: true, phoneNumber: true } },
      },
    });

    return NextResponse.json({
      ...updated,
      orderItems: updated.items,
      items: undefined,
    });
  } catch (error) {
    console.error('SELLER_ORDER_PATCH_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
