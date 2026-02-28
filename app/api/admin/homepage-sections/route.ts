import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { HomepageSectionType } from '@prisma/client';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sections = await prisma.homepageSection.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error('HOMEPAGE_SECTIONS_GET_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, type, order, isActive, metadata } = body as {
      title?: string;
      type?: HomepageSectionType;
      order?: number;
      isActive?: boolean;
      metadata?: unknown;
    };

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!type || !Object.values(HomepageSectionType).includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const maxOrder = await prisma.homepageSection.aggregate({
      _max: { order: true },
    });

    const nextOrder = typeof order === 'number' ? order : (maxOrder._max.order ?? -1) + 1;

    const section = await prisma.homepageSection.create({
      data: {
        title,
        type,
        order: nextOrder,
        isActive: typeof isActive === 'boolean' ? isActive : true,
        metadata: metadata ?? null,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin/settings/homepage');

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error('HOMEPAGE_SECTIONS_POST_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
