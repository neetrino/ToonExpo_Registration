import { afterEach, describe, expect, it } from 'vitest';
import { authenticateMootqRequest } from '@/lib/integrations/mootq/auth';

describe('authenticateMootqRequest', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns NOT_CONFIGURED when write key is missing', () => {
    delete process.env.MOOTQ_WRITE_KEY;
    const request = new Request('http://localhost/api', {
      headers: { Authorization: 'Bearer abc' },
    });
    expect(authenticateMootqRequest(request, 'write')).toEqual({
      ok: false,
      status: 503,
      code: 'NOT_CONFIGURED',
    });
  });

  it('accepts a matching write bearer token', () => {
    process.env.MOOTQ_WRITE_KEY = 'w'.repeat(32);
    const request = new Request('http://localhost/api', {
      headers: { Authorization: `Bearer ${'w'.repeat(32)}` },
    });
    expect(authenticateMootqRequest(request, 'write')).toEqual({ ok: true });
  });

  it('rejects a mismatched read bearer token', () => {
    process.env.MOOTQ_READ_KEY = 'r'.repeat(32);
    const request = new Request('http://localhost/api', {
      headers: { Authorization: `Bearer ${'x'.repeat(32)}` },
    });
    expect(authenticateMootqRequest(request, 'read')).toEqual({
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
    });
  });
});
