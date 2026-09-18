import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CONTENT_SECURITY_POLICY,
  META_EVENT_SETUP_CONTENT_SECURITY_POLICY,
} from '@/lib/security/content-security-policy';

describe('content security policies', () => {
  it('denies framing by default', () => {
    expect(DEFAULT_CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'none'");
    expect(DEFAULT_CONTENT_SECURITY_POLICY).not.toContain('https://*.facebook.com');
  });

  it('allows only same-origin and Meta ancestors for the setup tool', () => {
    expect(META_EVENT_SETUP_CONTENT_SECURITY_POLICY).toContain(
      "frame-ancestors 'self' https://facebook.com https://*.facebook.com",
    );
  });
});
