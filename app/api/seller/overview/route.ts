import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true, commissionRate: true },
  });
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  const [totalSalesRaw, pendingItemsCount, itemsForEarnings, pendingProductsCount, recentOrderItems, vendorWithSlug] = await Promise.all([
    prisma.orderItem.aggregate({
      where: { vendorId: vendor.id },
      _sum: { totalPrice: true },
      _count: true,
    }),
    prisma.orderItem.count({
      where: {
        vendorId: vendor.id,
        order: { status: 'PENDING' },
      },
    }),
    prisma.orderItem.findMany({
      where: { vendorId: vendor.id },
      select: { totalPrice: true },
    }),
    prisma.product.count({
      where: { vendorId: vendor.id, status: 'PENDING' },
    }),
    prisma.orderItem.findMany({
      where: { vendorId: vendor.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { id: true, barcode: true, status: true, totalAmount: true } },
      },
    }),
    prisma.vendor.findUnique({
      where: { id: vendor.id },
      select: { name: true, slug: true },
    }),
  ]);

  const totalSales = totalSalesRaw._sum.totalPrice ?? 0;
  const commissionRate = vendor.commissionRate / 100;
  const earnings = itemsForEarnings.reduce((sum, i) => sum + (1 - commissionRate) * i.totalPrice, 0);
  const storeScore = 8.5;

  return NextResponse.json({
    totalSales,
    pendingOrders: pendingItemsCount,
    pendingProducts: pendingProductsCount,
    storeScore,
    earnings,
    commissionRate: vendor.commissionRate,
    recentOrders: recentOrderItems.map((item) => ({
      id: item.id,
      barcode: item.order.barcode,
      status: item.order.status,
      totalPrice: item.totalPrice,
      createdAt: item.createdAt,
    })),
  });
}
