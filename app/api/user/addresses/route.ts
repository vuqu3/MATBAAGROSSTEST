import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Addresses GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!userExists) {
      return NextResponse.json(
        { error: 'Hesabınız veritabanında bulunamadı. Lütfen çıkış yapıp tekrar giriş yapın.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, title, city, district, line1, line2, postalCode } = body;

    const typeVal = type === 'BILLING' || type === 'SHIPPING' ? type : 'SHIPPING';
    if (!city || !line1) {
      return NextResponse.json(
        { error: 'Şehir ve adres satırı zorunludur' },
        { status: 400 }
      );
    }

    const address = await prisma.address.create({
      data: {
        userId: userExists.id,
        type: typeVal,
        title: title ? String(title).trim() : null,
        city: String(city).trim(),
        district: district ? String(district).trim() : null,
        line1: String(line1).trim(),
        line2: line2 ? String(line2).trim() : null,
        postalCode: postalCode ? String(postalCode).trim() : null,
      },
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error('Addresses POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
