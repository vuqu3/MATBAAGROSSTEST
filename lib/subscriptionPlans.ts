import { prisma } from '@/lib/prisma';

export const DEFAULT_SUBSCRIPTION_PLANS = [
  { name: '1 Aylık', durationDays: 30, price: 399 },
  { name: '3 Aylık', durationDays: 90, price: 999 },
  { name: '1 Yıllık', durationDays: 365, price: 4299 },
] as const;

export async function ensureSubscriptionPlans() {
  // First: best-effort bulk insert for empty DBs.
  await prisma.subscriptionPlan.createMany({
    data: DEFAULT_SUBSCRIPTION_PLANS.map((p) => ({
      name: p.name,
      durationDays: p.durationDays,
      price: p.price,
      isActive: true,
    })),
    skipDuplicates: true,
  }).catch(() => null);

  // Then: ensure defaults are enforced (name/price/isActive)
  for (const plan of DEFAULT_SUBSCRIPTION_PLANS) {
    await prisma.subscriptionPlan.upsert({
      where: { durationDays: plan.durationDays },
      update: {
        name: plan.name,
        price: plan.price,
        isActive: true,
      },
      create: {
        name: plan.name,
        durationDays: plan.durationDays,
        price: plan.price,
        isActive: true,
      },
      select: { id: true },
    });
  }

  // Return current plans from DB
  return prisma.subscriptionPlan.findMany({
    orderBy: { durationDays: 'asc' },
    select: { id: true, name: true, durationDays: true, price: true, isActive: true },
  });
}
