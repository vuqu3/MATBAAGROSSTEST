import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resolveVendorForSession } from '@/lib/getMatbaaGrossVendor';

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendor = await resolveVendorForSession(session.user.id, session.user.role).catch(() => null);
    const vendorId: string | null = vendor ? String((vendor as any).id) : null;
    if (!vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await ctx.params;
    const offerId = String(id || '').trim();
    if (!offerId) {
      return NextResponse.json({ error: 'Offer id gerekli' }, { status: 400 });
    }

    const offer = await prisma.premiumQuoteOffer.findFirst({
      where: { id: offerId, vendorId },
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
        request: {
          select: {
            id: true,
            requestNo: true,
            productName: true,
            referenceProductId: true,
            technicalSpecs: true,
            quantity: true,
            description: true,
            technicalDetails: true,
            fileUrl: true,
            status: true,
            createdAt: true,
            user: { select: { id: true, name: true } },
            contactName: true,
          },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ offer });
  } catch (error) {
    console.error('SELLER_PREMIUM_OFFER_DETAIL_GET_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
