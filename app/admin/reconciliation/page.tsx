import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ReconciliationClient from './ReconciliationClient';

export default async function AdminReconciliationPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/admin/login');

  // Tamamlanmış siparişleri ve satıcıları çek
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: 'asc' },
    include: {
      owner: { select: { email: true, name: true } },
      // Tamamlanmış siparişlerin item'larını çek
      orderItems: {
        where: {
          order: { status: 'COMPLETED' },
          vendorId: { not: null }, // Sadece satıcı ürünleri
        },
        include: {
          order: { select: { barcode: true, createdAt: true } },
        },
      },
    },
  });

  // Her satıcı için finansal hesaplamaları yap
  const vendorStats = vendors.map((vendor) => {
    const totalRevenue = vendor.orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const commissionAmount = totalRevenue * (vendor.commissionRate / 100);
    const netPayable = totalRevenue - commissionAmount;

    return {
      id: vendor.id,
      name: vendor.name,
      email: vendor.owner?.email ?? '—',
      commissionRate: vendor.commissionRate,
      totalRevenue,
      commissionAmount,
      netPayable,
      orderItems: vendor.orderItems,
    };
  });

  return <ReconciliationClient vendors={vendorStats} />;
}
