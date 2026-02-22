import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Tek ürün getir (sadece satıcının kendi ürünü)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { ownerId: session.user.id },
      select: { id: true },
    });
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        id,
        vendorId: vendor.id,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        variants: {
          select: { id: true, name: true, price: true, stock: true },
          orderBy: { price: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Seller Product GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Ürün güncelle (sadece satıcının kendi ürünü)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { ownerId: session.user.id },
      select: { id: true },
    });
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const { id } = await params;
    const body = await request.json();

    // Ürünün sahibi olduğunu kontrol et
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        vendorId: vendor.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    // Güncellenebilir alanlar
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.basePrice !== undefined) updateData.basePrice = body.basePrice;
    if (body.compareAtPrice !== undefined) updateData.compareAtPrice = body.compareAtPrice;
    if (body.unitPrice !== undefined) updateData.unitPrice = body.unitPrice === null ? null : Number(body.unitPrice);
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.width !== undefined) updateData.width = body.width;
    if (body.height !== undefined) updateData.height = body.height;
    if (body.depth !== undefined) updateData.depth = body.depth;
    if (body.weight !== undefined) updateData.weight = body.weight;
    if (body.desi !== undefined) updateData.desi = body.desi;

    // Varyasyonları işle: gelen dizi varsa mevcut varyasyonları sil, yenilerini ekle
    const hasVariants = Array.isArray(body.variants);
    const validVariants = hasVariants
      ? (body.variants as { name?: string; price?: unknown; stock?: unknown }[])
          .filter((v) => v.name?.trim() && !Number.isNaN(Number(v.price)))
          .map((v) => ({
            name: String(v.name).trim(),
            price: Number(v.price),
            stock: Math.max(0, parseInt(String(v.stock ?? 0), 10) || 0),
          }))
      : [];

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
        ...(hasVariants && {
          variants: {
            deleteMany: {},
            create: validVariants,
          },
        }),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: {
          select: { id: true, name: true, price: true, stock: true },
          orderBy: { price: 'asc' },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Seller Product PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Ürün sil (sadece satıcının kendi ürünü)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { ownerId: session.user.id },
      select: { id: true },
    });
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const { id } = await params;

    // Ürünün sahibi olduğunu kontrol et
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        vendorId: vendor.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    // Ürünü sil
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Seller Product DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
