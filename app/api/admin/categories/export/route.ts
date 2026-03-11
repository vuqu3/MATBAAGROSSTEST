import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    const byId = new Map(categories.map((c) => [c.id, c] as const));

    const resolvePath = (id: string) => {
      const names: string[] = [];
      const visited = new Set<string>();
      let cur = byId.get(id) || null;
      while (cur && !visited.has(cur.id)) {
        visited.add(cur.id);
        names.unshift(cur.name);
        cur = cur.parentId ? byId.get(cur.parentId) || null : null;
      }
      return names.join(' > ');
    };

    const mod = await import('xlsx');
    const XLSX = mod.default ?? mod;

    const rows = [
      ['Kategori ID', 'Kategori Yolu (Hiyerarşi)'],
      ...categories.map((c) => [c.id, resolvePath(c.id)]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 30 }, { wch: 80 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kategoriler');

    const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;

    return new NextResponse(out, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="kategori-id-listesi.xlsx"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('ADMIN_CATEGORIES_EXPORT_ERROR', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
