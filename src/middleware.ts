import createMiddleware from 'next-intl/middleware';
import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth/config';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

const ADMIN_NO_STORE = 'private, no-store, max-age=0, must-revalidate';

export default auth((request) => {
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

  return intlMiddleware(request);
});

export const config = {
  matcher: ['/', '/(hy|en|ru)/:path*', '/admin/:path*'],
};
