import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { QuoteRequestStatus, BidStatus } from '@prisma/client';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  // Bu satıcının verdiği teklifleri getir
  const quotes = await prisma.bid.findMany({
    where: { vendorId: vendor.id },
    include: {
      quoteRequest: {
        select: {
          id: true,
          requestNo: true,
          productGroup: true,
          requestSummary: true,
          technicalDetails: true,
          quantity: true,
          deadlineExpectation: true,
          expiresAt: true,
          attachment: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Açık talepleri getir (teklif verilebilecekler)
  const openRequests = await prisma.quoteRequest.findMany({
    where: {
      expiresAt: { gt: new Date() },
      status: QuoteRequestStatus.OPEN, // Sadece açık talepler
    },
    orderBy: { createdAt: 'desc' },
  });

  // Bu satıcının hangi taleplere teklif verdiğini kontrol et
  const vendorQuoteRequestIds = new Set(quotes.map((q: any) => q.requestId));

  return NextResponse.json({
    quotes: quotes.map((q: any) => ({
      id: q.id,
      requestNo: q.quoteRequest.requestNo,
      requestId: q.requestId,
      vendorId: q.vendorId,
      price: q.price,
      deliveryDays: q.deliveryDays,
      sellerNote: q.sellerNote,
      status: q.status,
      createdAt: q.createdAt,
    })),
    requests: openRequests.map((r: any) => ({
      id: r.id,
      requestNo: r.requestNo,
      productTitle: r.productTitle,
      productGroup: r.productGroup,
      requestSummary: r.requestSummary,
      technicalDetails: r.technicalDetails,
      quantity: r.quantity,
      deadlineExpectation: r.deadlineExpectation,
      attachment: r.attachment,
      expiresAt: r.expiresAt.toISOString(),
      hasQuoted: vendorQuoteRequestIds.has(r.id), // Bu satıcı teklif vermiş mi?
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  const body = await request.json();
  const { requestId, price, deliveryDays, sellerNote } = body;

  if (!requestId || !price || !deliveryDays) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Talebin açık olduğunu kontrol et
  const quoteRequest = await prisma.quoteRequest.findUnique({
    where: { id: requestId },
  });
  if (!quoteRequest || quoteRequest.status !== QuoteRequestStatus.OPEN || quoteRequest.expiresAt <= new Date()) {
    return NextResponse.json({ error: 'Request not available' }, { status: 400 });
  }

  // Bu satıcının bu talepe zaten teklif verip vermediğini kontrol et
  const existingQuote = await prisma.bid.findFirst({
    where: {
      vendorId: vendor.id,
      requestId: requestId,
    },
  });
  if (existingQuote) {
    return NextResponse.json({ error: 'Already quoted' }, { status: 400 });
  }

  // Yeni teklif oluştur
  const quote = await prisma.bid.create({
    data: {
      vendorId: vendor.id,
      requestId: requestId,
      price: price,
      deliveryDays: deliveryDays,
      sellerNote: sellerNote || null,
      status: BidStatus.OFFER_RECEIVED,
    },
    include: {
      quoteRequest: {
        select: {
          requestNo: true,
          productGroup: true,
        },
      },
    },
  });

  return NextResponse.json({
    id: quote.id,
    requestNo: quote.quoteRequest.requestNo,
    requestId: quote.requestId,
    vendorId: quote.vendorId,
    price: quote.price,
    deliveryDays: quote.deliveryDays,
    sellerNote: quote.sellerNote,
    status: quote.status,
    createdAt: quote.createdAt,
  });
}
