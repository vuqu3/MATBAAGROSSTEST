import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureSubscriptionPlans } from '@/lib/subscriptionPlans';

export async function GET() {
  try {
    const session = await auth().catch(() => null);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await ensureSubscriptionPlans();

    let plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { durationDays: 'asc' },
      select: { id: true, name: true, durationDays: true, price: true },
    });

    if (!plans.length) {
      // Fallback: if isActive flags are inconsistent, return all plans to keep UI functional.
      await ensureSubscriptionPlans();
      plans = await prisma.subscriptionPlan.findMany({
        orderBy: { durationDays: 'asc' },
        select: { id: true, name: true, durationDays: true, price: true },
      });
    }

    return NextResponse.json({ plans });
  } catch (err) {
    const anyErr = err as any;
    console.error('SELLER_SUBSCRIPTION_PLANS_GET_ERROR:', anyErr);
    if (anyErr?.code === 'P2021') {
      return NextResponse.json(
        { error: 'Veritabanı tablosu eksik (subscription_plans). Lütfen migration/db push çalıştırın.' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: typeof anyErr?.message === 'string' ? anyErr.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
