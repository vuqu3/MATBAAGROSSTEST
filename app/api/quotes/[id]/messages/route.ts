import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PremiumQuoteOfferStatus, PremiumQuoteRequestStatus } from '@prisma/client';

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const quoteId = String(id || '').trim();
    if (!quoteId) {
      return NextResponse.json({ error: 'quote id gerekli' }, { status: 400 });
    }

    const quote = await prisma.premiumQuoteOffer.findUnique({
      where: { id: quoteId },
      select: {
        id: true,
        requestId: true,
        vendor: { select: { ownerId: true } },
        request: { select: { userId: true } },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const me = session.user.id;
    const customerId = quote.request.userId;
    const sellerOwnerId = quote.vendor.ownerId;

    const isCustomer = !!customerId && customerId === me;
    const isSeller = sellerOwnerId === me;

    if (!isCustomer && !isSeller) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (isSeller) {
      const vendor = await prisma.vendor.findFirst({
        where: { ownerId: me },
        select: { subscriptionStatus: true, subscriptionEndsAt: true },
      });
      const endsAt = vendor?.subscriptionEndsAt ? new Date(vendor.subscriptionEndsAt).getTime() : null;
      const expiredByDate = endsAt ? endsAt <= Date.now() : true;
      const statusRaw = String(vendor?.subscriptionStatus ?? '').toUpperCase();
      const blockedByStatus = statusRaw === 'EXPIRED' || statusRaw === 'CANCELLED';
      if (blockedByStatus || expiredByDate) {
        return NextResponse.json({ error: 'Aboneliğinizin süresi dolmuş. Mesaj göndermek için yenileyin.' }, { status: 403 });
      }
    }

    const messages = await prisma.quoteMessage.findMany({
      where: { quoteId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        quoteId: true,
        senderId: true,
        receiverId: true,
        type: true,
        content: true,
        agreedPrice: true,
        agreedDeliveryDays: true,
        agreedDescription: true,
        isSystemMessage: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      quoteId,
      participants: {
        customerId: customerId ?? null,
        sellerId: sellerOwnerId,
        me,
      },
      messages,
    });
  } catch (error) {
    console.error('QUOTE_MESSAGES_GET_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const quoteId = String(id || '').trim();
    if (!quoteId) {
      return NextResponse.json({ error: 'quote id gerekli' }, { status: 400 });
    }

    const body = (await request.json().catch(() => ({}))) as any;
    const content = typeof body?.content === 'string' ? body.content.trim() : '';
    const typeRaw = typeof body?.type === 'string' ? body.type.trim().toUpperCase() : '';
    const isPaymentRequest = typeRaw === 'PAYMENT_REQUEST';

    const agreedPriceRaw = body?.agreedPrice;
    const agreedDeliveryDaysRaw = body?.agreedDeliveryDays;
    const agreedDescription = typeof body?.agreedDescription === 'string' ? body.agreedDescription.trim() : '';

    if (!isPaymentRequest && !content) {
      return NextResponse.json({ error: 'Mesaj boş olamaz' }, { status: 400 });
    }

    const quote = await prisma.premiumQuoteOffer.findUnique({
      where: { id: quoteId },
      select: {
        id: true,
        requestId: true,
        vendor: { select: { ownerId: true } },
        request: { select: { userId: true } },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const me = session.user.id;
    const customerId = quote.request.userId;
    const sellerOwnerId = quote.vendor.ownerId;

    const isCustomer = !!customerId && customerId === me;
    const isSeller = sellerOwnerId === me;

    if (!isCustomer && !isSeller) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (isPaymentRequest && !isSeller) {
      return NextResponse.json({ error: 'Sadece satıcı ödeme linki oluşturabilir' }, { status: 403 });
    }

    const receiverId = isCustomer ? sellerOwnerId : customerId;
    if (!receiverId) {
      return NextResponse.json({ error: 'Alıcı bulunamadı' }, { status: 400 });
    }

    const agreedPrice = agreedPriceRaw === undefined || agreedPriceRaw === null || agreedPriceRaw === '' ? NaN : Number(agreedPriceRaw);
    const agreedDeliveryDays = agreedDeliveryDaysRaw === undefined || agreedDeliveryDaysRaw === null || agreedDeliveryDaysRaw === ''
      ? NaN
      : parseInt(String(agreedDeliveryDaysRaw), 10);

    if (isPaymentRequest) {
      if (!Number.isFinite(agreedPrice) || agreedPrice <= 0) {
        return NextResponse.json({ error: 'Geçerli bir nihai tutar girin' }, { status: 400 });
      }
      if (!Number.isFinite(agreedDeliveryDays) || agreedDeliveryDays <= 0) {
        return NextResponse.json({ error: 'Geçerli bir üretim/teslimat süresi girin' }, { status: 400 });
      }
      if (!agreedDescription) {
        return NextResponse.json({ error: 'Açıklama zorunlu' }, { status: 400 });
      }
    }

    const created = await prisma.$transaction(async (tx) => {
      if (isPaymentRequest) {
        // Align offer fields so existing checkout page can be used
        await tx.premiumQuoteOffer.update({
          where: { id: quoteId },
          data: {
            status: PremiumQuoteOfferStatus.ACCEPTED,
            price: agreedPrice,
            totalPrice: agreedPrice,
            deliveryTime: `${agreedDeliveryDays} Gün`,
            note: agreedDescription,
          },
          select: { id: true },
        });

        await tx.premiumQuoteRequest.update({
          where: { id: quote.requestId },
          data: { status: PremiumQuoteRequestStatus.QUOTED },
          select: { id: true },
        });

        await tx.premiumQuoteOffer.updateMany({
          where: {
            requestId: quote.requestId,
            id: { not: quoteId },
            status: { notIn: [PremiumQuoteOfferStatus.REJECTED] },
          },
          data: { status: PremiumQuoteOfferStatus.REJECTED },
        });
      }

      const createdMsg = await tx.quoteMessage.create({
        data: {
          quoteId,
          senderId: me,
          receiverId,
          type: isPaymentRequest ? 'PAYMENT_REQUEST' : 'TEXT',
          content: isPaymentRequest ? 'Ödeme linki oluşturuldu.' : content,
          agreedPrice: isPaymentRequest ? agreedPrice : null,
          agreedDeliveryDays: isPaymentRequest ? agreedDeliveryDays : null,
          agreedDescription: isPaymentRequest ? agreedDescription : null,
        },
        select: {
          id: true,
          quoteId: true,
          senderId: true,
          receiverId: true,
          type: true,
          content: true,
          agreedPrice: true,
          agreedDeliveryDays: true,
          agreedDescription: true,
          isSystemMessage: true,
          createdAt: true,
        },
      });

      return createdMsg;
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error('QUOTE_MESSAGES_POST_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
