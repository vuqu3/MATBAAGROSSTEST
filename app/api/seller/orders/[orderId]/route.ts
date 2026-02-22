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
