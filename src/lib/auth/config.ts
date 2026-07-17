import type { NextAuthConfig } from 'next-auth';
import '@/lib/auth/types';

/**
 * Edge-compatible Auth.js config (no Prisma / argon2 imports).
 * Full Credentials provider is registered in `auth.ts`.
 */
const isProduction = process.env.NODE_ENV === 'production';

export const authConfig = {
  providers: [],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    // 4h max session lifetime (was 8h): bounds how long a JWT for a
    // deactivated admin stays valid before it must be re-issued. Mutating
    // entry points additionally re-check `Admin.isActive` in the database
    // (see requireAdminSession), so this is a defense-in-depth reduction,
    // not the primary revocation mechanism.
    maxAge: 60 * 60 * 4,
    updateAge: 60 * 60,
  },
  useSecureCookies: isProduction,
  cookies: {
    sessionToken: {
      name: isProduction ? '__Secure-authjs.session-token' : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
  },
  trustHost: true,
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      if (!pathname.startsWith('/admin')) {
        return true;
      }

      if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
        return true;
      }

      return Boolean(auth?.user);
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.sub === 'string' ? token.sub : '';
        session.user.role = 'ADMIN';
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
