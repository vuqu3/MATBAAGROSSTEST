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
    include: { 
      owner: { 
        select: { 
          id: true, 
          email: true, 
          name: true, 
          phoneNumber: true,
          companyName: true,
          taxOffice: true,
          taxNumber: true,
        } 
      } 
    },
  });

  if (!vendor) {
    redirect('/admin/vendors');
  }

  return <VendorEditClient vendor={vendor} />;
}
