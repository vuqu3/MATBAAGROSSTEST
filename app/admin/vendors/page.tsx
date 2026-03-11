import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import VendorsClient from './VendorsClient';

export default async function AdminVendorsPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/admin/login');

  const vendors = await prisma.vendor.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      balance: true,
      isBlocked: true,
      subscriptionStatus: true,
      subscriptionEndsAt: true,
      owner: { select: { email: true, name: true } },
    } as any,
  });

  return <VendorsClient initialVendors={vendors} />;
}
