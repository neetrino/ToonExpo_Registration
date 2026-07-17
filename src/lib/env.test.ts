import { afterEach, describe, expect, it, vi } from 'vitest';
import { envSchema } from '@/lib/env';

describe('envSchema', () => {
  it('parses a valid environment object', () => {
    const parsed = envSchema.safeParse({
      SITE_URL: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://user:pass@host/db',
      DIRECT_URL: 'postgresql://user:pass@host/db',
      AUTH_SECRET: 'a'.repeat(32),
      RESEND_API_KEY: 're_test',
      RESEND_FROM_EMAIL: 'Toon Expo <registration@example.com>',
    });

    expect(parsed.success).toBe(true);
  });
});

describe('getEnv', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it('throws when required variables are missing', async () => {
    process.env = { NODE_ENV: 'test' };
    const { getEnv } = await import('@/lib/env');
    expect(() => getEnv()).toThrow(/Missing or invalid environment variables/);
  });
});
