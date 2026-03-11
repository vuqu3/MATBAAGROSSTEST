import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resolveVendorForSession } from '@/lib/getMatbaaGrossVendor';

function sanitizeSlug(raw: string) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-+|\-+$/g, '');
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendor = await resolveVendorForSession(session.user.id, session.user.role).catch(() => null);
    const vendorId: string | null = vendor ? String((vendor as any).id) : null;
    if (!vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existing = await prisma.sellerProfile.findUnique({
      where: { vendorId },
      select: {
        id: true,
        vendorId: true,
        slug: true,
        storeName: true,
        about: true,
        address: true,
        contactPhone: true,
        contactEmail: true,
        logoUrl: true,
        bannerUrl: true,
        machinePark: true,
        showcase: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const vendorRow = await prisma.vendor.findUnique({ where: { id: vendorId }, select: { id: true, name: true, slug: true } });
    if (!vendorRow) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({
      vendor: vendorRow,
      profile: existing,
    });
  } catch (error) {
    console.error('SELLER_STORE_PROFILE_GET_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendor = await resolveVendorForSession(session.user.id, session.user.role).catch(() => null);
    const vendorId: string | null = vendor ? String((vendor as any).id) : null;
    if (!vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const vendorRow = await prisma.vendor.findUnique({ where: { id: vendorId }, select: { id: true, name: true, slug: true } });
    if (!vendorRow) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as any;
    const storeName = typeof body?.storeName === 'string' ? body.storeName.trim() : '';
    const slugRaw = typeof body?.slug === 'string' ? body.slug.trim() : '';
    const about = typeof body?.about === 'string' ? body.about.trim() : '';
    const address = typeof body?.address === 'string' ? body.address.trim() : '';
    const contactPhone = typeof body?.contactPhone === 'string' ? body.contactPhone.trim() : '';
    const contactEmail = typeof body?.contactEmail === 'string' ? body.contactEmail.trim() : '';
    const logoUrl = typeof body?.logoUrl === 'string' ? body.logoUrl.trim() : '';
    const bannerUrl = typeof body?.bannerUrl === 'string' ? body.bannerUrl.trim() : '';
    const machinePark = body?.machinePark;
    const showcase = body?.showcase;

    if (!storeName) {
      return NextResponse.json({ error: 'Mağaza adı zorunlu' }, { status: 400 });
    }

    const desiredSlug = sanitizeSlug(slugRaw || vendorRow.slug || storeName);
    if (!desiredSlug) {
      return NextResponse.json({ error: 'Geçerli bir slug gerekli' }, { status: 400 });
    }

    const conflict = await prisma.sellerProfile.findFirst({
      where: { slug: desiredSlug, vendorId: { not: vendorId } },
      select: { id: true },
    });
    if (conflict) {
      return NextResponse.json({ error: 'Bu slug başka bir mağaza tarafından kullanılıyor' }, { status: 409 });
    }

    const updated = await prisma.sellerProfile.upsert({
      where: { vendorId },
      create: {
        vendorId,
        slug: desiredSlug,
        storeName,
        about: about || null,
        address: address || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
        machinePark: machinePark ?? null,
        showcase: showcase ?? null,
      },
      update: {
        slug: desiredSlug,
        storeName,
        about: about || null,
        address: address || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
        machinePark: machinePark ?? null,
        showcase: showcase ?? null,
      },
      select: {
        id: true,
        vendorId: true,
        slug: true,
        storeName: true,
        about: true,
        address: true,
        contactPhone: true,
        contactEmail: true,
        logoUrl: true,
        bannerUrl: true,
        machinePark: true,
        showcase: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error('SELLER_STORE_PROFILE_PUT_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
