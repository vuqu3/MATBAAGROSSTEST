import { NextResponse } from 'next/server';
import { getActiveHeroWidgets } from '@/lib/hero-widgets-db';

/** Ana sayfa vitrin barı: sadece aktif widget'ları sıraya göre döner (herkese açık). */
export async function GET() {
  try {
    const widgets = await getActiveHeroWidgets();
    return NextResponse.json(widgets);
  } catch (error) {
    console.error('[GET /api/hero-widgets]', error);
    return NextResponse.json(
      { error: 'Widget\'lar yüklenemedi' },
      { status: 500 }
    );
  }
}
