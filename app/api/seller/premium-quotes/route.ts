import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PremiumQuoteRequestStatus, PremiumQuoteOfferStatus } from '@prisma/client';
import { resolveVendorForSession } from '@/lib/getMatbaaGrossVendor';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendor = await resolveVendorForSession(session.user.id, session.user.role).catch(() => null);
    const vendorId: string | null = vendor ? String((vendor as any).id) : null;
    const vendorOwnerId: string | null = vendor ? String((vendor as any).ownerId ?? '') : null;

    if (vendorId && vendorOwnerId) {
      const v = await prisma.vendor.findUnique({
        where: { id: vendorId },
        select: { subscriptionStatus: true, subscriptionEndsAt: true },
      });
      const endsAt = v?.subscriptionEndsAt ? new Date(v.subscriptionEndsAt).getTime() : null;
      const expiredByDate = endsAt ? endsAt <= Date.now() : true;
      const statusRaw = String(v?.subscriptionStatus ?? '').toUpperCase();
      const blockedByStatus = statusRaw === 'EXPIRED' || statusRaw === 'CANCELLED';
      if (blockedByStatus || expiredByDate) {
        return NextResponse.json({ error: 'Aboneliğinizin süresi dolmuş. Lütfen aboneliğinizi yenileyin.' }, { status: 403 });
      }
    }

    const offers = vendorId
      ? await prisma.premiumQuoteOffer.findMany({
          where: { vendorId },
          include: {
            request: {
              select: {
                id: true,
                requestNo: true,
                productName: true,
                quantity: true,
                status: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    const quotedRequestIds = new Set(offers.map((o) => o.requestId));

    const allRequests = vendorId
      ? await prisma.premiumQuoteRequest.findMany({
          where: {
            status: PremiumQuoteRequestStatus.PENDING,
            OR: [{ preferredVendorId: null }, { preferredVendorId: vendorId }],
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            requestNo: true,
            productId: true,
            productName: true,
            referenceProductId: true,
            technicalSpecs: true,
            quantity: true,
            description: true,
            technicalDetails: true,
            fileUrl: true,
            status: true,
            createdAt: true,
          },
        })
      : [];

    const poolRequests = allRequests.filter((r) => !quotedRequestIds.has(r.id));

    return NextResponse.json({
      offers: offers.map((o) => ({
        id: o.id,
        requestId: o.requestId,
        requestNo: o.request.requestNo,
        requestTitle: o.request.productName,
        requestStatus: o.request.status,
        price: o.price,
        unitPrice: o.unitPrice,
        totalPrice: o.totalPrice,
        deliveryTime: o.deliveryTime,
        note: o.note,
        status: o.status,
        createdAt: o.createdAt,
      })),
      requests: poolRequests.map((r) => ({
        id: r.id,
        requestNo: r.requestNo,
        productId: r.productId,
        productName: r.productName,
        referenceProductId: (r as any).referenceProductId ?? null,
        technicalSpecs: (r as any).technicalSpecs ?? null,
        quantity: r.quantity,
        description: r.description,
        technicalDetails: r.technicalDetails,
        fileUrl: r.fileUrl,
        status: r.status,
        createdAt: r.createdAt,
        hasQuoted: false,
      })),
    });
  } catch (error) {
    console.error('SELLER_PREMIUM_QUOTES_GET_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendor = await resolveVendorForSession(session.user.id, session.user.role);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as any;
    const requestId = typeof body?.requestId === 'string' ? body.requestId.trim() : '';
    const priceRaw = body?.price;
    const unitPriceRaw = body?.unitPrice;
    const totalPriceRaw = body?.totalPrice;
    const deliveryTime = typeof body?.deliveryTime === 'string' ? body.deliveryTime.trim() : '';
    const note = typeof body?.note === 'string' ? body.note.trim() : '';

    const unitPrice = unitPriceRaw === undefined || unitPriceRaw === null || unitPriceRaw === '' ? null : Number(unitPriceRaw);
    const totalPrice = totalPriceRaw === undefined || totalPriceRaw === null || totalPriceRaw === '' ? null : Number(totalPriceRaw);
    const price = totalPrice ?? Number(priceRaw);

    if (!requestId) {
      return NextResponse.json({ error: 'requestId zorunlu' }, { status: 400 });
    }
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'Geçerli bir fiyat girin' }, { status: 400 });
    }
    if (!deliveryTime) {
      return NextResponse.json({ error: 'Teslimat süresi zorunlu' }, { status: 400 });
    }

    if (unitPrice !== null && (!Number.isFinite(unitPrice) || unitPrice <= 0)) {
      return NextResponse.json({ error: 'Geçerli bir birim fiyat girin' }, { status: 400 });
    }
    if (totalPrice !== null && (!Number.isFinite(totalPrice) || totalPrice <= 0)) {
      return NextResponse.json({ error: 'Geçerli bir toplam fiyat girin' }, { status: 400 });
    }

    const qr = await prisma.premiumQuoteRequest.findUnique({
      where: { id: requestId },
      select: { id: true, status: true },
    });

    if (!qr || qr.status !== PremiumQuoteRequestStatus.PENDING) {
      return NextResponse.json({ error: 'Talep teklif verilebilir durumda değil' }, { status: 400 });
    }

    const existing = await prisma.premiumQuoteOffer.findFirst({
      where: { requestId, vendorId: vendor.id },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: 'Bu talebe zaten teklif verdiniz' }, { status: 400 });
    }

    const created = await prisma.premiumQuoteOffer.create({
      data: {
        requestId,
        vendorId: vendor.id,
        price,
        unitPrice,
        totalPrice: totalPrice ?? price,
        deliveryTime,
        note,
        status: PremiumQuoteOfferStatus.PENDING,
      },
      include: {
        request: {
          select: {
            requestNo: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: created.id,
      requestId: created.requestId,
      requestNo: created.request.requestNo,
      price: created.price,
      unitPrice: created.unitPrice,
      totalPrice: created.totalPrice,
      deliveryTime: created.deliveryTime,
      note: created.note,
      status: created.status,
      createdAt: created.createdAt,
    });
  } catch (error) {
    console.error('SELLER_PREMIUM_QUOTES_POST_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
