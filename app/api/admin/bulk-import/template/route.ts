import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mod = await import('xlsx');
    const XLSX = mod.default ?? mod;

    const header = [
      'GrupKodu (ParentSKU)',
      'ÜrünAdı',
      'StokKodu (SKU)',
      'Fiyat',
      'Stok',
      'KategoriID',
      'Açıklama',
      'Resim1',
      'Resim2',
      'Resim3',
      'Resim4',
      'Resim5',
    ];

    const rows = [
      header,
      [
        'KB-001',
        'Karton Bardak',
        'KB-001',
        49.9,
        120,
        'KATEGORI_ID_BURAYA',
        'Ana ürün (parent). Varyasyonlar aynı GrupKodu ile gelir.',
        'https://ornek-site.com/resim1.jpg',
        '',
        '',
        '',
        '',
      ],
      [
        'KB-001',
        'Karton Bardak - 8oz',
        'KB-001-8OZ',
        44.9,
        60,
        'KATEGORI_ID_BURAYA',
        'Varyasyon örneği (child).',
        'https://ornek-site.com/resim1.jpg',
        'https://ornek-site.com/resim2.jpg',
        '',
        '',
        '',
      ],
      [
        'KB-001',
        'Karton Bardak - 12oz',
        'KB-001-12OZ',
        54.9,
        60,
        'KATEGORI_ID_BURAYA',
        'Varyasyon örneği (child).',
        'https://ornek-site.com/resim1.jpg',
        '',
        '',
        '',
        '',
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 22 },
      { wch: 32 },
      { wch: 18 },
      { wch: 10 },
      { wch: 8 },
      { wch: 18 },
      { wch: 50 },
      { wch: 40 },
      { wch: 40 },
      { wch: 40 },
      { wch: 40 },
      { wch: 40 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ürün Yükleme Şablonu');

    const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;

    return new NextResponse(out, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="toplu-urun-yukleme-sablonu.xlsx"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('ADMIN_BULK_IMPORT_TEMPLATE_ERROR', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
