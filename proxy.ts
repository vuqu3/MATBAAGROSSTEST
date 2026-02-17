import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Next.js 16: middleware → proxy (aynı API)
export async function proxy(request: NextRequest) {
  // API route'larını ve NextAuth route'larını atla
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  // Login sayfasındaysa ve zaten giriş yapmışsa dashboard'a yönlendir
  if (isLoginPage && token) {
    if (token.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Admin rotalarına erişim kontrolü
  if (isAdminRoute && !isLoginPage) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin route'larını koru, API route'larını hariç tut
    '/admin/:path*',
  ],
};
