'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

function slugify(input: string) {
  const s = String(input || '')
    .trim()
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return s || 'satici';
}

async function uniqueVendorSlug(base: string) {
  for (let i = 0; i < 20; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const exists = await prisma.vendor.findUnique({ where: { slug }, select: { id: true } });
    if (!exists) return slug;
  }
  return `${base}-${Date.now()}`;
}

async function uniqueSellerProfileSlug(base: string) {
  for (let i = 0; i < 20; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const exists = await (prisma as any).sellerProfile.findUnique({ where: { slug }, select: { id: true } });
    if (!exists) return slug;
  }
  return `${base}-${Date.now()}`;
}

export type QuickAddSellerState = {
  ok: boolean;
  message?: string;
  error?: string;
};

export async function quickAddSeller(_: QuickAddSellerState, formData: FormData): Promise<QuickAddSellerState> {
  const session = await auth().catch(() => null);
  if (!session || session.user.role !== 'ADMIN') {
    return { ok: false, error: 'Yetkisiz işlem' };
  }

  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '').trim();

  if (!name) return { ok: false, error: 'Firma / Mağaza adı zorunludur.' };
  if (!email) return { ok: false, error: 'E-posta adresi zorunludur.' };
  if (!password) return { ok: false, error: 'Şifre zorunludur.' };
  if (password.length < 6) return { ok: false, error: 'Şifre en az 6 karakter olmalıdır.' };

  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existingUser) return { ok: false, error: 'Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var.' };

  const baseSlug = slugify(name);
  const vendorSlug = await uniqueVendorSlug(baseSlug);
  const profileSlug = await uniqueSellerProfileSlug(vendorSlug);

  const hashed = await bcrypt.hash(password, 10);
  const now = new Date();
  const subscriptionEndsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashed,
          name,
          role: 'SELLER',
          applicationStatus: 'APPROVED',
        } as any,
        select: { id: true },
      });

      const vendor = await tx.vendor.create({
        data: {
          name,
          slug: vendorSlug,
          ownerId: user.id,
          isBlocked: false,
          subscriptionStatus: 'ACTIVE',
          subscriptionEndsAt,
        } as any,
        select: { id: true },
      });

      await (tx as any).sellerProfile.create({
        data: {
          vendorId: vendor.id,
          slug: profileSlug,
          storeName: name,
        },
        select: { id: true },
      });
    });

    revalidatePath('/admin/vendors');
    revalidatePath('/seller-dashboard');

    return { ok: true, message: 'Satıcı başarıyla oluşturuldu ve onaylandı!' };
  } catch (err: any) {
    const msg = typeof err?.message === 'string' ? err.message : 'İşlem başarısız.';
    return { ok: false, error: msg };
  }
}
