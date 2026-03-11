import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import VendorEditClient from './VendorEditClient';

export default async function AdminVendorEditPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/admin/login');

  const { id } = await params;

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      commissionRate: true,
      balance: true,
      isBlocked: true,
      canAddRetailProducts: true,
      subscriptionStatus: true,
      subscriptionEndsAt: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          rating: true,
          completedJobs: true,
        },
      },
      owner: {
        select: {
          id: true,
          email: true,
          name: true,
          phoneNumber: true,
          companyName: true,
          taxOffice: true,
          taxNumber: true,
        },
      },
    },
  });

  if (!vendor) {
    redirect('/admin/vendors');
  }

  const safeVendor = {
    ...vendor,
    profile: {
      rating: vendor.profile?.rating ?? 5.0,
      completedJobs: vendor.profile?.completedJobs ?? 0,
    },
  };

  return <VendorEditClient vendor={safeVendor} />;
}
