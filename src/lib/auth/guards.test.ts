import { describe, expect, it, beforeEach } from 'vitest';
import {
  isLoginAllowed,
  recordLoginFailure,
  recordLoginSuccess,
  resetLoginThrottleForTests,
} from '@/lib/auth/login-throttle';
import { isProtectedAdminPath } from '@/lib/auth/paths';

describe('isProtectedAdminPath', () => {
  it('protects dashboard and nested admin routes', () => {
    expect(isProtectedAdminPath('/admin')).toBe(true);
    expect(isProtectedAdminPath('/admin/')).toBe(true);
    expect(isProtectedAdminPath('/admin/settings')).toBe(true);
  });

  it('allows login and non-admin paths', () => {
    expect(isProtectedAdminPath('/admin/login')).toBe(false);
    expect(isProtectedAdminPath('/admin/login/')).toBe(false);
    expect(isProtectedAdminPath('/en')).toBe(false);
    expect(isProtectedAdminPath('/api/registrations')).toBe(false);
  });
});

describe('login throttle', () => {
  beforeEach(() => {
    resetLoginThrottleForTests();
  });

  it('locks after five failures and clears on success', () => {
    const key = 'email:admin@example.com';

    for (let i = 0; i < 5; i += 1) {
      expect(isLoginAllowed(key).allowed).toBe(true);
      recordLoginFailure(key);
    }

    const locked = isLoginAllowed(key);
    expect(locked.allowed).toBe(false);
    if (!locked.allowed) {
      expect(locked.retryAfterMs).toBeGreaterThan(0);
    }

    recordLoginSuccess(key);
    expect(isLoginAllowed(key).allowed).toBe(true);
  });
});
