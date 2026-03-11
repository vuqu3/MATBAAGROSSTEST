import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const hostLc = host.toLowerCase().replace(/:\d+$/, '');
  const proto = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol.replace(':', '');
  const isFabrika = hostLc === 'fabrika.matbaagross.com';
  const isWww = hostLc === 'www.matbaagross.com';

  const pathname = req.nextUrl.pathname;
  const search = req.nextUrl.search;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = String((token as any)?.role || '').toUpperCase();

  const isAdminRoute = pathname.startsWith('/admin');
  if (isAdminRoute && role !== 'ADMIN') {
    if (role === 'SELLER') {
      return NextResponse.redirect(new URL('https://fabrika.matbaagross.com/seller-dashboard'));
    }
    return NextResponse.redirect(new URL('https://www.matbaagross.com/giris'));
  }

  // Move seller auth/dashboard entirely to fabrika subdomain.
  if (isWww && (pathname === '/seller-login' || pathname.startsWith('/seller-login/') || pathname.startsWith('/seller-dashboard'))) {
    const url = req.nextUrl.clone();
    url.hostname = 'fabrika.matbaagross.com';
    url.protocol = 'https:';
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  // Admin panel must live on www domain. Avoid rewriting /admin into /pro/admin on fabrika domain.
  if (isFabrika && isAdminRoute) {
    const url = req.nextUrl.clone();
    url.hostname = 'www.matbaagross.com';
    url.protocol = 'https:';
    url.port = '';
    return NextResponse.redirect(url);
  }

  // Force HTTPS + www for all non-fabrika, non-www requests
  if (!isFabrika && (!isWww || proto === 'http')) {
    const url = req.nextUrl.clone();
    url.hostname = 'www.matbaagross.com';
    url.protocol = 'https:';
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  if (!isFabrika) return NextResponse.next();

  // Allow static files and uploads to pass through untouched.
  if (pathname.startsWith('/uploads/')) {
    return NextResponse.next();
  }
  if (pathname.includes('.') && !pathname.endsWith('.well-known')) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap')
  ) {
    return NextResponse.next();
  }

  if (pathname === '/' || pathname.trim() === '') {
    const url = req.nextUrl.clone();
    url.pathname = '/fabrika-landing';
    url.search = search;
    return NextResponse.rewrite(url);
  }

  if (
    pathname.startsWith('/fabrika-landing') ||
    pathname.startsWith('/seller-login') ||
    pathname.startsWith('/tedarikci-ol') ||
    pathname.startsWith('/seller-dashboard')
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/pro/')) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = `/pro${pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next).*)'],
};
