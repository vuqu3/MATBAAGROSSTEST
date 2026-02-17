import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        userType: true,
        companyName: true,
        taxOffice: true,
        taxNumber: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phoneNumber, companyName, taxOffice, taxNumber } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = String(name).trim() || null;
    if (phoneNumber !== undefined) data.phoneNumber = String(phoneNumber).trim() || null;
    if (companyName !== undefined) data.companyName = String(companyName).trim() || null;
    if (taxOffice !== undefined) data.taxOffice = String(taxOffice).trim() || null;
    if (taxNumber !== undefined) data.taxNumber = String(taxNumber).trim() || null;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: data as Parameters<typeof prisma.user.update>[0]['data'],
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        userType: true,
        companyName: true,
        taxOffice: true,
        taxNumber: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
