import { afterEach, describe, expect, it, vi } from 'vitest';
import { envSchema } from '@/lib/env';

const baseEnv = {
  SITE_URL: 'http://localhost:3000',
  DATABASE_URL: 'postgresql://user:pass@host/db',
  AUTH_SECRET: 'a'.repeat(32),
  RESEND_API_KEY: 're_test',
};

describe('envSchema', () => {
  it('parses a valid environment object without DIRECT_URL', () => {
    const parsed = envSchema.safeParse({
      ...baseEnv,
      RESEND_FROM_EMAIL: 'Toon Expo <registration@example.com>',
    });

    expect(parsed.success).toBe(true);
  });

  it('accepts a plain RESEND_FROM_EMAIL', () => {
    const parsed = envSchema.safeParse({
      ...baseEnv,
      RESEND_FROM_EMAIL: 'a@b.com',
    });

    expect(parsed.success).toBe(true);
  });

  it('accepts a display-name RESEND_FROM_EMAIL', () => {
    const parsed = envSchema.safeParse({
      ...baseEnv,
      RESEND_FROM_EMAIL: 'Name <a@b.com>',
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects an invalid RESEND_FROM_EMAIL', () => {
    const parsed = envSchema.safeParse({
      ...baseEnv,
      RESEND_FROM_EMAIL: 'not-an-email',
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toMatch(/RESEND_FROM_EMAIL/);
    }
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
