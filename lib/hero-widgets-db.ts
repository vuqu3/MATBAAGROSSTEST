/**
 * Hero widget verilerini okuma/yazma.
 * Prisma client'ta heroWidget bazen tanımlı olmayabildiği için
 * doğrudan hero_widgets tablosu üzerinden raw query kullanıyoruz.
 */
import { prisma } from '@/lib/prisma';

export type HeroWidgetRow = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  targetUrl: string;
  order: number;
  isActive: number; // SQLite boolean 0/1
  createdAt: Date;
  updatedAt: Date;
};

function rowToWidget(r: HeroWidgetRow) {
  return {
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    imageUrl: r.imageUrl,
    targetUrl: r.targetUrl,
    order: r.order,
    isActive: Boolean(r.isActive),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function getActiveHeroWidgets(): Promise<ReturnType<typeof rowToWidget>[]> {
  const rows = await prisma.$queryRawUnsafe<HeroWidgetRow[]>(
    'SELECT * FROM hero_widgets WHERE isActive = 1 ORDER BY "order" ASC'
  );
  return (rows || []).map(rowToWidget);
}

export async function getAllHeroWidgets(): Promise<ReturnType<typeof rowToWidget>[]> {
  const rows = await prisma.$queryRawUnsafe<HeroWidgetRow[]>(
    'SELECT * FROM hero_widgets ORDER BY "order" ASC'
  );
  return (rows || []).map(rowToWidget);
}

const DEFAULT_WIDGETS = [
  { title: 'İNDİRİMLİ', subtitle: 'ÜRÜNLER', targetUrl: '/urunler?kategori=50-indirimli-urunler', order: 1 },
  { title: 'STOKTAN', subtitle: 'HEMEN TESLİM', targetUrl: '/urunler?kategori=stoktan-hemen-teslim', order: 2 },
  { title: 'HAZIR', subtitle: 'KUTULAR', targetUrl: '/urunler?kategori=hazir-kutular', order: 3 },
  { title: 'AMBALAJ', subtitle: 'GROSS', targetUrl: '/urunler?kategori=ambalaj-gross', order: 4 },
  { title: 'PERAKENDE', subtitle: 'SATIŞ', targetUrl: '/urunler?kategori=perakende', order: 5 },
  { title: 'KARTON', subtitle: 'BARDAK', targetUrl: '/urunler?kategori=karton-bardak', order: 6 },
  { title: 'HAMBURGER', subtitle: 'KUTUSU', targetUrl: '/urunler?kategori=hamburger-kutusu', order: 7 },
  { title: 'PASTANE', subtitle: 'KUTULARI', targetUrl: '/urunler?kategori=pastane-kutulari', order: 8 },
  { title: 'E-TİCARET', subtitle: 'KUTUSU', targetUrl: '/urunler?kategori=e-ticaret-kutusu', order: 9 },
  { title: 'PROMOSYON', subtitle: 'ÜRÜNLER', targetUrl: '/urunler?kategori=promosyon', order: 10 },
  { title: 'OUTLET', subtitle: '%50 İNDİRİM', targetUrl: '/urunler?kategori=50-indirimli-urunler', order: 11 },
  { title: 'YENİ', subtitle: 'GELENLER', targetUrl: '/urunler?kategori=yeni-gelenler', order: 12 },
];

function simpleId(): string {
  return 'hero_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
}

const TARGET_WIDGET_COUNT = 12;

export async function ensureDefaultHeroWidgets(): Promise<void> {
  const countResult = await prisma.$queryRawUnsafe<[{ count: number | bigint }]>(
    'SELECT COUNT(*) as count FROM hero_widgets'
  );
  const count = Number(countResult?.[0]?.count ?? 0);
  if (count >= TARGET_WIDGET_COUNT) return;

  const now = new Date().toISOString();
  // Eksik olanları ekle: 0 ise hepsini, 10 ise son 2'yi (Kampanya 11, Kampanya 12) vb.
  for (let i = count; i < TARGET_WIDGET_COUNT && i < DEFAULT_WIDGETS.length; i++) {
    const w = DEFAULT_WIDGETS[i];
    const id = simpleId();
    await prisma.$executeRawUnsafe(
      `INSERT INTO hero_widgets (id, title, subtitle, imageUrl, targetUrl, "order", isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      w.title,
      w.subtitle,
      null,
      w.targetUrl,
      w.order,
      1,
      now,
      now
    );
  }
}

export async function updateHeroWidget(
  id: string,
  data: {
    title?: string;
    subtitle?: string;
    imageUrl?: string | null;
    targetUrl?: string;
    order?: number;
    isActive?: boolean;
  }
): Promise<ReturnType<typeof rowToWidget> | null> {
  const updates: string[] = [];
  const values: unknown[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  if (data.subtitle !== undefined) {
    updates.push('subtitle = ?');
    values.push(data.subtitle);
  }
  if (data.imageUrl !== undefined) {
    updates.push('imageUrl = ?');
    values.push(data.imageUrl);
  }
  if (data.targetUrl !== undefined) {
    updates.push('targetUrl = ?');
    values.push(data.targetUrl);
  }
  if (data.order !== undefined) {
    updates.push('"order" = ?');
    values.push(data.order);
  }
  if (data.isActive !== undefined) {
    updates.push('isActive = ?');
    values.push(data.isActive ? 1 : 0);
  }

  if (updates.length === 0) {
    const rows = await prisma.$queryRawUnsafe<HeroWidgetRow[]>(
      'SELECT * FROM hero_widgets WHERE id = ?',
      id
    );
    return rows?.[0] ? rowToWidget(rows[0]) : null;
  }

  updates.push('updatedAt = ?');
  values.push(new Date().toISOString());
  values.push(id);

  await prisma.$executeRawUnsafe(
    `UPDATE hero_widgets SET ${updates.join(', ')} WHERE id = ?`,
    ...values
  );

  const rows = await prisma.$queryRawUnsafe<HeroWidgetRow[]>(
    'SELECT * FROM hero_widgets WHERE id = ?',
    id
  );
  return rows?.[0] ? rowToWidget(rows[0]) : null;
}
