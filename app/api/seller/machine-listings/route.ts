import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MachineCondition, MachineListingStatus } from '@prisma/client';

export async function GET() {
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

  // Satıcının makine ilanlarını getir
  const listings = await prisma.machineListing.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ listings });
}

export async function POST(request: Request) {
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

  const body = await request.json();
  const {
    title,
    description,
    price,
    category,
    brand,
    model,
    year,
    condition,
    location,
    specifications,
    contactPhone,
    contactEmail,
    expiresAt,
  } = body;

  if (!title || !description || !category || !location || !contactPhone || !contactEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const listing = await prisma.machineListing.create({
      data: {
        title,
        description,
        price: price || null,
        category,
        brand: brand || null,
        model: model || null,
        year: year || null,
        condition: condition as MachineCondition,
        location,
        specifications: specifications ? JSON.parse(specifications) : null,
        contactInfo: {
          phone: contactPhone,
          email: contactEmail,
        },
        expiresAt: new Date(expiresAt),
        status: MachineListingStatus.ACTIVE,
        vendorId: vendor.id,
      },
    });

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Error creating machine listing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
