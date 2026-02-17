import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllHeroWidgets, ensureDefaultHeroWidgets } from '@/lib/hero-widgets-db';

/** Admin: tüm widget'ları listele. Yoksa 10 varsayılan oluştur. */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDefaultHeroWidgets();
    const widgets = await getAllHeroWidgets();
    return NextResponse.json(widgets);
  } catch (error) {
    console.error('[GET /api/admin/hero-widgets]', error);
    return NextResponse.json(
      { error: 'Widget\'lar yüklenemedi' },
      { status: 500 }
    );
  }
}
