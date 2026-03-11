import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendNewRfqNotification } from '@/lib/email';
import { createPremiumQuoteRequestWithStandardNo } from '@/lib/rfqNo';

export async function POST(request: Request) {
  try {
    const session = await auth().catch(() => null);

    const body = (await request.json().catch(() => ({}))) as any;

    const productId = typeof body?.productId === 'string' ? body.productId.trim() : '';
    const productName = typeof body?.productName === 'string' ? body.productName.trim() : '';
    const preferredVendorId = typeof body?.preferredVendorId === 'string' ? body.preferredVendorId.trim() : '';
    const quantityRaw = body?.quantity;
    const description = typeof body?.description === 'string' ? body.description.trim() : '';
    const technicalDetails = typeof body?.technicalDetails === 'string' ? body.technicalDetails.trim() : '';
    const fileUrl = typeof body?.fileUrl === 'string' ? body.fileUrl.trim() : '';
    const contactName = typeof body?.contactName === 'string' ? body.contactName.trim() : '';
    const contactEmail = typeof body?.contactEmail === 'string' ? body.contactEmail.trim() : '';
    const contactPhone = typeof body?.contactPhone === 'string' ? body.contactPhone.trim() : '';

    const quantity = Number(quantityRaw);

    const isStorefrontSpecialQuote = !productId && Boolean(preferredVendorId);

    const dbProduct = productId
      ? await prisma.product.findUnique({
          where: { id: productId },
          select: {
            id: true,
            name: true,
            sku: true,
            category: { select: { id: true, name: true, slug: true, parent: { select: { id: true, name: true, slug: true } } } },
            description: true,
            productType: true,
            minOrderQuantity: true,
            productionDays: true,
            width: true,
            height: true,
            depth: true,
            weight: true,
            desi: true,
            highlights: true,
            dynamicAttributes: true,
            attributes: true,
            fileFormats: true,
            imageUrl: true,
            images: true,
          },
        })
      : null;

    if (!isStorefrontSpecialQuote) {
      if (!productId) {
        return NextResponse.json({ error: 'Ürün seçimi zorunlu' }, { status: 400 });
      }
      if (!dbProduct) {
        return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
      }
    }

    const finalProductName = String((dbProduct as any)?.name || productName || '').trim();
    if (!finalProductName) {
      return NextResponse.json({ error: 'Ürün adı zorunlu' }, { status: 400 });
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json({ error: 'Geçerli bir adet girin' }, { status: 400 });
    }
    if (dbProduct?.minOrderQuantity && quantity < dbProduct.minOrderQuantity) {
      return NextResponse.json(
        { error: `Bu ürün için minimum sipariş adedi ${dbProduct.minOrderQuantity} adettir.` },
        { status: 400 }
      );
    }
    if (!description) {
      return NextResponse.json({ error: 'Açıklama zorunlu' }, { status: 400 });
    }

    if (!contactEmail) {
      return NextResponse.json({ error: 'E-posta adresi zorunlu' }, { status: 400 });
    }
    if (!contactPhone) {
      return NextResponse.json({ error: 'Telefon numarası zorunlu' }, { status: 400 });
    }

    const stringifySpecs = (label: string, value: unknown) => {
      if (value === null || value === undefined) return null;
      if (typeof value === 'string' && !value.trim()) return null;
      return `${label}: ${typeof value === 'string' ? value.trim() : JSON.stringify(value)}`;
    };

    const productSpecsParts: string[] = [];
    if (dbProduct?.highlights && typeof dbProduct.highlights === 'object') {
      const entries = Object.entries(dbProduct.highlights as Record<string, unknown>)
        .filter(([k, v]) => typeof k === 'string' && k.trim() && v !== null && v !== undefined && String(v).trim())
        .map(([k, v]) => `${k}: ${String(v).trim()}`);
      if (entries.length) productSpecsParts.push(entries.join(', '));
    }
    if (dbProduct?.dynamicAttributes && typeof dbProduct.dynamicAttributes === 'object') {
      const entries = Object.entries(dbProduct.dynamicAttributes as Record<string, unknown>)
        .filter(([k, v]) => typeof k === 'string' && k.trim() && v !== null && v !== undefined && String(v).trim())
        .map(([k, v]) => `${k}: ${String(v).trim()}`);
      if (entries.length) productSpecsParts.push(entries.join(', '));
    }
    if (dbProduct?.attributes) {
      const s = stringifySpecs('Seçenekler', dbProduct.attributes);
      if (s) productSpecsParts.push(s);
    }

    const mergedTechnicalDetails = [
      description ? `Müşteri Notu: ${description}` : null,
      productSpecsParts.length ? `Sistem Notu (Ürün Özellikleri): ${productSpecsParts.join(' • ')}` : null,
      technicalDetails ? `Ek Teknik: ${technicalDetails}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const technicalSpecsSnapshot = dbProduct
      ? {
          product: {
            id: dbProduct.id,
            sku: dbProduct.sku,
            name: dbProduct.name,
            productUrl: `/urun/${encodeURIComponent(String(dbProduct.id))}`,
            imageUrl: dbProduct.imageUrl ?? (Array.isArray(dbProduct.images) ? (dbProduct.images as any[])[0] ?? null : null),
            category: dbProduct.category,
            description: dbProduct.description ?? null,
            productType: dbProduct.productType,
            minOrderQuantity: dbProduct.minOrderQuantity ?? null,
            productionDays: dbProduct.productionDays ?? null,
            dimensions: {
              width: dbProduct.width ?? null,
              height: dbProduct.height ?? null,
              depth: dbProduct.depth ?? null,
              weight: dbProduct.weight ?? null,
              desi: dbProduct.desi ?? null,
            },
          },
          highlights: dbProduct.highlights ?? null,
          dynamicAttributes: dbProduct.dynamicAttributes ?? null,
          attributes: dbProduct.attributes ?? null,
          fileFormats: dbProduct.fileFormats ?? null,
        }
      : {
          product: null,
          specialQuote: true,
          preferredVendorId: preferredVendorId || null,
        };

    const created = await createPremiumQuoteRequestWithStandardNo({
      userId: session?.user?.id ?? null,
      preferredVendorId: preferredVendorId || null,
      productId: productId || null,
      productName: finalProductName,
      referenceProductId: dbProduct?.id ?? null,
      technicalSpecs: technicalSpecsSnapshot,
      designFiles: fileUrl ? [fileUrl] : [],
      sampleImages: [],
      quantity: Math.floor(quantity),
      description,
      technicalDetails: mergedTechnicalDetails || null,
      fileUrl: fileUrl || null,
      contactName: contactName || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
    });

    // Fire-and-forget: notify all active vendors
    (async () => {
      try {
        const vendors = preferredVendorId
          ? await prisma.vendor.findMany({
              where: { id: preferredVendorId, isBlocked: false },
              select: { owner: { select: { email: true } } },
            })
          : await prisma.vendor.findMany({
              where: { isBlocked: false },
              select: { owner: { select: { email: true } } },
            });
        await Promise.allSettled(
          vendors.map((v) =>
            sendNewRfqNotification({
              to: v.owner.email,
              productName,
              quantity: Math.floor(quantity),
              requestNo: created.requestNo,
            })
          )
        );
      } catch (notifyErr) {
        console.error('[quote-requests] vendor notify error:', notifyErr);
      }
    })();

    return NextResponse.json(created);
  } catch (error) {
    console.error('QUOTE_REQUEST_CREATE_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
