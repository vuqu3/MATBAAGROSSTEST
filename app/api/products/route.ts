import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Liste (ana sayfa: son 8) veya ids=id1,id2 ile belirli ürünler (benzer/önerilen için) veya admin için limit parametresi
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    const limitParam = searchParams.get('limit');
    const ids = idsParam ? idsParam.split(',').map((id) => id.trim()).filter(Boolean) : [];

    console.log('PRODUCTS_GET_REQUEST:', { idsParam, limitParam, idsLength: ids.length });

    if (ids.length > 0) {
      const products = await prisma.product.findMany({
        where: {
          id: { in: ids },
          isPublished: true,
          isActive: true,
          OR: [
            { vendorId: null },
            { vendor: { isBlocked: false } },
          ],
        },
        include: { category: { select: { id: true, name: true, slug: true } } },
      });
      const order = ids.reduce((acc: Record<string, number>, id, i) => { acc[id] = i; return acc; }, {});
      products.sort((a: { id: string }, b: { id: string }) => (order[a.id] ?? 99) - (order[b.id] ?? 99));
      return NextResponse.json(products);
    }

    // Admin için limit parametresi kontrolü
    if (limitParam) {
      const session = await auth();
      if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const limit = Math.min(100, Math.max(1, parseInt(limitParam, 10) || 50));
      const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
      const skip = (page - 1) * limit;

      console.log('PRODUCTS_GET_ADMIN:', { limit, page, skip });

      const products = await prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          basePrice: true,
          salePrice: true,
          compareAtPrice: true,
          isPublished: true,
          isActive: true,
          sku: true,
          productType: true,
          stock: true,
          stockQuantity: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      console.log('PRODUCTS_GET_ADMIN_SUCCESS:', { count: products.length });
      return NextResponse.json(products);
    }

    // Normal ana sayfa isteği
    const products = await prisma.product.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      where: {
        isPublished: true,
        isActive: true,
        OR: [
          { vendorId: null },
          { vendor: { isBlocked: false } },
        ],
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('PRODUCTS_GET_ERROR:', error);
    return NextResponse.json(
      { 
        error: 'Ürünler yüklenirken hata oluştu', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// POST: Yeni ürün oluştur (ADMIN veya SELLER)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SELLER')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const isSeller = session.user.role === 'SELLER';

    if (isSeller) {
      const vendor = await prisma.vendor.findUnique({
        where: { ownerId: session.user.id },
        select: { id: true, name: true, slug: true },
      });
      if (!vendor) {
        return NextResponse.json({ error: 'Satıcı hesabı bulunamadı' }, { status: 404 });
      }

      const {
        name,
        description,
        basePrice,
        stock,
        categoryId,
        imageUrl,
        images: bodyImages,
        variants: bodyVariants,
        unitPrice: bodyUnitPrice,
      } = body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Ürün adı zorunludur' }, { status: 400 });
      }
      if (!categoryId || typeof categoryId !== 'string') {
        return NextResponse.json({ error: 'Kategori seçimi zorunludur' }, { status: 400 });
      }
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return NextResponse.json({ error: 'Seçilen kategori bulunamadı' }, { status: 404 });
      }

      const priceNum = Number(basePrice);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        return NextResponse.json({ error: 'Geçerli bir fiyat giriniz' }, { status: 400 });
      }
      const stockNum = Math.max(0, parseInt(String(stock ?? 0), 10) || 0);

      const sku = `S-${vendor.slug}-${Date.now()}`;
      const imagesArr = Array.isArray(bodyImages) ? bodyImages : [];
      const imagesNormalized = imagesArr.filter((u): u is string => typeof u === 'string' && u.trim().length > 0).slice(0, 5);
      const imageUrlTrimmed = imageUrl && typeof imageUrl === 'string' && imageUrl.trim()
        ? imageUrl.trim()
        : (imagesNormalized[0] ?? null);

      const validVariants = Array.isArray(bodyVariants)
        ? bodyVariants
            .filter((v: { name?: string; price?: unknown }) => v.name?.trim() && !Number.isNaN(Number(v.price)))
            .map((v: { name: string; price: unknown; stock?: unknown }) => ({
              name: String(v.name).trim(),
              price: Number(v.price),
              stock: Math.max(0, parseInt(String(v.stock ?? 0), 10) || 0),
            }))
        : [];

      const product = await prisma.product.create({
        data: {
          name: name.trim(),
          sku,
          description: description?.trim() || null,
          imageUrl: imageUrlTrimmed,
          images: (imagesNormalized.length > 0 ? imagesNormalized : undefined) as any,
          productType: 'READY',
          categoryId,
          vendorId: vendor.id,
          vendorName: vendor.name,
          basePrice: priceNum,
          unitPrice: bodyUnitPrice != null && !Number.isNaN(Number(bodyUnitPrice)) ? Number(bodyUnitPrice) : null,
          stock: stockNum,
          stockQuantity: stockNum,
          taxRate: 20,
          status: 'PENDING',
          isActive: true,
          isPublished: false,
          ...(validVariants.length > 0 && {
            variants: { create: validVariants },
          }),
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: true,
        },
      });
      return NextResponse.json(product, { status: 201 });
    }

    // ADMIN flow
    const {
      name,
      sku,
      description,
      imageUrl,
      productType,
      categoryId,
      basePrice,
      purchasePrice,
      buyPrice,
      salePrice,
      taxRate,
      stock,
      stockQuantity,
      supplier,
      minOrderQuantity,
      productionDays,
      dynamicAttributes,
      attributes,
      vendorName,
      vendorId,
      images: bodyImages,
      highlights,
      descriptionDetail,
      relatedProducts,
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Ürün adı zorunludur' },
        { status: 400 }
      );
    }

    const generatedSku = (sku && typeof sku === 'string' && sku.trim().length > 0)
      ? sku.trim()
      : 'MG-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    if (!productType || !['READY', 'CUSTOM'].includes(productType)) {
      return NextResponse.json(
        { error: 'Geçerli bir ürün tipi seçiniz' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Kategori seçimi zorunludur' },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Seçilen kategori bulunamadı' },
        { status: 404 }
      );
    }

    const rawStock = stockQuantity !== undefined && stockQuantity !== null ? stockQuantity : stock;
    const stockNum = parseInt(String(rawStock ?? 0), 10);
    if (productType === 'READY' && (Number.isNaN(stockNum) || stockNum < 0)) {
      return NextResponse.json(
        { error: 'Hazır stok ürünü için stok adedi 0 veya daha büyük olmalıdır' },
        { status: 400 }
      );
    }

    if (productType === 'CUSTOM') {
      if (!minOrderQuantity || minOrderQuantity < 1) {
        return NextResponse.json(
          { error: 'Özel baskı ürünü için minimum sipariş adedi zorunludur' },
          { status: 400 }
        );
      }
      if (!productionDays || productionDays < 1) {
        return NextResponse.json(
          { error: 'Özel baskı ürünü için üretim süresi zorunludur' },
          { status: 400 }
        );
      }
    }

    const imagesArr = Array.isArray(bodyImages) ? bodyImages : [];
    const imagesNormalized = imagesArr.filter((u): u is string => typeof u === 'string' && u.trim().length > 0).slice(0, 5);

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        sku: generatedSku,
        description: description?.trim() || null,
        imageUrl: imageUrl && imageUrl.trim() !== '' ? imageUrl.trim() : null,
        productType: productType as 'READY' | 'CUSTOM',
        categoryId,
        vendorId: vendorId && typeof vendorId === 'string' && vendorId.trim() ? vendorId.trim() : null,
        basePrice: basePrice || 0,
        purchasePrice: purchasePrice || null,
        buyPrice: buyPrice ? parseFloat(buyPrice.toString()) : null,
        salePrice: salePrice || null,
        taxRate: taxRate || 20,
        stock: productType === 'READY' ? (Number.isNaN(stockNum) ? 0 : stockNum) : (stock !== undefined ? parseInt(String(stock), 10) || 0 : 0),
        stockQuantity: productType === 'READY' ? (Number.isNaN(stockNum) ? 0 : stockNum) : null,
        supplier: supplier?.trim() || null,
        minOrderQuantity: productType === 'CUSTOM' ? minOrderQuantity : null,
        productionDays: productType === 'CUSTOM' ? productionDays : null,
        dynamicAttributes: (dynamicAttributes || undefined) as any,
        attributes: (attributes ?? undefined) as any,
        vendorName: typeof vendorName === 'string' && vendorName.trim() ? vendorName.trim() : 'MatbaaGross',
        images: (imagesNormalized.length > 0 ? imagesNormalized : undefined) as any,
        highlights: (highlights && typeof highlights === 'object' ? highlights : undefined) as any,
        descriptionDetail: (descriptionDetail && typeof descriptionDetail === 'object' ? descriptionDetail : undefined) as any,
        relatedProducts: (Array.isArray(relatedProducts) ? relatedProducts.slice(0, 20) : undefined) as any,
        isActive: true,
        isPublished: body.isPublished !== false,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Products POST error:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Bu SKU zaten kullanılıyor' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
