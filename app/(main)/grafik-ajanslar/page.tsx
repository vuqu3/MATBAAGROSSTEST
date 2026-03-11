import { prisma } from '@/lib/prisma';
import SellerDirectoryClient, { type SellerDirectoryItem } from './SellerDirectoryClient';

async function getSellers(): Promise<SellerDirectoryItem[]> {
  const vendors = await prisma.vendor.findMany({
    where: {
      isBlocked: false,
      subscriptionStatus: { in: ['ACTIVE', 'TRIAL'] },
      profile: { isNot: null },
    } as any,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      profile: {
        select: {
          storeName: true,
          bannerUrl: true,
          logoUrl: true,
          machinePark: true,
          about: true,
          address: true,
          slug: true,
        },
      },
    },
  });

  return vendors.map((v) => ({
    vendorId: v.id,
    vendorName: v.name,
    vendorSlug: (v.profile?.slug || v.slug) as string,
    storeName: v.profile?.storeName ?? null,
    bannerUrl: v.profile?.bannerUrl ?? null,
    logoUrl: v.profile?.logoUrl ?? null,
    machinePark: v.profile?.machinePark ?? null,
    about: (v.profile as any)?.about ?? null,
    address: (v.profile as any)?.address ?? null,
  }));
}

export default async function GrafikAjanslarPage() {
  const items = await getSellers();
  return <SellerDirectoryClient initialItems={items} />;
}
