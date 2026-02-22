import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.trim();

    if (!code) {
      return NextResponse.json({ error: 'Sipariş numarası gerekli' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { barcode: code },
          { id: code },
        ],
      },
      select: {
        barcode: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        trackingNumber: true,
        shippingCompany: true,
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı. Lütfen sipariş numaranızı kontrol edin.' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('ORDER_TRACK_ERROR:', error);
    return NextResponse.json({ error: 'Bir hata oluştu, lütfen tekrar deneyin.' }, { status: 500 });
  }
}
