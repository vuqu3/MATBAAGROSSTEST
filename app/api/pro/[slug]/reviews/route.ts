import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function formatDisplayName(user: { name: string | null; email: string } | null) {
  if (!user) return 'Kullanıcı';
  const raw = (user.name && user.name.trim()) ? user.name.trim() : user.email.split('@')[0];
  return raw || 'Kullanıcı';
}

export async function GET(_: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const s = String(slug || '').trim();
    if (!s) {
      return NextResponse.json({ error: 'slug gerekli' }, { status: 400 });
    }

    const profile = await prisma.sellerProfile.findUnique({
      where: { slug: s },
      select: { vendorId: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const reviews = await prisma.sellerReview.findMany({
      where: { sellerId: profile.vendorId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        customer: { select: { name: true, email: true } },
      },
      take: 200,
    });

    const total = reviews.length;
    const sum = reviews.reduce((s2, r) => s2 + (Number(r.rating) || 0), 0);
    const averageRating = total > 0 ? Math.round(((sum / total) * 10)) / 10 : 0;

    return NextResponse.json({
      sellerId: profile.vendorId,
      averageRating,
      total,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        customerName: formatDisplayName(r.customer),
      })),
    });
  } catch (error) {
    console.error('PRO_REVIEWS_GET_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
