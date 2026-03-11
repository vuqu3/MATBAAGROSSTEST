import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

type PayTRBasketItem = [string, string, number];

type PayTRGetTokenRequest = {
  merchant_id: string;
  user_ip: string;
  merchant_oid: string;
  email: string;
  payment_amount: number; // Kuruş
  user_basket: string; // base64(JSON)
  no_installment: 0 | 1;
  max_installment: number;
  currency: 'TL';
  test_mode: 0 | 1;
  paytr_token: string;
  debug_on: 0 | 1;
  user_name: string;
  user_address: string;
  user_phone: string;
  merchant_ok_url: string;
  merchant_fail_url: string;
  timeout_limit: number;
  lang?: 'tr' | 'en';
};

type PayTRGetTokenResponseSuccess = {
  status: 'success';
  token: string;
};

type PayTRGetTokenResponseFailed = {
  status: 'failed';
  reason?: string;
};

type TokenApiRequestBody = {
  orderId: string;
  testMode?: boolean;
};

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

export async function POST(req: Request) {
  try {
    console.log('--- TOKEN API BAŞLADI ---');
    const merchantId = process.env.PAYTR_MERCHANT_ID;
    const merchantKey = process.env.PAYTR_MERCHANT_KEY;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

    if (!merchantId || !merchantKey || !merchantSalt) {
      return NextResponse.json(
        { error: 'PayTR env değişkenleri eksik (PAYTR_MERCHANT_ID/KEY/SALT).' },
        { status: 500 }
      );
    }

    const body = (await req.json()) as TokenApiRequestBody;
    const orderId = String(body?.orderId || '').trim();
    const testMode = body?.testMode ? 1 : 0;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId gerekli' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: { select: { email: true, name: true, phoneNumber: true } },
        address: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }

    const email = order.user?.email || order.guestEmail || '';
    if (!email) {
      return NextResponse.json({ error: 'Sipariş e-posta bilgisi eksik' }, { status: 400 });
    }

    const userName =
      order.user?.name || `${order.guestFirstName ?? ''} ${order.guestLastName ?? ''}`.trim() || 'Müşteri';
    const addressPhone = (order.address as any)?.phone as string | undefined;
    const userPhone = addressPhone || order.user?.phoneNumber || order.guestPhone || '05555555555';
    const userAddress =
      [
        order.address?.line1,
        order.address?.line2,
        order.address?.district,
        order.address?.city,
      ]
        .filter(Boolean)
        .join(' / ')
      || [order.guestAddress, order.guestDistrict, order.guestCity].filter(Boolean).join(' / ')
      || 'Türkiye';

    let userBasket = '';
    try {
      const rawItems = Array.isArray(order.items) ? order.items : [];
      const basket: PayTRBasketItem[] = rawItems.map((it) => [
        String((it as any)?.productName ?? 'Ürün'),
        String((it as any)?.unitPrice ?? 0),
        Math.max(1, Number((it as any)?.quantity) || 1),
      ]);

      userBasket = base64Encode(JSON.stringify(basket));
      console.log('SEPET:', userBasket);
    } catch (basketError) {
      console.error('TOKEN_API_BASKET_ERROR:', basketError);
      userBasket = base64Encode(JSON.stringify([]));
    }

    const paymentAmount = toKurus(order.totalAmount);
    const userIp = getClientIp(req);
    const sanitizedOrderId = String(order.id).replace(/[^a-zA-Z0-9]/g, '');
    const merchantOid = `MG${sanitizedOrderId}`;

    // PayTR dokümanına göre token üretim string'i (salt sonda)
    const tokenPayload =
      `${merchantId}${userIp}${merchantOid}${email}${paymentAmount}${userBasket}`
      + `${0}${0}TL${testMode}${merchantSalt}`;

    const paytrToken = createPaytrToken(tokenPayload, merchantKey);

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      'https://www.matbaagross.com';

    const httpsBaseUrl = ensureHttpsUrl(baseUrl);

    const paytrReq: PayTRGetTokenRequest = {
      merchant_id: merchantId,
      user_ip: userIp,
      merchant_oid: merchantOid,
      email,
      payment_amount: paymentAmount,
      user_basket: userBasket,
      no_installment: 0,
      max_installment: 0,
      currency: 'TL',
      test_mode: testMode,
      paytr_token: paytrToken,
      debug_on: 0,
      user_name: userName,
      user_address: userAddress,
      user_phone: userPhone,
      merchant_ok_url: `${httpsBaseUrl}/odeme/basarili?orderId=${encodeURIComponent(order.id)}`,
      merchant_fail_url: `${httpsBaseUrl}/odeme/hata?orderId=${encodeURIComponent(order.id)}`,
      timeout_limit: 30,
      lang: 'tr',
    };

    const form = new URLSearchParams();
    for (const [k, v] of Object.entries(paytrReq)) {
      if (v === undefined || v === null) continue;
      form.set(k, String(v));
    }

    const resp = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
      cache: 'no-store',
    });

    const rawText = await resp.text().catch(() => '');
    const data = (() => {
      try {
        return JSON.parse(rawText) as PayTRGetTokenResponseSuccess | PayTRGetTokenResponseFailed;
      } catch {
        return null;
      }
    })();

    if (!resp.ok) {
      const reason =
        (data && 'reason' in data && typeof (data as any).reason === 'string' && (data as any).reason)
        || `PayTR isteği başarısız (HTTP ${resp.status})`;

      console.error('PAYTR_GET_TOKEN_HTTP_ERROR', {
        status: resp.status,
        reason,
        merchant_oid: merchantOid,
        user_ip: userIp,
        raw: rawText?.slice(0, 1000),
      });

      return NextResponse.json(
        { error: `Ödeme sistemi ile bağlantı kurulamadı veya bir hata oluştu: ${reason}` },
        { status: 502 }
      );
    }

    if (!data || (data as any).status !== 'success' || typeof (data as any).token !== 'string' || !(data as any).token) {
      const reason =
        (data && 'reason' in data && typeof (data as any).reason === 'string' && (data as any).reason)
        || 'PayTR token oluşturulamadı';

      console.error('PAYTR_GET_TOKEN_FAILED', {
        reason,
        merchant_oid: merchantOid,
        user_ip: userIp,
        raw: rawText?.slice(0, 1000),
      });

      return NextResponse.json(
        { error: `Ödeme sistemi ile bağlantı kurulamadı veya bir hata oluştu: ${reason}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ token: (data as any).token, merchantOid });
  } catch (error) {
    console.error('TOKEN_API_FATAL_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
