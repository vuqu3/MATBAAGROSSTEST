import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

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

  // 30 gün öncesinin tarihi
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalSalesRaw, pendingItemsCount, itemsForEarnings, pendingProductsCount, recentOrderItems, vendorWithSlug, salesChart] = await Promise.all([
    prisma.orderItem.aggregate({
      where: { vendorId: vendor.id },
      _sum: { totalPrice: true },
      _count: true,
    }),
    prisma.orderItem.count({
      where: {
        vendorId: vendor.id,
        order: { status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING] } },
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
    // 30 günlük satış verileri
    prisma.orderItem.groupBy({
      by: ['createdAt'],
      where: {
        vendorId: vendor.id,
        order: { status: { in: [OrderStatus.COMPLETED] } },
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { totalPrice: true },
    }),
  ]);

  const totalSales = totalSalesRaw._sum.totalPrice ?? 0;
  const commissionRate = vendor.commissionRate / 100;
  const earnings = itemsForEarnings.reduce((sum, i) => sum + (1 - commissionRate) * i.totalPrice, 0);

  // 30 günlük satış verisini gün bazında grupla
  const salesByDay = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    salesByDay.set(dateStr, 0);
  }

  salesChart.forEach(item => {
    const dateStr = item.createdAt.toISOString().split('T')[0];
    const dayTotal = item._sum?.totalPrice || 0;
    if (salesByDay.has(dateStr)) {
      salesByDay.set(dateStr, dayTotal);
    }
  });

  // Grafiği için array formatına çevir (en eski günden yeniye)
  const chartData = Array.from(salesByDay.entries()).reverse().map(([date, total]) => ({
    date,
    total,
  }));

  return NextResponse.json({
    totalSales,
    pendingOrders: pendingItemsCount,
    pendingProducts: pendingProductsCount,
    earnings,
    commissionRate: vendor.commissionRate,
    chartData,
    recentOrders: recentOrderItems.map((item) => ({
      id: item.id,
      barcode: item.order.barcode,
      status: item.order.status,
      totalPrice: item.totalPrice,
      createdAt: item.createdAt,
    })),
  });
}
