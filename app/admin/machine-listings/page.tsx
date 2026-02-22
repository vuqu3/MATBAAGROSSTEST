import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MachineListingsClient from './MachineListingsClient';

export default async function AdminMachineListingsPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/admin/login');

  // Tüm makine ilanlarını getir
  const listings = await prisma.machineListing.findMany({
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          slug: true,
          owner: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return <MachineListingsClient listings={listings} />;
}
