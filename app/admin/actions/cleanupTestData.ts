'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function cleanupTestData() {
  const session = await auth();
  if (!session?.user?.id || String(session.user.role ?? '').toUpperCase() !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  // Only delete transactional/test data. DO NOT touch: User, Product, Category, Vendor, SellerProfile, uploads/media.
  const result = await prisma.$transaction(async (tx) => {
    const quoteMessages = await tx.quoteMessage.deleteMany({});
    const premiumQuoteOffers = await tx.premiumQuoteOffer.deleteMany({});
    const premiumQuoteRequests = await tx.premiumQuoteRequest.deleteMany({});

    const bids = await tx.bid.deleteMany({});
    const quoteRequests = await tx.quoteRequest.deleteMany({});

    const orderItems = await tx.orderItem.deleteMany({});
    const orders = await tx.order.deleteMany({});

    return {
      quoteMessages: quoteMessages.count,
      premiumQuoteOffers: premiumQuoteOffers.count,
      premiumQuoteRequests: premiumQuoteRequests.count,
      bids: bids.count,
      quoteRequests: quoteRequests.count,
      orderItems: orderItems.count,
      orders: orders.count,
    };
  });

  return result;
}
