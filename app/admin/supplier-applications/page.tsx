import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SupplierApplicationsClient from './SupplierApplicationsClient';

export default async function AdminSupplierApplicationsPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/admin/login');

  const applications = await prisma.supplierApplication.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <SupplierApplicationsClient applications={applications} />;
}
