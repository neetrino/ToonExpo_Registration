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

  it('allows Microsoft Clarity in script, connect and image directives', () => {
    const directives = DEFAULT_CONTENT_SECURITY_POLICY.split('; ');
    const scriptSrc = directives.find((entry) => entry.startsWith('script-src '));
    const connectSrc = directives.find((entry) => entry.startsWith('connect-src '));
    const imgSrc = directives.find((entry) => entry.startsWith('img-src '));

    expect(scriptSrc).toContain('https://*.clarity.ms');
    expect(connectSrc).toContain('https://*.clarity.ms');
    expect(connectSrc).toContain('https://c.bing.com');
    expect(imgSrc).toContain('https://*.clarity.ms');
    expect(imgSrc).toContain('https://c.bing.com');
  });

  it('allows only same-origin and Meta ancestors for the setup tool', () => {
    expect(META_EVENT_SETUP_CONTENT_SECURITY_POLICY).toContain(
      "frame-ancestors 'self' https://facebook.com https://*.facebook.com",
    );
  });
});
