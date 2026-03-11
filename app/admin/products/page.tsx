import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductsTableWithTabs from './ProductsTableWithTabs';

export default async function ProductsPage() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        sku: true,
        imageUrl: true,
        images: true,
        supplier: true,
        vendorName: true,
        status: true,
        productType: true,
        buyPrice: true,
        purchasePrice: true,
        basePrice: true,
        salePrice: true,
        stock: true,
        stockQuantity: true,
        isPublished: true,
        isActive: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parentId: true,
            order: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, parentId: true, order: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    }),
  ]);

  return (
    <div>
      <Suspense fallback={null}>
        <ProductsTableWithTabs products={products} categories={categories} />
      </Suspense>
    </div>
  );
}
