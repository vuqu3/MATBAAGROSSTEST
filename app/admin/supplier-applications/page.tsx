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

  const emails = Array.from(new Set(applications.map((a) => a.email)));
  const users = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { email: true, companyDetails: true } as any,
  });
  const userByEmail = new Map(users.map((u) => [u.email, u]));

  const applicationsWithDetails = applications.map((a) => ({
    ...a,
    companyDetails: userByEmail.get(a.email)?.companyDetails ?? null,
  }));

  return <SupplierApplicationsClient applications={applicationsWithDetails} />;
}
