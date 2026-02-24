import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

function formatDisplayName(user: { name: string | null; email: string } | null) {
  if (!user) return 'Kullanıcı';
  const raw = (user.name && user.name.trim()) ? user.name.trim() : user.email.split('@')[0];
  return raw || 'Kullanıcı';
}

async function userHasPurchasedProduct(userId: string, productId: string) {
  const item = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
      },
    },
    select: { id: true },
  });
  return Boolean(item);
}

// GET: Ürün yorumlarını getir (herkes okuyabilir). Eğer oturum varsa canReview bilgisini de döndürür.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: productId } = await params;

    const [product, reviews] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId }, select: { id: true } }),
      prisma.review.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          userId: true,
        },
      }),
    ]);

    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    const total = reviews.length;
    const sumRatings = reviews.reduce((s: number, r: { rating: number }) => s + (Number(r.rating) || 0), 0);
    const averageRating = total > 0
      ? Math.round(((sumRatings / total) * 10)) / 10
      : 0;

    const userId = session?.user?.id;
    const isLoggedIn = Boolean(userId);

    let canReview = false;
    let hasReviewed = false;

    if (isLoggedIn && userId) {
      hasReviewed = reviews.some((r: { userId: string }) => r.userId === userId);
      canReview = !hasReviewed && await userHasPurchasedProduct(userId, productId);
    }

    return NextResponse.json({
      productId,
      averageRating,
      total,
      canReview,
      hasReviewed,
      reviews: reviews.map((r: { id: string; rating: number; comment: string; createdAt: Date; user: { name: string | null; email: string } | null }) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        userName: formatDisplayName(r.user),
      })),
    });
  } catch (error) {
    console.error('PRODUCT_REVIEWS_GET_ERROR:', error);
    return NextResponse.json(
      { error: 'Yorumlar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST: Yorum ekle (login + satın alma şartı)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: productId } = await params;
    const body = await request.json().catch(() => null);

    const ratingRaw = body?.rating;
    const commentRaw = body?.comment;

    const rating = Math.floor(Number(ratingRaw));
    const comment = typeof commentRaw === 'string' ? commentRaw.trim() : '';

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Puan 1 ile 5 arasında olmalıdır' }, { status: 400 });
    }

    if (!comment || comment.length < 3) {
      return NextResponse.json({ error: 'Yorum en az 3 karakter olmalıdır' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    const purchased = await userHasPurchasedProduct(session.user.id, productId);
    if (!purchased) {
      return NextResponse.json(
        { error: 'Yorum yapmak için ürünü satın almış olmanız gerekmektedir.' },
        { status: 403 }
      );
    }

    const created = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        comment,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    });

    revalidatePath(`/urun/${productId}`);

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    console.error('PRODUCT_REVIEWS_POST_ERROR:', error);

    const err = error as { code?: string };
    if (err?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Bu ürün için zaten yorum yaptınız.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Yorum gönderilirken hata oluştu' },
      { status: 500 }
    );
  }
}
