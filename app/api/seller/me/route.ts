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
    return NextResponse.json({ vendor });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true, name: true, slug: true, commissionRate: true, balance: true },
  });

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  return NextResponse.json({ vendor });
}
