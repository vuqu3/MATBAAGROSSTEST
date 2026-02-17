import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') ?? '10', 10) || 10));
  const skip = (page - 1) * pageSize;

  // Sadece bu satıcıya ait ürünler (vendorId = currentVendor.id)
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { vendorId: vendor.id },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.product.count({ where: { vendorId: vendor.id } }),
  ]);

  return NextResponse.json({ products, total, page, pageSize });
}
