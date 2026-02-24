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
    const isUser = Boolean(session?.user?.id) && session?.user?.role === 'USER';

    const body = await request.json();
    const {
      addressId,
      items,
      paymentMethod,
      guestEmail,
      guestPhone,
      guestFirstName,
      guestLastName,
      guestCity,
      guestDistrict,
      guestAddress,
    } = body as {
      addressId?: string;
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
      paymentMethod?: 'CARD' | 'BANK_TRANSFER';
      guestEmail?: string;
      guestPhone?: string;
      guestFirstName?: string;
      guestLastName?: string;
      guestCity?: string;
      guestDistrict?: string;
      guestAddress?: string;
    };

    const resolvedPaymentMethod: 'CARD' | 'BANK_TRANSFER' =
      paymentMethod === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'CARD';
    const resolvedPaymentStatus: 'PAID' | 'AWAITING_PAYMENT' =
      resolvedPaymentMethod === 'CARD' ? 'PAID' : 'AWAITING_PAYMENT';

    if (!isUser && resolvedPaymentMethod === 'BANK_TRANSFER') {
      return NextResponse.json(
        { error: 'Havale / EFT ile ödeme yapmak için üye girişi yapmanız gerekir' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'En az bir ürün gerekli' },
        { status: 400 }
      );
    }

    let address: { id: string } | null = null;
    if (isUser) {
      if (!addressId) {
        return NextResponse.json({ error: 'Teslimat adresi gerekli' }, { status: 400 });
      }

      address = await prisma.address.findFirst({
        where: { id: addressId, userId: session!.user!.id },
        select: { id: true },
      });
      if (!address) {
        return NextResponse.json({ error: 'Geçersiz adres' }, { status: 400 });
      }
    } else {
      const email = typeof guestEmail === 'string' ? guestEmail.trim() : '';
      const phone = typeof guestPhone === 'string' ? guestPhone.trim() : '';
      const firstName = typeof guestFirstName === 'string' ? guestFirstName.trim() : '';
      const lastName = typeof guestLastName === 'string' ? guestLastName.trim() : '';
      const city = typeof guestCity === 'string' ? guestCity.trim() : '';
      const district = typeof guestDistrict === 'string' ? guestDistrict.trim() : '';
      const addr = typeof guestAddress === 'string' ? guestAddress.trim() : '';

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const phoneOk = phone.replace(/\D/g, '').length >= 10;

      if (!emailOk) {
        return NextResponse.json({ error: 'Geçerli bir e-posta adresi giriniz' }, { status: 400 });
      }
      if (!phoneOk) {
        return NextResponse.json({ error: 'Geçerli bir telefon numarası giriniz' }, { status: 400 });
      }
      if (!firstName || !lastName || !city || !district || !addr) {
        return NextResponse.json({ error: 'Teslimat bilgilerini eksiksiz doldurunuz' }, { status: 400 });
      }
    }

    const subtotal = items.reduce((sum, i) => {
      const qty = Math.max(1, Math.floor(Number(i.quantity) || 0));
      const unit = Math.max(0, Number(i.unitPrice) || 0);
      return sum + unit * qty;
    }, 0);
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

    // Stock validation and order creation in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const settings = await tx.storeSettings.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { shippingFee: true, freeShippingThreshold: true },
      });

      const shippingFee = Math.max(0, settings?.shippingFee ?? 25);
      const freeShippingThreshold = Math.max(0, settings?.freeShippingThreshold ?? 1500);

      const discount = isUser && resolvedPaymentMethod === 'BANK_TRANSFER' ? subtotal * 0.05 : 0;
      const discountedSubtotal = Math.max(0, subtotal - discount);
      const shippingCost = discountedSubtotal >= freeShippingThreshold ? 0 : shippingFee;
      const totalAmount = discountedSubtotal + shippingCost;

      // 1. Validate stock for all items
      const productIds = [...new Set(items.map((i) => i.productId))];
      const productsWithStock = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          stock: true,
          stockQuantity: true,
          variants: {
            select: {
              id: true,
              name: true,
              stock: true,
            },
          },
        },
      });

      for (const item of items) {
        const product = productsWithStock.find((p) => p.id === item.productId);
        if (!product) {
          throw new Error(`Ürün bulunamadı: ${item.productId}`);
        }

        const requestedQuantity = Math.max(1, Math.floor(Number(item.quantity) || 0));
        
        // Check if item has variant selected
        const options = item.options as Record<string, any> | undefined;
        const selectedVariantId = options?.variantId;
        const selectedVariantName = options?.variantName;
        
        if (selectedVariantId || selectedVariantName) {
          // Find the variant
          const variant = product.variants.find(
            (v) => v.id === selectedVariantId || v.name === selectedVariantName
          );
          
          if (!variant) {
            throw new Error(`Varyasyon bulunamadı: ${selectedVariantId || selectedVariantName}`);
          }
          
          if (variant.stock < requestedQuantity) {
            throw new Error(`"${item.productName}" ürününün "${variant.name}" varyasyonu için yetersiz stok. Mevcut: ${variant.stock}, İstenen: ${requestedQuantity}`);
          }
        } else {
          // Check main product stock
          const availableStock = product.stock ?? product.stockQuantity ?? 0;
          if (availableStock < requestedQuantity) {
            throw new Error(`"${item.productName}" ürünü için yetersiz stok. Mevcut: ${availableStock}, İstenen: ${requestedQuantity}`);
          }
        }
      }

      // 2. Create the order
      const createdOrder = await tx.order.create({
      data: {
        barcode,
        userId: isUser ? session!.user!.id : null,
        addressId: isUser ? address!.id : null,
        paymentMethod: resolvedPaymentMethod,
        paymentStatus: resolvedPaymentStatus,
        guestEmail: !isUser && typeof guestEmail === 'string' ? guestEmail.trim() : null,
        guestPhone: !isUser && typeof guestPhone === 'string' ? guestPhone.trim() : null,
        guestFirstName: !isUser && typeof guestFirstName === 'string' ? guestFirstName.trim() : null,
        guestLastName: !isUser && typeof guestLastName === 'string' ? guestLastName.trim() : null,
        guestCity: !isUser && typeof guestCity === 'string' ? guestCity.trim() : null,
        guestDistrict: !isUser && typeof guestDistrict === 'string' ? guestDistrict.trim() : null,
        guestAddress: !isUser && typeof guestAddress === 'string' ? guestAddress.trim() : null,
        totalAmount,
        status: 'PENDING',
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            productName: String(i.productName),
            quantity: Math.max(1, Math.floor(Number(i.quantity) || 0)),
            unitPrice: Number(i.unitPrice) || 0,
            totalPrice: (Number(i.unitPrice) || 0) * Math.max(1, Math.floor(Number(i.quantity) || 0)),
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

      // 3. Update stock for each item
      for (const item of items) {
        const product = productsWithStock.find((p) => p.id === item.productId);
        if (!product) continue;

        const requestedQuantity = Math.max(1, Math.floor(Number(item.quantity) || 0));
        
        // Check if item has variant selected
        const options = item.options as Record<string, any> | undefined;
        const selectedVariantId = options?.variantId;
        const selectedVariantName = options?.variantName;
        
        if (selectedVariantId || selectedVariantName) {
          // Update variant stock
          const variant = product.variants.find(
            (v) => v.id === selectedVariantId || v.name === selectedVariantName
          );
          
          if (variant) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                stock: {
                  decrement: requestedQuantity,
                },
              },
            });
            
            // Also update main product stock if needed
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: requestedQuantity,
                },
                stockQuantity: {
                  decrement: requestedQuantity,
                },
              },
            });
          }
        } else {
          // Update main product stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: requestedQuantity,
              },
              stockQuantity: {
                decrement: requestedQuantity,
              },
            },
          });
        }
      }

      return createdOrder;
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
            customerName: order.user?.name || `${order.guestFirstName ?? ''} ${order.guestLastName ?? ''}`.trim() || 'Değerli Müşterimiz',
            customerEmail: order.user?.email || order.guestEmail || '',
            paymentMethod: order.paymentMethod,
            items: order.items.map(item => ({
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              imageUrl: item.imageUrl,
            })),
            totalAmount: order.totalAmount,
            orderDate: order.createdAt.toISOString(),
            shippingAddress: order.address ? {
              title: order.address.title || undefined,
              line1: order.address.line1,
              line2: order.address.line2 || undefined,
              district: order.address.district || undefined,
              city: order.address.city,
              postalCode: order.address.postalCode || undefined,
            } : (!isUser ? {
              title: `${order.guestFirstName ?? ''} ${order.guestLastName ?? ''}`.trim() || undefined,
              line1: order.guestAddress || '',
              line2: undefined,
              district: order.guestDistrict || undefined,
              city: order.guestCity || '',
              postalCode: undefined,
            } : undefined),
          })
        );

        const adminEmail = process.env.ADMIN_EMAIL || 'volkanongunn@gmail.com';
        const customerEmail = order.user?.email || order.guestEmail || adminEmail;

        console.log('📧 RESEND GÖNDERİLİYOR:', { to: customerEmail, bcc: adminEmail, orderNo: order.barcode });

        const { data, error } = await resend.emails.send({
          from: 'MatbaaGross Sipariş <noreply@matbaagross.com>',
          to: customerEmail,
          bcc: [adminEmail],
          subject: `Siparişiniz Alındı! 🚀 - MatbaaGross`,
          html: emailHtml,
        });

        if (error) {
          console.error('❌ RESEND GÖNDERİM HATASI:', JSON.stringify(error));
        } else {
          console.log('✅ RESEND BAŞARILI:', data);
        }
      } catch (emailError) {
        console.error('❌ RESEND GÖNDERİM HATASI:', emailError instanceof Error ? emailError.message : emailError, emailError);
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Orders POST error:', error);
    
    // Handle stock validation errors specifically
    if (error instanceof Error) {
      if (error.message.includes('yetersiz stok') || error.message.includes('bulunamadı')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
