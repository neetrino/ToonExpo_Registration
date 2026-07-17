import { z } from 'zod';

const plainEmailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const namedEmailPattern = /^.+ <[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>$/;

const envSchema = z.object({
  SITE_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(32),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z
    .string()
    .min(1)
    .refine((value) => plainEmailPattern.test(value) || namedEmailPattern.test(value), {
      message:
        'RESEND_FROM_EMAIL must be a plain email (user@domain.com) or "Display Name <user@domain.com>"',
    }),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | undefined;

/**
 * Validates required environment variables for server-only code paths.
 * Call at runtime when a feature needs secrets or database access.
 */
export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new Error(`Missing or invalid environment variables: ${missing}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export { envSchema };
