import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PremiumQuoteOfferStatus } from '@prisma/client';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await prisma.premiumQuoteRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
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
        updatedAt: true,
        _count: {
          select: {
            offers: {
              where: {
                status: {
                  in: [PremiumQuoteOfferStatus.PENDING, PremiumQuoteOfferStatus.PAID, PremiumQuoteOfferStatus.ACCEPTED, PremiumQuoteOfferStatus.REJECTED]
                }
              }
            }
          }
        },
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('USER_PREMIUM_REQUESTS_GET_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
