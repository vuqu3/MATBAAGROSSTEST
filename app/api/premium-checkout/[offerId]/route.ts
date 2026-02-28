import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PremiumQuoteOfferStatus, PremiumQuoteRequestStatus } from '@prisma/client';
import { Resend } from 'resend';

const COMMISSION_RATE = 0.1;

export async function GET(_: Request, ctx: { params: Promise<{ offerId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { offerId } = await ctx.params;

    const offer = await prisma.premiumQuoteOffer.findUnique({
      where: { id: offerId },
      select: {
        id: true,
        requestId: true,
        vendorId: true,
        price: true,
        unitPrice: true,
        totalPrice: true,
        deliveryTime: true,
        note: true,
        status: true,
        createdAt: true,
        request: {
          select: {
            id: true,
            requestNo: true,
            productName: true,
            quantity: true,
            status: true,
            userId: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            slug: true,
            commissionRate: true,
          },
        },
      },
    });

    if (!offer || offer.request.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const total = Number(offer.totalPrice ?? offer.price);
    const net = Math.round(total * (1 - COMMISSION_RATE) * 100) / 100;

    return NextResponse.json({
      offer,
      totals: {
        total,
        commissionRate: COMMISSION_RATE,
        net,
      },
    });
  } catch (error) {
    console.error('PREMIUM_CHECKOUT_GET_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(_: Request, ctx: { params: Promise<{ offerId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { offerId } = await ctx.params;

    const updated = await prisma.$transaction(async (tx) => {
      const offer = await tx.premiumQuoteOffer.findUnique({
        where: { id: offerId },
        select: {
          id: true,
          status: true,
          vendorId: true,
          price: true,
          totalPrice: true,
          requestId: true,
          request: { select: { id: true, userId: true } },
        },
      });

      if (!offer || offer.request.userId !== session.user.id) {
        return { error: 'Not found', status: 404 as const };
      }

      if (offer.status !== PremiumQuoteOfferStatus.PENDING) {
        return { error: 'Teklif ödeme alınabilir durumda değil', status: 400 as const };
      }

      const total = Number(offer.totalPrice ?? offer.price);
      if (!Number.isFinite(total) || total <= 0) {
        return { error: 'Teklif tutarı geçersiz', status: 400 as const };
      }

      const offerUpdated = await tx.premiumQuoteOffer.update({
        where: { id: offerId },
        data: { status: PremiumQuoteOfferStatus.PAID },
        select: { id: true, status: true, requestId: true, vendorId: true },
      });

      await tx.premiumQuoteRequest.update({
        where: { id: offerUpdated.requestId },
        data: { status: PremiumQuoteRequestStatus.PROCESSING },
        select: { id: true },
      });

      const net = Math.round(total * (1 - COMMISSION_RATE) * 100) / 100;

      await tx.vendor.update({
        where: { id: offerUpdated.vendorId },
        data: {
          pendingBalance: {
            increment: net,
          },
        },
        select: { id: true },
      });

      return { data: offerUpdated };
    });

    if ('error' in updated) {
      return NextResponse.json({ error: updated.error }, { status: updated.status });
    }

    // Send email notification after successful payment
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        // Fetch full details for email
        const fullOffer = await prisma.premiumQuoteOffer.findUnique({
          where: { id: offerId },
          include: {
            request: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            },
            vendor: {
              select: { name: true }
            }
          }
        });

        if (fullOffer?.request?.user?.email) {
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #FF6000; margin: 0;">Matbaagross Premium</h1>
                <p style="color: #666; margin: 5px 0;">Siparişiniz Alındı!</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #333; margin-top: 0;">Sipariş Detayları</h2>
                <p><strong>Talep No:</strong> ${fullOffer.request.requestNo}</p>
                <p><strong>Ürün:</strong> ${fullOffer.request.productName}</p>
                <p><strong>Adet:</strong> ${Number(fullOffer.request.quantity).toLocaleString('tr-TR')}</p>
                <p><strong>Toplam Tutar:</strong> ${Number(fullOffer.totalPrice ?? fullOffer.price).toLocaleString('tr-TR')} TL</p>
                <p><strong>Üretici:</strong> ${fullOffer.vendor.name}</p>
                <p><strong>Teslimat Süresi:</strong> ${fullOffer.deliveryTime}</p>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <p style="margin: 0; color: #856404;">
                  <strong>Önemli Bilgi:</strong> Matbaagross Premium siparişiniz alınmıştır ve üreticiye bilgi geçilmiştir. 
                  Siparişleriniz Matbaagross güvencesi altında üretime başlayacaktır.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 14px; margin: 0;">
                  Bu e-posta Matbaagross Premium sistemi tarafından otomatik olarak gönderilmiştir.
                </p>
              </div>
            </div>
          `;

          const adminEmail = process.env.ADMIN_EMAIL || 'volkanongunn@gmail.com';
          
          const { data, error } = await resend.emails.send({
            from: 'MatbaaGross Premium <noreply@matbaagross.com>',
            to: fullOffer.request.user.email,
            bcc: [adminEmail],
            subject: `Premium Siparişiniz Alındı! - ${fullOffer.request.requestNo}`,
            html: emailHtml,
          });

          if (error) {
            console.error('❌ PREMIUM PAYMENT EMAIL ERROR:', JSON.stringify(error));
          } else {
            console.log('✅ PREMIUM PAYMENT EMAIL SENT:', data);
          }
        }
      } catch (emailError) {
        console.error('❌ PREMIUM PAYMENT EMAIL ERROR:', emailError);
      }
    }

    return NextResponse.json(updated.data);
  } catch (error) {
    console.error('PREMIUM_CHECKOUT_POST_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
