import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import OrderConfirmation from '@/emails/OrderConfirmation';

const DEFAULT_PAGE_SIZE = 10;

function generateBarcode(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MG-${year}-${suffix}`;
}

async function ensureUniqueBarcode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const barcode = generateBarcode();
    const existing = await prisma.order.findFirst({ where: { barcode } });
    if (!existing) return barcode;
  }
  return `MG-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}
const MAX_PAGE_SIZE = 100;

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE)
    );
    const skip = (page - 1) * pageSize;

    if (session.user.role === 'ADMIN') {
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, email: true, name: true } },
            address: true,
            items: true,
          },
        }),
        prisma.order.count(),
      ]);
      return NextResponse.json({ orders, total, page, pageSize });
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: session.user.id },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          address: true,
          items: true,
        },
      }),
      prisma.order.count({ where: { userId: session.user.id } }),
    ]);
    return NextResponse.json({ orders, total, page, pageSize });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { addressId, items } = body as {
      addressId: string;
      items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        options?: unknown;
        imageUrl?: string | null;
        uploadedFileUrl?: string | null;
      }>;
    };

    if (!addressId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Teslimat adresi ve en az bir ürün gerekli' },
        { status: 400 }
      );
    }

    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });
    if (!address) {
      return NextResponse.json({ error: 'Geçersiz adres' }, { status: 400 });
    }

    const totalAmount = items.reduce((sum, i) => sum + (Number(i.totalPrice) || 0), 0);
    const barcode = await ensureUniqueBarcode();

    // Sepetteki ürünlerin vendorId bilgisini al (multi-vendor: satıcı sipariş listesinde görsün)
    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, vendorId: true, vendor: { select: { isBlocked: true } } },
    });

    const blockedProduct = products.find((p: { vendor: { isBlocked: boolean } | null }) => p.vendor?.isBlocked === true);
    if (blockedProduct) {
      return NextResponse.json(
        { error: 'Sepetinizdeki bir veya daha fazla ürün artık satışta değil. Lütfen sepetinizi güncelleyin.' },
        { status: 400 }
      );
    }

    const productVendorMap = Object.fromEntries(products.map((p: { id: string; vendorId: string | null }) => [p.id, p.vendorId]));

    const order = await prisma.order.create({
      data: {
        barcode,
        userId: session.user.id,
        addressId,
        totalAmount,
        status: 'PENDING',
        paymentStatus: 'AWAITING_PAYMENT',
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            productName: String(i.productName),
            quantity: Math.max(1, Math.floor(Number(i.quantity) || 0)),
            unitPrice: Number(i.unitPrice) || 0,
            totalPrice: Number(i.totalPrice) || 0,
            options: (i.options ?? undefined) as any,
            imageUrl: i.imageUrl ? String(i.imageUrl) : null,
            uploadedFileUrl: i.uploadedFileUrl ? String(i.uploadedFileUrl) : null,
            vendorId: productVendorMap[i.productId] ?? null, // null = MatbaaGross
          })),
        },
      },
      include: {
        address: true,
        items: true,
        user: { select: { name: true, email: true } },
      },
    });

    // Send order confirmation email — non-blocking, never cancels the order
    if (!process.env.RESEND_API_KEY) {
      console.error('🚨 KRİTİK HATA: RESEND_API_KEY .env dosyasından okunamadı! Sunucuyu kapatıp açtığınızdan emin olun.');
    } else {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const emailHtml = await render(
          OrderConfirmation({
            orderNumber: order.barcode || `#${order.id.slice(-8)}`,
            customerName: order.user.name || 'Değerli Müşterimiz',
            customerEmail: order.user.email,
            items: order.items.map(item => ({
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              imageUrl: item.imageUrl,
            })),
            totalAmount: order.totalAmount,
            orderDate: order.createdAt.toISOString(),
            shippingAddress: address ? {
              title: address.title || undefined,
              line1: address.line1,
              line2: address.line2 || undefined,
              district: address.district || undefined,
              city: address.city,
              postalCode: address.postalCode || undefined,
            } : undefined,
          })
        );

        const customerEmail = order.user.email;
        const adminEmail = process.env.ADMIN_EMAIL || 'volkanongunn@gmail.com';

        const { data, error } = await resend.emails.send({
          from: 'MatbaaGross Sipariş <noreply@matbaagross.com>',
          to: customerEmail,
          bcc: [adminEmail],
          subject: `Siparişiniz Alındı! 🚀 - MatbaaGross`,
          html: emailHtml,
        });

        if (error) {
          console.error('❌ RESEND GÖNDERİM HATASI:', error.message, error);
        } else {
          console.log('✅ RESEND BAŞARILI: Mail Resend sunucularına iletildi', data);
        }
      } catch (emailError) {
        console.error('❌ RESEND GÖNDERİM HATASI:', emailError instanceof Error ? emailError.message : emailError, emailError);
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
