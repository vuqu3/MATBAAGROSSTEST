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
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    }),
  ]);

  return (
    <div>
      <ProductsTableWithTabs products={products} categories={categories} />
    </div>
  );
}
