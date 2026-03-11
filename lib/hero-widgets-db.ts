/**
 * Hero widget verilerini okuma/yazma.
 * Prisma client'ta heroWidget bazen tanımlı olmayabildiği için
 * doğrudan hero_widgets tablosu üzerinden raw query kullanıyoruz.
 */
import { prisma } from '@/lib/prisma';

export async function getActiveHeroWidgets() {
  return prisma.heroWidget.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
}

export async function getAllHeroWidgets() {
  return prisma.heroWidget.findMany({
    orderBy: { order: 'asc' },
  });
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

const TARGET_WIDGET_COUNT = 12;

export async function ensureDefaultHeroWidgets(): Promise<void> {
  const count = await prisma.heroWidget.count();
  if (count >= TARGET_WIDGET_COUNT) return;

  // Eksik olanları ekle: 0 ise hepsini, 10 ise son 2'yi (Kampanya 11, Kampanya 12) vb.
  const missing = DEFAULT_WIDGETS.slice(count, TARGET_WIDGET_COUNT).map((w) => ({
    title: w.title,
    subtitle: w.subtitle,
    imageUrl: null,
    targetUrl: w.targetUrl,
    order: w.order,
    isActive: true,
  }));

  if (missing.length > 0) {
    await prisma.heroWidget.createMany({
      data: missing,
      skipDuplicates: true,
    });
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
): Promise<Awaited<ReturnType<typeof prisma.heroWidget.findUnique>>> {
  const exists = await prisma.heroWidget.findUnique({ where: { id } });
  if (!exists) return null;

  await prisma.heroWidget.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.subtitle !== undefined ? { subtitle: data.subtitle } : {}),
      ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
      ...(data.targetUrl !== undefined ? { targetUrl: data.targetUrl } : {}),
      ...(data.order !== undefined ? { order: data.order } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
  });

  return prisma.heroWidget.findUnique({ where: { id } });
}
