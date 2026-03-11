import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const s = String(slug || '').trim();
    if (!s) {
      return NextResponse.json({ error: 'slug gerekli' }, { status: 400 });
    }

    const profile = await prisma.sellerProfile.findUnique({
      where: { slug: s },
      select: {
        id: true,
        slug: true,
        storeName: true,
        about: true,
        logoUrl: true,
        bannerUrl: true,
        machinePark: true,
        showcase: true,
        vendor: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const agg = await prisma.sellerReview.aggregate({
      where: { sellerId: profile.vendor.id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const averageRating = agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0;
    const total = agg._count.rating ?? 0;

    return NextResponse.json({
      profile: {
        id: profile.id,
        slug: profile.slug,
        storeName: profile.storeName,
        about: profile.about,
        logoUrl: profile.logoUrl,
        bannerUrl: profile.bannerUrl,
        machinePark: profile.machinePark,
        showcase: profile.showcase,
      },
      vendor: profile.vendor,
      rating: { averageRating, total },
    });
  } catch (error) {
    console.error('PRO_PROFILE_GET_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
