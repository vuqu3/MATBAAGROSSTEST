import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendAdminDisputeNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as any;
    const quoteId = typeof body?.quoteId === 'string' ? body.quoteId.trim() : '';
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : '';

    if (!quoteId) {
      return NextResponse.json({ error: 'quoteId zorunlu' }, { status: 400 });
    }
    if (!reason) {
      return NextResponse.json({ error: 'Sorun tipi zorunlu' }, { status: 400 });
    }
    if (!description || description.length < 5) {
      return NextResponse.json({ error: 'Açıklama en az 5 karakter olmalıdır' }, { status: 400 });
    }

    const offer = await prisma.premiumQuoteOffer.findUnique({
      where: { id: quoteId },
      select: {
        id: true,
        vendorId: true,
        isDisputed: true,
        status: true,
        request: { select: { id: true, userId: true, status: true } },
        vendor: { select: { ownerId: true } },
      },
    });

    if (!offer || offer.request.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const isPaidOrProcessing = offer.status === 'PAID' || offer.request.status === 'PROCESSING';
    if (!isPaidOrProcessing) {
      return NextResponse.json({ error: 'Bu işlem için anlaşmazlık oluşturulamaz' }, { status: 400 });
    }

    if (offer.isDisputed) {
      return NextResponse.json({ error: 'Bu teklif için zaten anlaşmazlık talebi oluşturulmuş' }, { status: 409 });
    }

    const systemText =
      '🚨 DİKKAT: Bu sipariş için anlaşmazlık talebi oluşturulmuştur. Matbaagross yönetimi (Hakem) konuyu inceleyerek en kısa sürede taraflarla iletişime geçecektir. Ödeme havuzda bekletilmektedir.';

    const created = await prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.create({
        data: {
          quoteId: offer.id,
          customerId: session.user.id,
          sellerId: offer.vendorId,
          reason,
          description,
          status: 'OPEN',
        },
        select: { id: true, quoteId: true, status: true, createdAt: true },
      });

      await tx.premiumQuoteOffer.update({
        where: { id: offer.id },
        data: { isDisputed: true },
        select: { id: true },
      });

      // System message into shared chat
      await tx.quoteMessage.create({
        data: {
          quoteId: offer.id,
          senderId: offer.vendor.ownerId,
          receiverId: session.user.id,
          type: 'TEXT',
          content: systemText,
          isSystemMessage: true,
        },
        select: { id: true },
      });

      return dispute;
    });

    // Fire-and-forget email to admin
    (async () => {
      try {
        await sendAdminDisputeNotification({ quoteId: offer.id, reason, description });
      } catch (err) {
        console.error('DISPUTE_ADMIN_EMAIL_ERROR:', err);
      }
    })();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('DISPUTE_CREATE_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
