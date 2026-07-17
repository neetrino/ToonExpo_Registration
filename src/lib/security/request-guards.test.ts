import { describe, expect, it, vi, afterEach } from 'vitest';
import { isHoneypotFilled } from '@/lib/security/request-guards';

describe('isHoneypotFilled', () => {
  it('treats empty and whitespace as empty', () => {
    expect(isHoneypotFilled('')).toBe(false);
    expect(isHoneypotFilled('   ')).toBe(false);
    expect(isHoneypotFilled(undefined)).toBe(false);
  });

  it('detects filled honeypot', () => {
    expect(isHoneypotFilled('https://spam.example')).toBe(true);
  });
});

describe('isAllowedOrigin', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it('allows matching Origin', async () => {
    process.env = {
      ...originalEnv,
      SITE_URL: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://u:p@h/db',
      DIRECT_URL: 'postgresql://u:p@h/db',
      AUTH_SECRET: 'a'.repeat(32),
      RESEND_API_KEY: 're_test',
      EMAIL_FROM: 'Toon Expo <registration@example.com>',
    };
    const { isAllowedOrigin: check } = await import('@/lib/security/request-guards');
    const request = new Request('http://localhost:3000/api/registrations', {
      headers: { origin: 'http://localhost:3000' },
    });
    expect(check(request)).toBe(true);
  });

  it('rejects foreign Origin', async () => {
    process.env = {
      ...originalEnv,
      SITE_URL: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://u:p@h/db',
      DIRECT_URL: 'postgresql://u:p@h/db',
      AUTH_SECRET: 'a'.repeat(32),
      RESEND_API_KEY: 're_test',
      EMAIL_FROM: 'Toon Expo <registration@example.com>',
    };
    const { isAllowedOrigin: check } = await import('@/lib/security/request-guards');
    const request = new Request('http://localhost:3000/api/registrations', {
      headers: { origin: 'https://evil.example' },
    });
    expect(check(request)).toBe(false);
  });
});
