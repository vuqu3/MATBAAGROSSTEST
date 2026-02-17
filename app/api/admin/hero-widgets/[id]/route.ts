import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateHeroWidget } from '@/lib/hero-widgets-db';

/** Admin: tek widget güncelle. */
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
    const { title, subtitle, imageUrl, targetUrl, order, isActive } = body;

    const data: Parameters<typeof updateHeroWidget>[1] = {};
    if (typeof title === 'string') data.title = title;
    if (typeof subtitle === 'string') data.subtitle = subtitle;
    if (imageUrl !== undefined) data.imageUrl = imageUrl === null || imageUrl === '' ? null : imageUrl;
    if (typeof targetUrl === 'string') data.targetUrl = targetUrl;
    if (typeof order === 'number') data.order = order;
    if (typeof isActive === 'boolean') data.isActive = isActive;

    const widget = await updateHeroWidget(id, data);
    if (!widget) {
      return NextResponse.json({ error: 'Widget bulunamadı' }, { status: 404 });
    }
    return NextResponse.json(widget);
  } catch (error) {
    console.error('[PATCH /api/admin/hero-widgets/:id]', error);
    return NextResponse.json(
      { error: 'Widget güncellenemedi' },
      { status: 500 }
    );
  }
}
