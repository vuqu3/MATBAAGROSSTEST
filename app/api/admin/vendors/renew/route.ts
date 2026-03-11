import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as any;
    const vendorId = typeof body?.vendorId === 'string' ? body.vendorId.trim() : '';
    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId zorunlu' }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true, subscriptionEndsAt: true, ownerId: true },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Satıcı bulunamadı' }, { status: 404 });
    }

    const now = new Date();
    const endsAt = vendor.subscriptionEndsAt;
    const base = !endsAt || endsAt.getTime() <= now.getTime() ? now : endsAt;
    const nextEndsAt = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);

    const updated = await prisma.$transaction(async (tx) => {
      const updatedVendor = await tx.vendor.update({
        where: { id: vendorId },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionEndsAt: nextEndsAt,
        } as any,
        select: {
          id: true,
          subscriptionStatus: true,
          subscriptionEndsAt: true,
        },
      });

      await tx.user.update({
        where: { id: vendor.ownerId },
        data: {
          applicationStatus: 'APPROVED',
          role: 'SELLER',
        } as any,
        select: { id: true },
      });

      return updatedVendor;
    });

    revalidatePath('/seller-dashboard');
    revalidatePath('/seller-dashboard/subscription');

    return NextResponse.json({ vendor: updated });
  } catch (error) {
    console.error('ADMIN_VENDOR_RENEW_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
