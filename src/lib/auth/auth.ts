import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { getPrisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getClientIp } from '@/lib/security';
import { authConfig } from '@/lib/auth/config';
import { isLoginAllowed, recordLoginFailure, recordLoginSuccess } from '@/lib/auth/login-throttle';
import { verifyDummyPassword, verifyPassword } from '@/lib/auth/password';
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
      async authorize(credentials, request) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const emailNormalized = parsed.data.email.toLowerCase();
        const emailKey = `email:${emailNormalized}`;
        // Best-effort, per-instance throttling (see login-throttle.ts). Keying on
        // both email and IP catches credential-stuffing across many source IPs
        // for one account and password-spraying from one IP across many accounts.
        const clientIp = getClientIp(request);
        const ipKey = clientIp !== 'unknown' ? `ip:${clientIp}` : null;

        const emailThrottle = isLoginAllowed(emailKey);
        const ipThrottle = ipKey ? isLoginAllowed(ipKey) : ({ allowed: true } as const);

        if (!emailThrottle.allowed || !ipThrottle.allowed) {
          logger.warn('Admin login throttled', {
            retryAfterMs: !emailThrottle.allowed
              ? emailThrottle.retryAfterMs
              : !ipThrottle.allowed
                ? ipThrottle.retryAfterMs
                : 0,
          });
          return null;
        }

        const prisma = getPrisma();
        const admin = await prisma.admin.findUnique({
          where: { email: emailNormalized },
        });

        if (!admin || !admin.isActive) {
          // Run a real argon2 verify against a dummy hash so a nonexistent or
          // deactivated account takes the same time as a wrong-password
          // attempt on a real account (prevents email-enumeration via timing).
          await verifyDummyPassword(parsed.data.password);
          recordLoginFailure(emailKey);
          if (ipKey) {
            recordLoginFailure(ipKey);
          }
          return null;
        }

        const valid = await verifyPassword(admin.passwordHash, parsed.data.password);
        if (!valid) {
          recordLoginFailure(emailKey);
          if (ipKey) {
            recordLoginFailure(ipKey);
          }
          return null;
        }

        recordLoginSuccess(emailKey);
        if (ipKey) {
          recordLoginSuccess(ipKey);
        }

        return {
          id: admin.id,
          email: admin.email,
          role: 'ADMIN' as const,
        };
      },
    }),
  ],
});
