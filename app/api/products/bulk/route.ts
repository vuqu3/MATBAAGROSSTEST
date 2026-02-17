import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST: Toplu ürün yükleme
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { products } = body;

    // Validation
    if (!Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Products must be an array' },
        { status: 400 }
      );
    }

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'Products array cannot be empty' },
        { status: 400 }
      );
    }

    if (products.length > 1000) {
      return NextResponse.json(
        { error: 'Maximum 1000 products can be imported at once' },
        { status: 400 }
      );
    }

    // Her ürün için validation ve dönüşüm
    const productsToCreate = [];
    const errors: string[] = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Zorunlu alanlar
      if (!product.name || typeof product.name !== 'string' || product.name.trim().length === 0) {
        errors.push(`Ürün ${i + 1}: Ürün adı zorunludur`);
        continue;
      }

      if (!product.sku || typeof product.sku !== 'string' || product.sku.trim().length === 0) {
        errors.push(`Ürün ${i + 1}: SKU zorunludur`);
        continue;
      }

      if (!product.categoryId || typeof product.categoryId !== 'string') {
        errors.push(`Ürün ${i + 1}: Kategori ID zorunludur`);
        continue;
      }

      // Kategori var mı kontrol et
      const category = await prisma.category.findUnique({
        where: { id: product.categoryId },
      });

      if (!category) {
        errors.push(`Ürün ${i + 1}: Kategori bulunamadı (ID: ${product.categoryId})`);
        continue;
      }

      // Ürün tipi (varsayılan: READY)
      const productType = product.productType || 'READY';

      // Ürün verisini hazırla
      const productData: any = {
        name: product.name.trim(),
        sku: product.sku.trim(),
        description: product.description?.trim() || null,
        imageUrl: product.imageUrl?.trim() || null,
        productType,
        categoryId: product.categoryId,
        basePrice: product.basePrice || product.salePrice || 0,
        purchasePrice: product.purchasePrice || null,
        buyPrice: product.buyPrice ? parseFloat(product.buyPrice.toString()) : null,
        salePrice: product.salePrice || null,
        taxRate: product.taxRate || 20,
        stock: product.stock !== undefined ? parseInt(product.stock.toString()) : 0,
        stockQuantity: product.stockQuantity !== undefined ? parseInt(product.stockQuantity.toString()) : null,
        supplier: product.supplier?.trim() || null,
        minOrderQuantity: product.minOrderQuantity ? parseInt(product.minOrderQuantity.toString()) : null,
        productionDays: product.productionDays ? parseInt(product.productionDays.toString()) : null,
        dynamicAttributes: (product.dynamicAttributes || undefined) as any,
        isActive: product.isActive !== undefined ? product.isActive : true,
        isPublished: product.isPublished !== undefined ? product.isPublished : false,
      };

      // Ürün tipine göre validation
      if (productType === 'READY') {
        if (productData.stockQuantity === null) {
          productData.stockQuantity = productData.stock || 0;
        }
      }

      if (productType === 'CUSTOM') {
        if (!productData.minOrderQuantity || productData.minOrderQuantity < 1) {
          errors.push(`Ürün ${i + 1}: Özel baskı ürünü için minimum sipariş adedi zorunludur`);
          continue;
        }
        if (!productData.productionDays || productData.productionDays < 1) {
          errors.push(`Ürün ${i + 1}: Özel baskı ürünü için üretim süresi zorunludur`);
          continue;
        }
      }

      productsToCreate.push(productData);
    }

    // Hata varsa döndür
    if (errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation errors',
          errors,
          imported: 0,
          total: products.length,
        },
        { status: 400 }
      );
    }

    // Toplu ürün oluştur
    // Not: createMany unique constraint hatalarını yakalayamaz, bu yüzden tek tek oluşturuyoruz
    const createdProducts = [];
    const skippedProducts = [];

    for (const productData of productsToCreate) {
      try {
        const product = await prisma.product.create({
          data: productData,
        });
        createdProducts.push(product);
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Unique constraint violation (SKU zaten var)
          skippedProducts.push({
            sku: productData.sku,
            reason: 'SKU zaten kullanılıyor',
          });
        } else {
          skippedProducts.push({
            sku: productData.sku,
            reason: error.message || 'Bilinmeyen hata',
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${createdProducts.length} ürün başarıyla yüklendi`,
      imported: createdProducts.length,
      skipped: skippedProducts.length,
      total: products.length,
      skippedProducts: skippedProducts.length > 0 ? skippedProducts : undefined,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Bulk import error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'Ürünler yüklenirken bir hata oluştu',
      },
      { status: 500 }
    );
  }
}
