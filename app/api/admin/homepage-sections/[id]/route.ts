import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { HomepageSectionType } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      title,
      type,
      order,
      isActive,
      metadata,
    } = body as {
      title?: string;
      type?: HomepageSectionType;
      order?: number;
      isActive?: boolean;
      metadata?: unknown;
    };

    const existing = await prisma.homepageSection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (type !== undefined && !Object.values(HomepageSectionType).includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const updated = await prisma.homepageSection.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type }),
        ...(typeof order === 'number' && { order }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(metadata !== undefined && { metadata: metadata ?? null }),
      },
    });

    revalidatePath('/');
    revalidatePath('/admin/settings/homepage');

    return NextResponse.json(updated);
  } catch (error) {
    console.error('HOMEPAGE_SECTIONS_PATCH_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.homepageSection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.homepageSection.delete({ where: { id } });

    revalidatePath('/');
    revalidatePath('/admin/settings/homepage');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('HOMEPAGE_SECTIONS_DELETE_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
