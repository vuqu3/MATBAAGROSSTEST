import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    if (!user?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await request.formData();

    const companyDetails = formData.get('companyDetails');

    const taxPlate = formData.get('taxPlate');
    const tradeRegistry = formData.get('tradeRegistry');
    const signatureCircular = formData.get('signatureCircular');
    const identityDocument = formData.get('identityDocument');

    const files = { taxPlate, tradeRegistry, signatureCircular, identityDocument } as const;

    for (const [key, value] of Object.entries(files)) {
      if (!(value instanceof File)) {
        return NextResponse.json({ error: `Eksik evrak: ${key}` }, { status: 400 });
      }
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'seller-docs', session.user.id);
    await mkdir(uploadDir, { recursive: true });

    const saved: Record<string, string> = {};

    for (const [key, value] of Object.entries(files)) {
      const file = value as File;
      const ext = path.extname(file.name || '').slice(0, 10) || '';
      const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
      const filename = `${safeKey}-${Date.now()}${ext}`;
      const abs = path.join(uploadDir, filename);
      const buf = Buffer.from(await file.arrayBuffer());
      await writeFile(abs, buf);
      saved[key] = `/uploads/seller-docs/${session.user.id}/${filename}`;
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        taxPlateUrl: saved.taxPlate,
        tradeRegistryUrl: saved.tradeRegistry,
        signatureCircularUrl: saved.signatureCircular,
        identityDocumentUrl: saved.identityDocument,
        companyDetails: typeof companyDetails === 'string' ? companyDetails : null,
        applicationStatus: 'IN_REVIEW',
      } as any,
      select: {
        applicationStatus: true,
        taxPlateUrl: true,
        tradeRegistryUrl: true,
        signatureCircularUrl: true,
        identityDocumentUrl: true,
        companyDetails: true,
      } as any,
    });

    // Keep SupplierApplication in sync for admin review screens.
    // We may have more than one application row historically; update all active ones for this email.
    await prisma.supplierApplication.updateMany({
      where: {
        email: user.email,
        status: { in: ['PENDING', 'REVIEWED'] },
      } as any,
      data: {
        taxPlateUrl: saved.taxPlate,
        tradeRegistryUrl: saved.tradeRegistry,
        signatureCircularUrl: saved.signatureCircular,
        identityDocumentUrl: saved.identityDocument,
      },
    });

    return NextResponse.json({
      message: 'Evraklarınız başarıyla yüklendi ve onaya gönderildi.',
      applicationStatus: updated.applicationStatus,
      documents: {
        taxPlateUrl: updated.taxPlateUrl,
        tradeRegistryUrl: updated.tradeRegistryUrl,
        signatureCircularUrl: updated.signatureCircularUrl,
        identityDocumentUrl: updated.identityDocumentUrl,
      },
    });
  } catch (error) {
    console.error('POST /api/seller/onboarding-docs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
