import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getMatbaaGrossVendor } from '@/lib/getMatbaaGrossVendor';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ADMIN: return the MatbaaGross vendor directly
  if (session.user.role === 'ADMIN') {
    const vendor = await getMatbaaGrossVendor();
    if (!vendor) {
      return NextResponse.json({ error: 'MatbaaGross vendor not found' }, { status: 404 });
    }
    return NextResponse.json(
      { vendor },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      applicationStatus: true,
      taxPlateUrl: true,
      tradeRegistryUrl: true,
      signatureCircularUrl: true,
      identityDocumentUrl: true,
      companyDetails: true,
    } as any,
  });

  const vendor = await prisma.vendor.findUnique({
    where: { ownerId: session.user.id },
    select: {
      id: true,
      name: true,
      slug: true,
      commissionRate: true,
      balance: true,
      subscriptionStatus: true,
      subscriptionEndsAt: true,
      isBlocked: true,
      canAddRetailProducts: true,
    } as any,
  });

  if (!vendor) {
    if (user?.role === 'SELLER') {
      return NextResponse.json(
        { vendor: null, applicationStatus: user.applicationStatus, documents: user },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        },
      );
    }
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  return NextResponse.json(
    { vendor, applicationStatus: user?.applicationStatus ?? null },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    },
  );
}
