import { describe, expect, it } from 'vitest';
import { createRequestId, getOrCreateRequestId, requestIdHeaders } from '@/lib/security/request-id';

describe('request-id helpers', () => {
  it('creates opaque ids', () => {
    expect(createRequestId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('reuses a safe inbound x-request-id', () => {
    const request = new Request('http://localhost/api/registrations', {
      headers: { 'x-request-id': 'req-abc.123:z' },
    });
    expect(getOrCreateRequestId(request)).toBe('req-abc.123:z');
  });

  it('rejects unsafe inbound ids', () => {
    const request = new Request('http://localhost/api/registrations', {
      headers: { 'x-request-id': 'bad id with spaces' },
    });
    const generated = getOrCreateRequestId(request);
    expect(generated).not.toBe('bad id with spaces');
    expect(generated).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('exposes the response header pair', () => {
    expect(requestIdHeaders('abc')).toEqual({ 'x-request-id': 'abc' });
  });
});
