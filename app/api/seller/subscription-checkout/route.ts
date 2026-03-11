import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resolveVendorForSession } from '@/lib/getMatbaaGrossVendor';
import { ensureSubscriptionPlans } from '@/lib/subscriptionPlans';

function toKurus(amountTl: number) {
  return Math.round((Number.isFinite(amountTl) ? amountTl : 0) * 100);
}

function base64Encode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64');
}

function createPaytrToken(payload: string, merchantKey: string): string {
  return crypto.createHmac('sha256', merchantKey).update(payload).digest('base64');
}

function ensureHttpsUrl(url: string) {
  const u = String(url || '').trim();
  if (!u) return u;
  if (u.startsWith('https://')) return u;
  if (u.startsWith('http://')) return `https://${u.slice('http://'.length)}`;
  return u;
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

function sanitizeOidPart(v: string) {
  return String(v || '').replace(/[^a-zA-Z0-9]/g, '');
}

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

  await ensureSubscriptionPlans();

  const vendor = await resolveVendorForSession(session.user.id, session.user.role).catch(() => null);
  const vendorId: string | null = vendor ? String((vendor as any).id) : null;
  if (!vendorId) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as any;
  const planId = typeof body?.planId === 'string' ? body.planId : '';
  if (!planId) return NextResponse.json({ error: 'planId gerekli' }, { status: 400 });

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
    select: { id: true, name: true, durationDays: true, price: true, isActive: true },
  });

  if (!plan || !plan.isActive) {
    return NextResponse.json({ error: 'Paket bulunamadı' }, { status: 404 });
  }

  const vatRate = 0.2;
  const payableTl = Math.round(plan.price * (1 + vatRate) * 100) / 100;
  const amountKurus = toKurus(payableTl);

  const purchase = await prisma.subscriptionPurchase.create({
    data: {
      planId: plan.id,
      vendorId,
      amountKurus,
      vatRate,
      status: 'PENDING',
      merchantOid: `SUB${sanitizeOidPart(crypto.randomUUID())}`,
    },
    select: { id: true, merchantOid: true },
  });

  const userBasket = base64Encode(JSON.stringify([[`Abonelik Paketi: ${plan.name}`, String(payableTl), 1]]));
  const userIp = getClientIp(req);

  const email = String(session.user.email || '').trim() || 'billing@matbaagross.com';
  const userName = String((session.user as any)?.name || '').trim() || 'Satıcı';
  const userPhone = '05555555555';
  const userAddress = 'Türkiye';

  const paymentAmount = amountKurus;

  const tokenPayload =
    `${merchantId}${userIp}${purchase.merchantOid}${email}${paymentAmount}${userBasket}` + `${0}${0}TL${0}${merchantSalt}`;
  const paytrToken = createPaytrToken(tokenPayload, merchantKey);

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'https://www.matbaagross.com';

  const httpsBaseUrl = ensureHttpsUrl(baseUrl);

  const okUrl = `${httpsBaseUrl}/seller-dashboard/subscription?success=1`;
  const failUrl = `${httpsBaseUrl}/seller-dashboard/subscription?fail=1`;

  const paytrReq = new URLSearchParams();
  paytrReq.set('merchant_id', String(merchantId));
  paytrReq.set('user_ip', userIp);
  paytrReq.set('merchant_oid', purchase.merchantOid);
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
    return NextResponse.json({ error: data?.reason || 'PayTR token alınamadı' }, { status: 502 });
  }

  const token = String(data.token);
  return NextResponse.json({
    token,
    iframeUrl: `https://www.paytr.com/odeme/guvenli/${encodeURIComponent(token)}`,
  });
}
