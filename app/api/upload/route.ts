import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') ?? formData.get('image');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı. Lütfen bir resim seçin.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Geçersiz dosya tipi. Sadece JPG, PNG, GIF veya WebP yükleyebilirsiniz.' },
        { status: 400 }
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = path.extname(file.name) || '.jpg';
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, '') || 'resim';
    const uniqueName = `${baseName}-${Date.now()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const url = `/uploads/${uniqueName}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: 'Dosya yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
