import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Türkçe karakterleri İngilizce karşılıklarına çeviren slug oluşturma fonksiyonu
function createSlug(text: string): string {
  const turkishChars: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U',
  };

  let slug = text
    .toLowerCase()
    .split('')
    .map(char => turkishChars[char] || char)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '') // Özel karakterleri temizle
    .trim()
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .replace(/-+/g, '-'); // Birden fazla tireyi tek tire yap

  return slug;
}

// GET: Tüm kategorileri getir
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const categories = await prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        attributes: true,
        order: true,
        isActive: true,
        showOnNavbar: true,
        parentId: true,
        createdAt: true,
        children: {
          select: { id: true, name: true, slug: true, order: true, isActive: true, showOnNavbar: true },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error: unknown) {
    console.error('[GET /api/categories] Hata detayı:', {
      message: error instanceof Error ? error.message : String(error),
      code: (error as { code?: string })?.code,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Yeni kategori oluştur
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      order = 0,
      isActive = true,
      showOnNavbar = false,
      parentId = null,
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Kategori adı zorunludur' },
        { status: 400 }
      );
    }

    const slug = createSlug(name.trim());
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    let finalSlug = slug;
    if (existingCategory) {
      let counter = 1;
      let newSlug = `${slug}-${counter}`;
      while (await prisma.category.findUnique({ where: { slug: newSlug } })) {
        counter++;
        newSlug = `${slug}-${counter}`;
      }
      finalSlug = newSlug;
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || null,
        order: typeof order === 'number' ? order : parseInt(String(order), 10) || 0,
        isActive: Boolean(isActive),
        showOnNavbar: Boolean(showOnNavbar),
        parentId: parentId && String(parentId).trim() ? String(parentId).trim() : null,
      },
    });

    revalidatePath('/');
    revalidatePath('/api/categories/navbar');
    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    const err = error as { code?: string };
    console.error('[POST /api/categories] Hata detayı:', {
      message: error instanceof Error ? error.message : String(error),
      code: err?.code,
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (err?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Kategori güncelle
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Kategori ID gerekli' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data: {
      name?: string;
      description?: string | null;
      order?: number;
      isActive?: boolean;
      showOnNavbar?: boolean;
      parentId?: string | null;
    } = {};

    if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim();
    if (body.description !== undefined) data.description = body.description?.trim() || null;
    if (typeof body.order === 'number') data.order = body.order;
    if (typeof body.order === 'string') data.order = parseInt(body.order, 10) || 0;
    if (typeof body.isActive === 'boolean') data.isActive = body.isActive;
    if (typeof body.showOnNavbar === 'boolean') data.showOnNavbar = body.showOnNavbar;
    if (body.parentId !== undefined) data.parentId = body.parentId && String(body.parentId).trim() ? String(body.parentId).trim() : null;

    if (data.name) {
      const existing = await prisma.category.findFirst({
        where: { slug: createSlug(data.name), id: { not: id } },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Bu isimde başka bir kategori zaten var' },
          { status: 409 }
        );
      }
      (data as any).slug = createSlug(data.name);
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    revalidatePath('/');
    revalidatePath('/api/categories/navbar');
    return NextResponse.json(category);
  } catch (error: unknown) {
    const err = error as { code?: string };
    console.error('[PATCH /api/categories] Hata detayı:', {
      message: error instanceof Error ? error.message : String(error),
      code: err?.code,
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (err?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Kategori sil
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Kategori ID gerekli' },
        { status: 400 }
      );
    }

    // Kategoriyi sil
    await prisma.category.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/api/categories/navbar');
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as { code?: string };
    console.error('[DELETE /api/categories] Hata detayı:', {
      message: error instanceof Error ? error.message : String(error),
      code: err?.code,
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (err?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
