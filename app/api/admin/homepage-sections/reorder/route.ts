import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

type ReorderItem = { id: string; order: number };

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body as { items?: ReorderItem[] };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid items array' }, { status: 400 });
    }

    for (const item of items) {
      if (!item?.id || typeof item.order !== 'number') {
        return NextResponse.json({ error: 'Invalid item format' }, { status: 400 });
      }
    }

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.homepageSection.update({
          where: { id: item.id },
          data: { order: item.order },
        });
      }
    });

    revalidatePath('/');
    revalidatePath('/admin/settings/homepage');

    return NextResponse.json({ success: true, updatedCount: items.length });
  } catch (error) {
    console.error('HOMEPAGE_SECTIONS_REORDER_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
