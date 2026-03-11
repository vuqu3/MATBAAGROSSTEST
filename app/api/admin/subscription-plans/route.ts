import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureSubscriptionPlans } from '@/lib/subscriptionPlans';

export async function GET() {
  const session = await auth().catch(() => null);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureSubscriptionPlans();

  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { durationDays: 'asc' },
    select: { id: true, name: true, durationDays: true, price: true, isActive: true, updatedAt: true },
  });

  return NextResponse.json({ plans });
}

export async function PATCH(req: Request) {
  const session = await auth().catch(() => null);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as any;
  const planId = typeof body?.id === 'string' ? body.id : '';
  const price = typeof body?.price === 'number' ? body.price : null;
  const name = typeof body?.name === 'string' ? body.name.trim() : null;

  if (!planId) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });
  if (price == null || !Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: 'Fiyat geçersiz' }, { status: 400 });
  }

  const updated = await prisma.subscriptionPlan.update({
    where: { id: planId },
    data: {
      price,
      ...(name ? { name } : {}),
    },
    select: { id: true, name: true, durationDays: true, price: true, isActive: true, updatedAt: true },
  });

  return NextResponse.json({ plan: updated });
}
