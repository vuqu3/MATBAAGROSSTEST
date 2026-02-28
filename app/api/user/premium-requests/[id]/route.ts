import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await ctx.params;

    const request = await prisma.premiumQuoteRequest.findFirst({
      where: { id, userId: session.user.id },
      select: {
        id: true,
        requestNo: true,
        productId: true,
        productName: true,
        quantity: true,
        description: true,
        technicalDetails: true,
        fileUrl: true,
        status: true,
        createdAt: true,
        offers: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            requestId: true,
            vendorId: true,
            price: true,
            unitPrice: true,
            totalPrice: true,
            deliveryTime: true,
            note: true,
            status: true,
            createdAt: true,
            vendor: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error('USER_PREMIUM_REQUEST_DETAIL_GET_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
