import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PremiumQuoteOfferStatus } from '@prisma/client';
import { resolveVendorForSession } from '@/lib/getMatbaaGrossVendor';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendor = await resolveVendorForSession(session.user.id, session.user.role);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const offers = await prisma.premiumQuoteOffer.findMany({
      where: {
        vendorId: vendor.id,
        status: PremiumQuoteOfferStatus.PAID,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        requestId: true,
        price: true,
        unitPrice: true,
        totalPrice: true,
        deliveryTime: true,
        note: true,
        status: true,
        createdAt: true,
        request: {
          select: {
            requestNo: true,
            productName: true,
            quantity: true,
            description: true,
            technicalDetails: true,
            fileUrl: true,
            contactName: true,
            contactEmail: true,
            contactPhone: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ offers });
  } catch (error) {
    console.error('SELLER_APPROVED_PREMIUM_OFFERS_GET_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
