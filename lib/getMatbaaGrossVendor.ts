import { prisma } from '@/lib/prisma';

/**
 * Returns the MatbaaGross vendor record.
 * Lookup order:
 *  1. MATBAAGROSS_VENDOR_ID env var (fastest — set this in .env)
 *  2. Vendor whose owner has role ADMIN
 *  3. First vendor in the database (last resort)
 */
export async function getMatbaaGrossVendor() {
  const envId = process.env.MATBAAGROSS_VENDOR_ID;
  if (envId) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: envId },
      select: { id: true, name: true, slug: true, commissionRate: true, balance: true },
    });
    if (vendor) return vendor;
  }

  // Fallback: vendor owned by an ADMIN user
  const adminVendor = await prisma.vendor.findFirst({
    where: { owner: { role: 'ADMIN' } },
    select: { id: true, name: true, slug: true, commissionRate: true, balance: true },
  });
  if (adminVendor) return adminVendor;

  // Last resort: first vendor
  return prisma.vendor.findFirst({
    select: { id: true, name: true, slug: true, commissionRate: true, balance: true },
  });
}

/**
 * Resolves the vendor for a session user.
 * - ADMIN → returns MatbaaGross vendor
 * - SELLER → returns their own vendor by ownerId
 * Returns null if not found.
 */
export async function resolveVendorForSession(
  userId: string,
  role: string,
  select: Record<string, boolean> = { id: true }
) {
  if (role === 'ADMIN') {
    return getMatbaaGrossVendor();
  }
  return prisma.vendor.findUnique({
    where: { ownerId: userId },
    select,
  });
}
