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

function resolvePremiumOfferId(merchantOid: string): string {
  const raw = String(merchantOid || '').trim().replace(/[^a-zA-Z0-9]/g, '');
  if (raw.startsWith('PRM')) return raw.slice(3);
  return raw;
}

function resolveSubscriptionMerchantOid(merchantOid: string): string {
  return String(merchantOid || '').trim().replace(/[^a-zA-Z0-9]/g, '');
}

function toKurus(amountTl: number) {
  return Math.round((Number.isFinite(amountTl) ? amountTl : 0) * 100);
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

    const merchantOidClean = String(payload.merchant_oid || '').trim().replace(/[^a-zA-Z0-9]/g, '');
    if (merchantOidClean.startsWith('SUB')) {
      const merchantOid = resolveSubscriptionMerchantOid(payload.merchant_oid);

      const purchase = await (prisma as any).subscriptionPurchase.findUnique({
        where: { merchantOid },
        select: {
          id: true,
          status: true,
          amountKurus: true,
          vendorId: true,
          plan: { select: { durationDays: true } },
        },
      });

      if (!purchase) {
        console.error('PAYTR_CALLBACK_SUBSCRIPTION_PURCHASE_NOT_FOUND', { merchant_oid: payload.merchant_oid, merchantOid });
        return okResponse();
      }

      if (String(purchase.status).toUpperCase() === 'PAID') {
        return okResponse();
      }

      const receivedTotalKurus = Number.parseInt(String(payload.total_amount || '0'), 10) || 0;
      if (purchase.amountKurus !== receivedTotalKurus) {
        console.error('PAYTR_CALLBACK_SUBSCRIPTION_TOTAL_MISMATCH', {
          merchant_oid: payload.merchant_oid,
          merchantOid,
          expectedTotalKurus: purchase.amountKurus,
          receivedTotalKurus,
        });
        return okResponse();
      }

      if (payload.status === 'success') {
        const days = Math.max(1, Math.floor(Number(purchase.plan?.durationDays) || 0));

        const updated = await prisma.$transaction(async (tx) => {
          const res = await (tx as any).subscriptionPurchase.updateMany({
            where: { id: purchase.id, status: { not: 'PAID' } },
            data: { status: 'PAID', paidAt: new Date() },
          });

          if (!res?.count) return { count: 0 };

          const vendor = await tx.vendor.findUnique({
            where: { id: purchase.vendorId },
            select: { subscriptionEndsAt: true },
          });

          const base = vendor?.subscriptionEndsAt && vendor.subscriptionEndsAt.getTime() > Date.now()
            ? vendor.subscriptionEndsAt
            : new Date();

          const nextEndsAt = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

          await tx.vendor.update({
            where: { id: purchase.vendorId },
            data: {
              subscriptionStatus: 'ACTIVE' as any,
              subscriptionEndsAt: nextEndsAt,
            },
          });

          return res;
        });

        if ((updated as any)?.count === 0) return okResponse();
      }

      return okResponse();
    }

    if (merchantOidClean.startsWith('PRM')) {
      const offerId = resolvePremiumOfferId(payload.merchant_oid);

      const existingOffer = await prisma.premiumQuoteOffer.findUnique({
        where: { id: offerId },
        select: {
          id: true,
          status: true,
          requestId: true,
          vendor: { select: { ownerId: true } },
          request: { select: { userId: true } },
        },
      });

      if (!existingOffer) {
        console.error('PAYTR_CALLBACK_PREMIUM_OFFER_NOT_FOUND', { merchant_oid: payload.merchant_oid, offerId });
        return okResponse();
      }

      if (existingOffer.status === 'PAID') {
        return okResponse();
      }

      if (payload.status === 'success') {
        const updated = await prisma.premiumQuoteOffer.updateMany({
          where: { id: existingOffer.id, status: { not: 'PAID' } },
          data: { status: 'PAID' },
        });

        if (updated.count === 0) {
          return okResponse();
        }

        await prisma.premiumQuoteRequest.updateMany({
          where: { id: existingOffer.requestId, status: { not: 'PROCESSING' } },
          data: { status: 'PROCESSING' },
        });

        const systemText =
          '🟢 ÖDEME ONAYLANDI: Müşteri ödemeyi başarıyla tamamladı. Tutar Matbaagross güvenli havuzuna aktarılmıştır. Üretime başlayabilirsiniz.';

        const senderId = existingOffer.vendor.ownerId;
        const receiverId = existingOffer.request.userId;

        if (senderId && receiverId) {
          const exists = await prisma.quoteMessage.findFirst({
            where: {
              quoteId: existingOffer.id,
              isSystemMessage: true,
              content: systemText,
            },
            select: { id: true },
          });

          if (!exists) {
            await prisma.quoteMessage.create({
              data: {
                quoteId: existingOffer.id,
                senderId,
                receiverId,
                type: 'TEXT',
                content: systemText,
                isSystemMessage: true,
              },
              select: { id: true },
            });
          }
        }
      }

      return okResponse();
    }

    const orderId = resolveOrderId(payload.merchant_oid);
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, paymentStatus: true, paymentMethod: true, totalAmount: true },
    });

    if (!existing) {
      console.error('PAYTR_CALLBACK_ORDER_NOT_FOUND', { merchant_oid: payload.merchant_oid, orderId });
      return okResponse();
    }

    if (existing.paymentStatus === 'PAID') {
      return okResponse();
    }

    const expectedTotalKurus = toKurus(existing.totalAmount);
    const receivedTotalKurus = Number.parseInt(String(payload.total_amount || '0'), 10) || 0;
    if (expectedTotalKurus !== receivedTotalKurus) {
      console.error('PAYTR_CALLBACK_TOTAL_MISMATCH', {
        merchant_oid: payload.merchant_oid,
        orderId,
        expectedTotalKurus,
        receivedTotalKurus,
      });
      // Always respond OK to PayTR to stop retries, but do NOT mark as paid.
      return okResponse();
    }

    // ÖNEMLİ: PayTR tekrar bildirim atabileceği için update işlemi idempotent olmalı.
    if (payload.status === 'success') {
      const updated = await prisma.$transaction(async (tx) => {
        const res = await tx.order.updateMany({
          where: { id: existing.id, paymentStatus: { not: 'PAID' } },
          data: {
            paymentStatus: 'PAID',
            status: 'PROCESSING',
          },
        });

        // Only if we actually transitioned to PAID, decrement stock (idempotent).
        if (res.count > 0 && existing.paymentMethod === 'CARD') {
          const orderForStock = await tx.order.findUnique({
            where: { id: existing.id },
            select: {
              id: true,
              items: {
                select: {
                  productId: true,
                  quantity: true,
                  options: true,
                },
              },
            },
          });

          const items = Array.isArray(orderForStock?.items) ? orderForStock!.items : [];
          for (const it of items) {
            const qty = Math.max(1, Math.floor(Number((it as any)?.quantity) || 0));
            const options = (it as any)?.options as Record<string, any> | null | undefined;
            const variantId = options?.variantId as string | undefined;
            const variantName = options?.variantName as string | undefined;

            if (variantId || variantName) {
              // Try update by id first; if not available, fallback to (productId+name)
              if (variantId) {
                await tx.productVariant.update({
                  where: { id: variantId },
                  data: { stock: { decrement: qty } },
                }).catch(() => null);
              } else {
                await tx.productVariant.updateMany({
                  where: { productId: it.productId, name: String(variantName) },
                  data: { stock: { decrement: qty } },
                }).catch(() => null);
              }
            }

            await tx.product.update({
              where: { id: it.productId },
              data: {
                stock: { decrement: qty },
                stockQuantity: { decrement: qty },
              },
            }).catch(() => null);
          }
        }

        return res;
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
                productId: true,
                productName: true,
                quantity: true,
                unitPrice: true,
                totalPrice: true,
                imageUrl: true,
                options: true,
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
