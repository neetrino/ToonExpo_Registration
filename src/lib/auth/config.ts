import type { NextAuthConfig } from 'next-auth';
import '@/lib/auth/types';

/**
 * Edge-compatible Auth.js config (no Prisma / argon2 imports).
 * Full Credentials provider is registered in `auth.ts`.
 */
export const authConfig = {
  providers: [],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 8,
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
