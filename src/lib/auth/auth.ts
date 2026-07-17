import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { getPrisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { authConfig } from '@/lib/auth/config';
import { isLoginAllowed, recordLoginFailure, recordLoginSuccess } from '@/lib/auth/login-throttle';
import { verifyPassword } from '@/lib/auth/password';
import '@/lib/auth/types';

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(256),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const emailNormalized = parsed.data.email.toLowerCase();
        const throttleKey = `email:${emailNormalized}`;
        const throttle = isLoginAllowed(throttleKey);

        if (!throttle.allowed) {
          logger.warn('Admin login throttled', { retryAfterMs: throttle.retryAfterMs });
          return null;
        }

        const prisma = getPrisma();
        const admin = await prisma.admin.findUnique({
          where: { email: emailNormalized },
        });

        if (!admin || !admin.isActive) {
          recordLoginFailure(throttleKey);
          return null;
        }

        const valid = await verifyPassword(admin.passwordHash, parsed.data.password);
        if (!valid) {
          recordLoginFailure(throttleKey);
          return null;
        }

        recordLoginSuccess(throttleKey);

        return {
          id: admin.id,
          email: admin.email,
          role: 'ADMIN' as const,
        };
      },
    }),
  ],
});
