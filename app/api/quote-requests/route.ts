import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await auth().catch(() => null);

    const body = (await request.json().catch(() => ({}))) as any;

    const requestNo = typeof body?.requestNo === 'string' ? body.requestNo.trim() : '';
    const productId = typeof body?.productId === 'string' ? body.productId.trim() : '';
    const productName = typeof body?.productName === 'string' ? body.productName.trim() : '';
    const quantityRaw = body?.quantity;
    const description = typeof body?.description === 'string' ? body.description.trim() : '';
    const technicalDetails = typeof body?.technicalDetails === 'string' ? body.technicalDetails.trim() : '';
    const fileUrl = typeof body?.fileUrl === 'string' ? body.fileUrl.trim() : '';

    const quantity = Number(quantityRaw);

    if (!requestNo) {
      return NextResponse.json({ error: 'Talep numarası zorunlu' }, { status: 400 });
    }
    if (!productName) {
      return NextResponse.json({ error: 'Ürün adı zorunlu' }, { status: 400 });
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json({ error: 'Geçerli bir adet girin' }, { status: 400 });
    }
    if (!description) {
      return NextResponse.json({ error: 'Açıklama zorunlu' }, { status: 400 });
    }

    const created = await prisma.premiumQuoteRequest.create({
      data: {
        requestNo,
        userId: session?.user?.id ?? null,
        productId: productId || null,
        productName,
        quantity: Math.floor(quantity),
        description,
        technicalDetails: technicalDetails || null,
        fileUrl: fileUrl || null,
      },
      select: {
        id: true,
        requestNo: true,
        createdAt: true,
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error('QUOTE_REQUEST_CREATE_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
