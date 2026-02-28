import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import OrderConfirmation from '@/emails/OrderConfirmation';

type PayTRCallbackBody = {
  merchant_oid: string;
  status: 'success' | 'failed';
  total_amount: string; // kuruş string
  hash: string;
  failed_reason_code?: string;
  failed_reason_msg?: string;
  test_mode?: '1' | '0';
  payment_type?: string;
  currency?: string;
};

function createCallbackHash(
  merchantOid: string,
  status: string,
  totalAmount: string,
  merchantSalt: string,
  merchantKey: string
): string {
  // PayTR dokümanına göre: base64(hmac_sha256(merchant_oid + merchant_salt + status + total_amount, merchant_key))
  const payload = `${merchantOid}${merchantSalt}${status}${totalAmount}`;
  return crypto.createHmac('sha256', merchantKey).update(payload).digest('base64');
}

function okResponse() {
  return new NextResponse('OK', {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

function resolveOrderId(merchantOid: string): string {
  const raw = String(merchantOid || '').trim().replace(/[^a-zA-Z0-9]/g, '');
  if (raw.startsWith('MG')) return raw.slice(2);
  return raw;
}

export async function POST(req: Request) {
  try {
    const merchantKey = process.env.PAYTR_MERCHANT_KEY;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

    if (!merchantKey || !merchantSalt) {
      return new NextResponse('PAYTR_ENV_MISSING', { status: 500 });
    }

    const form = await req.formData();
    const body = Object.fromEntries(form.entries()) as Record<string, string>;

    const payload: PayTRCallbackBody = {
      merchant_oid: String(body.merchant_oid || ''),
      status: (body.status as 'success' | 'failed') || 'failed',
      total_amount: String(body.total_amount || ''),
      hash: String(body.hash || ''),
      failed_reason_code: body.failed_reason_code,
      failed_reason_msg: body.failed_reason_msg,
      test_mode: body.test_mode as '1' | '0' | undefined,
      payment_type: body.payment_type,
      currency: body.currency,
    };

    if (!payload.merchant_oid || !payload.total_amount || !payload.hash) {
      return new NextResponse('BAD_REQUEST', { status: 400 });
    }

    const expectedHash = createCallbackHash(
      payload.merchant_oid,
      payload.status,
      payload.total_amount,
      merchantSalt,
      merchantKey
    );

    if (expectedHash !== payload.hash) {
      console.error('PAYTR_CALLBACK_HASH_MISMATCH', {
        merchant_oid: payload.merchant_oid,
        expectedHash,
        got: payload.hash,
      });
      return new NextResponse('PAYTR notification failed', { status: 400 });
    }

    const orderId = resolveOrderId(payload.merchant_oid);
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, paymentStatus: true, paymentMethod: true },
    });

    if (!existing) {
      console.error('PAYTR_CALLBACK_ORDER_NOT_FOUND', { merchant_oid: payload.merchant_oid, orderId });
      return okResponse();
    }

    if (existing.paymentStatus === 'PAID') {
      return okResponse();
    }

    // ÖNEMLİ: PayTR tekrar bildirim atabileceği için update işlemi idempotent olmalı.
    if (payload.status === 'success') {
      const updated = await prisma.order.updateMany({
        where: { id: existing.id, paymentStatus: { not: 'PAID' } },
        data: {
          paymentStatus: 'PAID',
          status: 'PROCESSING',
        },
      });

      if (updated.count === 0) {
        return okResponse();
      }

      if (existing.paymentMethod === 'CARD') {
        const paidOrder = await prisma.order.findUnique({
          where: { id: existing.id },
          select: {
            id: true,
            paymentMethod: true,
            barcode: true,
            totalAmount: true,
            createdAt: true,
            guestEmail: true,
            guestFirstName: true,
            guestLastName: true,
            guestCity: true,
            guestDistrict: true,
            guestAddress: true,
            user: { select: { email: true, name: true } },
            address: {
              select: {
                title: true,
                line1: true,
                line2: true,
                district: true,
                city: true,
                postalCode: true,
              },
            },
            items: {
              select: {
                productName: true,
                quantity: true,
                unitPrice: true,
                totalPrice: true,
                imageUrl: true,
              },
            },
          },
        });

        if (!paidOrder) {
          console.error('PAYTR_CALLBACK_ORDER_NOT_FOUND_AFTER_UPDATE', { merchant_oid: payload.merchant_oid, orderId });
          return okResponse();
        }

        if (!process.env.RESEND_API_KEY) {
          console.error('🚨 KRİTİK HATA: RESEND_API_KEY .env dosyasından okunamadı! Sunucuyu kapatıp açtığınızdan emin olun.');
        } else {
          try {
            const resend = new Resend(process.env.RESEND_API_KEY);

            const emailHtml = await render(
              OrderConfirmation({
                orderNumber: paidOrder.barcode || `#${paidOrder.id.slice(-8)}`,
                customerName:
                  paidOrder.user?.name
                  || `${paidOrder.guestFirstName ?? ''} ${paidOrder.guestLastName ?? ''}`.trim()
                  || 'Değerli Müşterimiz',
                customerEmail: paidOrder.user?.email || paidOrder.guestEmail || '',
                paymentMethod: paidOrder.paymentMethod,
                items: paidOrder.items.map((item) => ({
                  productName: item.productName,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  totalPrice: item.totalPrice,
                  imageUrl: item.imageUrl,
                })),
                totalAmount: paidOrder.totalAmount,
                orderDate: paidOrder.createdAt.toISOString(),
                shippingAddress: paidOrder.address ? {
                  title: paidOrder.address.title || undefined,
                  line1: paidOrder.address.line1,
                  line2: paidOrder.address.line2 || undefined,
                  district: paidOrder.address.district || undefined,
                  city: paidOrder.address.city,
                  postalCode: paidOrder.address.postalCode || undefined,
                } : {
                  title: `${paidOrder.guestFirstName ?? ''} ${paidOrder.guestLastName ?? ''}`.trim() || undefined,
                  line1: paidOrder.guestAddress || '',
                  line2: undefined,
                  district: paidOrder.guestDistrict || undefined,
                  city: paidOrder.guestCity || '',
                  postalCode: undefined,
                },
              })
            );

            const adminEmail = process.env.ADMIN_EMAIL || 'volkanongunn@gmail.com';
            const customerEmail = paidOrder.user?.email || paidOrder.guestEmail || adminEmail;

            console.log('📧 RESEND GÖNDERİLİYOR:', { to: customerEmail, bcc: adminEmail, orderNo: paidOrder.barcode });

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
            console.error(
              '❌ RESEND GÖNDERİM HATASI:',
              emailError instanceof Error ? emailError.message : emailError,
              emailError
            );
          }
        }
      }
    }

    return okResponse();
  } catch (error) {
    console.error('PAYTR_CALLBACK_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
