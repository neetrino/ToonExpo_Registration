import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth/config';
import { handleIntlRouting } from './i18n/intl-middleware';

const { auth } = NextAuth(authConfig);

const ADMIN_NO_STORE = 'private, no-store, max-age=0, must-revalidate';

export const proxy = auth((request) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const isLogin = pathname === '/admin/login' || pathname.startsWith('/admin/login/');
    const isAuthenticated = Boolean(request.auth?.user);

    if (!isLogin && !isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.nextUrl.origin);
      loginUrl.searchParams.set('callbackUrl', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.headers.set('Cache-Control', ADMIN_NO_STORE);
      return response;
    }

    if (isLogin && isAuthenticated) {
      const response = NextResponse.redirect(new URL('/admin', request.nextUrl.origin));
      response.headers.set('Cache-Control', ADMIN_NO_STORE);
      return response;
    }

    const response = NextResponse.next();
    response.headers.set('Cache-Control', ADMIN_NO_STORE);
    return response;
  }

  if (pathname.startsWith('/ticket')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', ADMIN_NO_STORE);
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Referrer-Policy', 'no-referrer');
    return response;
  }

  return handleIntlRouting(request);
});

export const config = {
  matcher: ['/', '/(hy|en|ru)/:path*', '/admin/:path*', '/ticket/:path*'],
};
