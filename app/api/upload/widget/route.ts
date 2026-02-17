import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'widgets');
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Dosya seçilmedi veya geçersiz' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Sadece resim dosyaları (JPEG, PNG, WebP, GIF) yüklenebilir' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Dosya boyutu 2MB\'dan küçük olmalıdır' },
        { status: 400 }
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = path.extname(file.name) || '.jpg';
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    const filePath = path.join(UPLOAD_DIR, safeName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const url = `/uploads/widgets/${safeName}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error('[POST /api/upload/widget] Hata:', error);
    return NextResponse.json(
      { error: 'Görsel yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
