import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  REGISTRATION_RATE_LIMIT_MAX,
  REGISTRATION_RATE_LIMIT_WINDOW_MS,
  checkRegistrationRateLimit,
  getClientIp,
  resetRegistrationRateLimitForTests,
} from '@/lib/security/registration-rate-limit';

describe('getClientIp', () => {
  it('uses the first x-forwarded-for address', () => {
    const request = new Request('http://localhost/api/registrations', {
      headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.1' },
    });
    expect(getClientIp(request)).toBe('203.0.113.10');
  });

  it('falls back to x-real-ip', () => {
    const request = new Request('http://localhost/api/registrations', {
      headers: { 'x-real-ip': '198.51.100.20' },
    });
    expect(getClientIp(request)).toBe('198.51.100.20');
  });

  it('falls back to unknown when headers are absent', () => {
    const request = new Request('http://localhost/api/registrations');
    expect(getClientIp(request)).toBe('unknown');
  });
});

describe('checkRegistrationRateLimit', () => {
  afterEach(() => {
    resetRegistrationRateLimitForTests();
    vi.useRealTimers();
  });

  it('allows up to the limit within the window', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-17T12:00:00.000Z'));

    for (let i = 0; i < REGISTRATION_RATE_LIMIT_MAX; i += 1) {
      expect(checkRegistrationRateLimit('1.2.3.4')).toEqual({ allowed: true });
    }
  });

  it('blocks the next request and reports Retry-After seconds', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-17T12:00:00.000Z'));

    for (let i = 0; i < REGISTRATION_RATE_LIMIT_MAX; i += 1) {
      checkRegistrationRateLimit('1.2.3.4');
    }

    const blocked = checkRegistrationRateLimit('1.2.3.4');
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.retryAfterSeconds).toBe(Math.ceil(REGISTRATION_RATE_LIMIT_WINDOW_MS / 1000));
    }
  });

  it('allows requests again after the window slides past the oldest hit', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-17T12:00:00.000Z'));

    for (let i = 0; i < REGISTRATION_RATE_LIMIT_MAX; i += 1) {
      checkRegistrationRateLimit('1.2.3.4');
      vi.advanceTimersByTime(1_000);
    }

    expect(checkRegistrationRateLimit('1.2.3.4').allowed).toBe(false);

    vi.advanceTimersByTime(REGISTRATION_RATE_LIMIT_WINDOW_MS);
    expect(checkRegistrationRateLimit('1.2.3.4')).toEqual({ allowed: true });
  });

  it('tracks keys independently', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-17T12:00:00.000Z'));

    for (let i = 0; i < REGISTRATION_RATE_LIMIT_MAX; i += 1) {
      checkRegistrationRateLimit('ip-a');
    }

    expect(checkRegistrationRateLimit('ip-a').allowed).toBe(false);
    expect(checkRegistrationRateLimit('ip-b')).toEqual({ allowed: true });
  });
});
