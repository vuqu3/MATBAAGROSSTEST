import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Tek ürün getir
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Ürün güncelle
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    const rawStock = body.stockQuantity ?? body.stock;
    const stockNumRaw = rawStock !== undefined && rawStock !== null
      ? parseInt(String(rawStock), 10)
      : (product.productType === 'READY' ? Number(product.stockQuantity ?? product.stock ?? 0) : 0);
    const stockNum = typeof stockNumRaw === 'number' && Number.isFinite(stockNumRaw) ? stockNumRaw : 0;
    const validStock = Math.max(0, stockNum);

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.sku !== undefined) data.sku = String(body.sku).trim();
    if (body.description !== undefined) data.description = body.description ? String(body.description).trim() : null;
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl && String(body.imageUrl).trim() ? String(body.imageUrl).trim() : null;
    if (body.categoryId !== undefined) data.categoryId = body.categoryId;
    if (body.basePrice !== undefined) data.basePrice = parseFloat(String(body.basePrice)) || 0;
    if (body.purchasePrice !== undefined) data.purchasePrice = body.purchasePrice != null ? parseFloat(String(body.purchasePrice)) : null;
    if (body.buyPrice !== undefined) data.buyPrice = body.buyPrice != null ? parseFloat(String(body.buyPrice)) : null;
    if (body.salePrice !== undefined) data.salePrice = body.salePrice != null ? parseFloat(String(body.salePrice)) : null;
    if (body.taxRate !== undefined) data.taxRate = parseFloat(String(body.taxRate)) || 20;
    if (body.supplier !== undefined) data.supplier = body.supplier ? String(body.supplier).trim() : null;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.isPublished !== undefined) data.isPublished = Boolean(body.isPublished);
    if (body.dynamicAttributes !== undefined) data.dynamicAttributes = body.dynamicAttributes as any;
    if (body.attributes !== undefined) data.attributes = body.attributes as any;
    if (body.vendorName !== undefined) data.vendorName = typeof body.vendorName === 'string' && body.vendorName.trim() ? body.vendorName.trim() : 'MatbaaGross';
    if (body.vendorId !== undefined) data.vendorId = body.vendorId && typeof body.vendorId === 'string' && body.vendorId.trim() ? body.vendorId.trim() : null;
    if (body.images !== undefined) {
      const arr = Array.isArray(body.images) ? body.images : [];
      data.images = (arr.filter((u: unknown) => typeof u === 'string' && u.trim().length > 0).slice(0, 5)) as any;
    }
    if (body.highlights !== undefined) data.highlights = (body.highlights && typeof body.highlights === 'object' ? body.highlights : undefined) as any;
    if (body.descriptionDetail !== undefined) data.descriptionDetail = (body.descriptionDetail && typeof body.descriptionDetail === 'object' ? body.descriptionDetail : undefined) as any;
    if (body.relatedProducts !== undefined) data.relatedProducts = (Array.isArray(body.relatedProducts) ? body.relatedProducts.slice(0, 20) : undefined) as any;

    if (body.status !== undefined && ['PENDING', 'APPROVED', 'REJECTED'].includes(String(body.status))) {
      data.status = body.status as 'PENDING' | 'APPROVED' | 'REJECTED';
      if (data.status === 'APPROVED') {
        data.isPublished = true;
      } else if (data.status === 'REJECTED' || data.status === 'PENDING') {
        data.isPublished = false;
      }
    }

    if (product.productType === 'READY') {
      data.stock = validStock;
      data.stockQuantity = validStock;
    } else {
      if (body.minOrderQuantity !== undefined) data.minOrderQuantity = body.minOrderQuantity != null ? parseInt(String(body.minOrderQuantity), 10) : null;
      if (body.productionDays !== undefined) data.productionDays = body.productionDays != null ? parseInt(String(body.productionDays), 10) : null;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: data as Parameters<typeof prisma.product.update>[0]['data'],
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error('Product PATCH error:', error);
    const err = error as { code?: string };
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Bu SKU zaten kullanılıyor' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Ürünü sil
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Ürün var mı kontrol et
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    // Ürünü sil
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Ürün başarıyla silindi' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Product DELETE error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
