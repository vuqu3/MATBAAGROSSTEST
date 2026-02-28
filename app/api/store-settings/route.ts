import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default' },
      select: { shippingFee: true, freeShippingThreshold: true },
    });

    return NextResponse.json(
      settings ?? {
        shippingFee: 25,
        freeShippingThreshold: 1500,
      }
    );
  } catch (error) {
    console.error('STORE_SETTINGS_GET_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const shippingFeeRaw = (body as any)?.shippingFee;
    const freeShippingThresholdRaw = (body as any)?.freeShippingThreshold;

    const shippingFee = Number(shippingFeeRaw);
    const freeShippingThreshold = Number(freeShippingThresholdRaw);

    if (!Number.isFinite(shippingFee) || shippingFee < 0) {
      return NextResponse.json({ error: 'Geçerli bir kargo ücreti girin' }, { status: 400 });
    }
    if (!Number.isFinite(freeShippingThreshold) || freeShippingThreshold < 0) {
      return NextResponse.json({ error: 'Geçerli bir ücretsiz kargo barajı girin' }, { status: 400 });
    }

    const updated = await prisma.storeSettings.upsert({
      where: { id: 'default' },
      update: { shippingFee, freeShippingThreshold },
      create: { id: 'default', shippingFee, freeShippingThreshold },
      select: { shippingFee: true, freeShippingThreshold: true },
    });

    revalidatePath('/');
    revalidatePath('/sepetim');
    revalidatePath('/sepetim/onay');
    revalidatePath('/admin/settings/shipping');

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Kargo Ayarı Kayıt Hatası:', {
      error,
      message: error instanceof Error ? error.message : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
