import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'customer-files');
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'application/postscript', // .ai .eps
];
const ALLOWED_EXT = ['.pdf', '.ai', '.eps', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'USER') {
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

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json(
        { error: 'Sadece PDF, AI, EPS, PNG, JPG, SVG dosyaları yüklenebilir' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Dosya boyutu 10MB\'dan küçük olmalıdır' },
        { status: 400 }
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    const filePath = path.join(UPLOAD_DIR, safeName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const url = `/uploads/customer-files/${safeName}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error('[POST /api/upload/customer-file] Hata:', error);
    return NextResponse.json(
      { error: 'Dosya yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
