import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const INVOICE_DIR = path.join(process.cwd(), 'public', 'uploads', 'invoices');

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await params;

    // Satıcının bu siparişe erişim hakkı var mı kontrol et
    const vendor = await prisma.vendor.findUnique({
      where: { ownerId: session.user.id },
    });
    if (!vendor) {
      return NextResponse.json({ error: 'Satıcı hesabı bulunamadı.' }, { status: 403 });
    }

    const orderItem = await prisma.orderItem.findFirst({
      where: { orderId, vendorId: vendor.id },
    });
    if (!orderItem) {
      return NextResponse.json({ error: 'Bu siparişe erişim yetkiniz yok.' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('invoice');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Sadece PDF dosyası yükleyebilirsiniz.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dosya boyutu 10MB\'dan büyük olamaz.' }, { status: 400 });
    }

    await mkdir(INVOICE_DIR, { recursive: true });

    const uniqueName = `invoice-${orderId}-${Date.now()}.pdf`;
    const filePath = path.join(INVOICE_DIR, uniqueName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const invoiceUrl = `/uploads/invoices/${uniqueName}`;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { invoiceUrl },
    });

    return NextResponse.json({ invoiceUrl: updatedOrder.invoiceUrl });
  } catch (error) {
    console.error('Invoice upload error:', error);
    return NextResponse.json({ error: 'Fatura yüklenirken hata oluştu.' }, { status: 500 });
  }
}
