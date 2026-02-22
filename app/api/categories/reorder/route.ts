import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ReorderItem {
  id: string;
  order: number;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items }: { items: ReorderItem[] } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid items array' }, { status: 400 });
    }

    // Validate each item
    for (const item of items) {
      if (!item.id || typeof item.order !== 'number') {
        return NextResponse.json({ error: 'Invalid item format' }, { status: 400 });
      }
    }

    // Update all categories in a transaction
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.category.update({
          where: { id: item.id },
          data: { order: item.order },
        });
      }
    });

    return NextResponse.json({ 
      message: 'Categories reordered successfully',
      updatedCount: items.length 
    });

  } catch (error) {
    console.error('Categories reorder error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
