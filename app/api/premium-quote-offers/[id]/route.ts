import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PremiumQuoteOfferStatus, PremiumQuoteRequestStatus } from '@prisma/client';

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await ctx.params;

    const body = (await request.json().catch(() => ({}))) as any;
    const action = typeof body?.action === 'string' ? body.action.trim().toUpperCase() : '';

    if (action !== 'ACCEPT' && action !== 'REJECT') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const offer = await prisma.premiumQuoteOffer.findUnique({
      where: { id },
      select: { id: true, requestId: true, status: true },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const ownerRequest = await prisma.premiumQuoteRequest.findFirst({
      where: { id: offer.requestId, userId: session.user.id },
      select: { id: true },
    });

    if (!ownerRequest) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'REJECT') {
      const updated = await prisma.premiumQuoteOffer.update({
        where: { id },
        data: { status: PremiumQuoteOfferStatus.REJECTED },
        select: { id: true, status: true },
      });
      return NextResponse.json(updated);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const offerUpdated = await tx.premiumQuoteOffer.update({
        where: { id },
        data: { status: PremiumQuoteOfferStatus.ACCEPTED },
        select: { id: true, status: true, requestId: true },
      });

      await tx.premiumQuoteRequest.update({
        where: { id: offerUpdated.requestId },
        data: { status: PremiumQuoteRequestStatus.QUOTED },
      });

      return offerUpdated;
    });

    return NextResponse.json({ id: updated.id, status: updated.status });
  } catch (error) {
    console.error('PREMIUM_QUOTE_OFFER_PATCH_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
