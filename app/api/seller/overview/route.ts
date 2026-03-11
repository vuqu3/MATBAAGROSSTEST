import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OrderStatus, PremiumQuoteRequestStatus, PremiumQuoteOfferStatus } from '@prisma/client';
import { resolveVendorForSession } from '@/lib/getMatbaaGrossVendor';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendor = await resolveVendorForSession(session.user.id, session.user.role, { id: true, commissionRate: true });
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  const vendorId = String((vendor as any).id);
  const vendorCommissionRate = 0;

  // 30 gün öncesinin tarihi
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalSalesRaw,
    cardSalesRaw,
    bankTransferSalesRaw,
    pendingItemsCount,
    completedOrdersCount,
    itemsForEarnings,
    pendingProductsCount,
    recentOrderItems,
    vendorWithSlug,
    salesChart,
    totalRfqRequests,
    quotedRequests,
    approvedOffersRaw,
  ] = await Promise.all([
    prisma.orderItem.aggregate({
      where: { vendorId },
      _sum: { totalPrice: true },
      _count: true,
    }),
    prisma.orderItem.aggregate({
      where: { vendorId, order: { is: { paymentMethod: 'CARD' } } },
      _sum: { totalPrice: true },
    }),
    prisma.orderItem.aggregate({
      where: { vendorId, order: { is: { paymentMethod: 'BANK_TRANSFER' } } },
      _sum: { totalPrice: true },
    }),
    prisma.orderItem.count({
      where: {
        vendorId,
        order: { is: { status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING] } } },
      },
    }),
    prisma.order.count({
      where: {
        status: OrderStatus.COMPLETED,
        items: { some: { vendorId } },
      },
    }),
    prisma.orderItem.findMany({
      where: { vendorId },
      select: { totalPrice: true },
    }),
    prisma.product.count({
      where: { vendorId, status: 'PENDING' },
    }),
    prisma.orderItem.findMany({
      where: { vendorId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { id: true, barcode: true, status: true, totalAmount: true } },
      },
    }),
    prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { name: true, slug: true },
    }),
    // 30 günlük satış verileri
    prisma.orderItem.groupBy({
      by: ['createdAt'],
      where: {
        vendorId,
        order: { is: { status: { in: [OrderStatus.COMPLETED] } } },
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { totalPrice: true },
    }),
    // RFQ: toplam açık talepler
    prisma.premiumQuoteRequest.count({
      where: { status: PremiumQuoteRequestStatus.PENDING },
    }),
    // RFQ: bu üreticinin teklif verdiği işler
    prisma.premiumQuoteOffer.count({
      where: { vendorId, status: PremiumQuoteOfferStatus.PENDING },
    }),
    // RFQ: onaylanan + ödenen teklifler
    prisma.premiumQuoteOffer.findMany({
      where: {
        vendorId,
        status: { in: [PremiumQuoteOfferStatus.ACCEPTED, PremiumQuoteOfferStatus.PAID] },
      },
      select: { totalPrice: true },
    }),
  ]);

  const totalSales = totalSalesRaw._sum?.totalPrice ?? 0;
  const cardSales = cardSalesRaw._sum?.totalPrice ?? 0;
  const bankTransferSales = bankTransferSalesRaw._sum?.totalPrice ?? 0;
  const earnings = itemsForEarnings.reduce((sum, i) => sum + i.totalPrice, 0);

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

  const approvedCount = approvedOffersRaw.length;
  const rfqRevenue = approvedOffersRaw.reduce((sum, o) => sum + Number(o.totalPrice ?? 0), 0);

  return NextResponse.json({
    totalSales,
    cardSales,
    bankTransferSales,
    completedOrders: completedOrdersCount,
    pendingOrders: pendingItemsCount,
    pendingProducts: pendingProductsCount,
    earnings,
    commissionRate: vendorCommissionRate,
    chartData,
    totalRfqRequests,
    quotedRequests,
    approvedRequests: approvedCount,
    rfqRevenue,
    recentOrders: (recentOrderItems as any[]).map((item) => ({
      id: item.id,
      barcode: item.order?.barcode ?? null,
      status: item.order?.status ?? 'PENDING',
      totalPrice: item.totalPrice,
      createdAt: item.createdAt,
    })),
  });
}
