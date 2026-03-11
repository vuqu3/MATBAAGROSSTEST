import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PremiumQuoteOfferStatus, PremiumQuoteRequestStatus } from '@prisma/client';
import crypto from 'crypto';

const COMMISSION_RATE = 0;
const PAYTR_RATE = 0.032;

function toKurus(amountTl: number) {
  return Math.round((Number.isFinite(amountTl) ? amountTl : 0) * 100);
}

function base64Encode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64');
}

function isValidIp(ip: string) {
  const v = String(ip || '').trim();
  if (!v) return false;
  const ipv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(v);
  if (ipv4) {
    const parts = v.split('.').map((x) => Number.parseInt(x, 10));
    if (parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return false;
    return true;
  }
  const ipv6 = /^[0-9a-f:]+$/i.test(v) && v.includes(':');
  return ipv6;
}

function isPrivateIp(ip: string) {
  const v = String(ip || '').trim();
  if (!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(v)) return false;
  const [a, b] = v.split('.').map((x) => Number.parseInt(x, 10));
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

function parseForwardedFor(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => v.replace(/^\[|\]$/g, ''));
}

function getClientIp(req: Request): string {
  const candidates = [
    ...parseForwardedFor(req.headers.get('x-forwarded-for')),
    ...parseForwardedFor(req.headers.get('http_x_forwarded_for')),
    req.headers.get('cf-connecting-ip'),
    req.headers.get('x-client-ip'),
    req.headers.get('http_client_ip'),
    req.headers.get('x-real-ip'),
  ].filter((v): v is string => Boolean(v));

  const firstPublic = candidates.find((ip) => isValidIp(ip) && !isPrivateIp(ip));
  if (firstPublic) return firstPublic;

  const firstValid = candidates.find((ip) => isValidIp(ip));
  if (firstValid) return firstValid;

  return '127.0.0.1';
}

function ensureHttpsUrl(url: string) {
  const u = String(url || '').trim();
  if (!u) return u;
  if (u.startsWith('https://')) return u;
  if (u.startsWith('http://')) return `https://${u.slice('http://'.length)}`;
  return u;
}

function createPaytrToken(payload: string, merchantKey: string): string {
  return crypto.createHmac('sha256', merchantKey).update(payload).digest('base64');
}

function sanitizeOidPart(v: string) {
  return String(v || '').replace(/[^a-zA-Z0-9]/g, '');
}

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
    const commissionApplied = Math.round(total * (1 + COMMISSION_RATE) * 100) / 100;
    const payable = Math.round((commissionApplied / (1 - PAYTR_RATE)) * 100) / 100;
    const net = Math.round(total * (1 - COMMISSION_RATE) * 100) / 100;

    return NextResponse.json({
      offer,
      totals: {
        total,
        commissionRate: COMMISSION_RATE,
        payable,
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

    const merchantId = process.env.PAYTR_MERCHANT_ID;
    const merchantKey = process.env.PAYTR_MERCHANT_KEY;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

    if (!merchantId || !merchantKey || !merchantSalt) {
      return NextResponse.json(
        { error: 'PayTR env değişkenleri eksik (PAYTR_MERCHANT_ID/KEY/SALT).' },
        { status: 500 }
      );
    }

    const { offerId } = await ctx.params;

    const tokenResp = await prisma.$transaction(async (tx) => {
      const offer = await tx.premiumQuoteOffer.findUnique({
        where: { id: offerId },
        select: {
          id: true,
          status: true,
          vendorId: true,
          price: true,
          totalPrice: true,
          requestId: true,
          request: { select: { id: true, userId: true, requestNo: true, productName: true, status: true } },
        },
      });

      if (!offer || offer.request.userId !== session.user.id) {
        return { error: 'Not found', status: 404 as const };
      }

      const allowedStatuses: PremiumQuoteOfferStatus[] = [
        PremiumQuoteOfferStatus.ACCEPTED,
        PremiumQuoteOfferStatus.PENDING,
      ];
      if (!allowedStatuses.includes(offer.status)) {
        return { error: 'Teklif ödeme alınabilir durumda değil', status: 400 as const };
      }

      if (offer.request.status === PremiumQuoteRequestStatus.PROCESSING || offer.request.status === PremiumQuoteRequestStatus.COMPLETED) {
        return { error: 'Bu talep artık ödeme alınabilir durumda değil', status: 400 as const };
      }

      const total = Number(offer.totalPrice ?? offer.price);
      if (!Number.isFinite(total) || total <= 0) {
        return { error: 'Teklif tutarı geçersiz', status: 400 as const };
      }

      const commissionApplied = Math.round(total * (1 + COMMISSION_RATE) * 100) / 100;
      const payable = Math.round((commissionApplied / (1 - PAYTR_RATE)) * 100) / 100;

      const userDb = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, name: true, phoneNumber: true },
      });

      const email = userDb?.email || session.user.email || '';
      if (!email) {
        return { error: 'E-posta bilgisi eksik', status: 400 as const };
      }

      const userName = userDb?.name || email.split('@')[0] || 'Müşteri';
      const userPhone = userDb?.phoneNumber || '05555555555';
      const userAddress = 'Türkiye';

      const userBasket = base64Encode(
        JSON.stringify([[String(offer.request.productName || 'Premium Üretim'), String(payable), 1]])
      );

      const userIp = getClientIp(_);
      const merchantOid = `PRM${sanitizeOidPart(offer.id)}`;
      const paymentAmount = toKurus(payable);

      const tokenPayload =
        `${merchantId}${userIp}${merchantOid}${email}${paymentAmount}${userBasket}`
        + `${0}${0}TL${0}${merchantSalt}`;
      const paytrToken = createPaytrToken(tokenPayload, merchantKey);

      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXTAUTH_URL ||
        'https://www.matbaagross.com';

      const httpsBaseUrl = ensureHttpsUrl(baseUrl);
      const okUrl = `${httpsBaseUrl}/hesabim/premium-islerim?success=${encodeURIComponent(offer.id)}&requestNo=${encodeURIComponent(offer.request.requestNo)}`;
      const failUrl = `${httpsBaseUrl}/hesabim/premium-islerim?fail=1&offerId=${encodeURIComponent(offer.id)}&requestNo=${encodeURIComponent(offer.request.requestNo)}`;

      const paytrReq = new URLSearchParams();
      paytrReq.set('merchant_id', String(merchantId));
      paytrReq.set('user_ip', userIp);
      paytrReq.set('merchant_oid', merchantOid);
      paytrReq.set('email', email);
      paytrReq.set('payment_amount', String(paymentAmount));
      paytrReq.set('user_basket', userBasket);
      paytrReq.set('no_installment', '0');
      paytrReq.set('max_installment', '0');
      paytrReq.set('currency', 'TL');
      paytrReq.set('test_mode', '0');
      paytrReq.set('paytr_token', paytrToken);
      paytrReq.set('debug_on', '0');
      paytrReq.set('user_name', userName);
      paytrReq.set('user_address', userAddress);
      paytrReq.set('user_phone', userPhone);
      paytrReq.set('merchant_ok_url', okUrl);
      paytrReq.set('merchant_fail_url', failUrl);
      paytrReq.set('timeout_limit', '30');
      paytrReq.set('lang', 'tr');

      const resp = await fetch('https://www.paytr.com/odeme/api/get-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: paytrReq,
        cache: 'no-store',
      });

      const rawText = await resp.text().catch(() => '');
      const data = (() => {
        try {
          return JSON.parse(rawText) as any;
        } catch {
          return null;
        }
      })();

      if (!resp.ok || !data || data.status !== 'success' || !data.token) {
        console.error('PAYTR_PREMIUM_GET_TOKEN_FAILED', {
          httpStatus: resp.status,
          reason: data?.reason,
          merchant_oid: merchantOid,
          user_ip: userIp,
          raw: rawText?.slice(0, 1000),
        });
        return { error: data?.reason || 'PayTR token alınamadı', status: 502 as const };
      }

      return {
        data: {
          token: String(data.token),
          merchantOid,
          iframeUrl: `https://www.paytr.com/odeme/guvenli/${encodeURIComponent(String(data.token))}`,
          payable,
          requestNo: offer.request.requestNo,
        },
      };
    });

    if ('error' in tokenResp) {
      return NextResponse.json({ error: tokenResp.error }, { status: tokenResp.status });
    }

    return NextResponse.json(tokenResp.data);
  } catch (error) {
    console.error('PREMIUM_CHECKOUT_POST_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
