import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { DEFAULT_CONTENT_SECURITY_POLICY } from './src/lib/security/content-security-policy';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isDev = process.env.NODE_ENV === 'development';

const DENY_FRAMING_HEADER = { key: 'X-Frame-Options', value: 'DENY' } as const;

const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  { key: 'Content-Security-Policy', value: DEFAULT_CONTENT_SECURITY_POLICY },
  ...(isDev
    ? []
    : [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]),
] as const;

const NO_STORE_HEADERS = [
  {
    key: 'Cache-Control',
    value: 'private, no-store, max-age=0, must-revalidate',
  },
] as const;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [...SECURITY_HEADERS],
      },
      {
        source: '/api/:path*',
        headers: [...NO_STORE_HEADERS, DENY_FRAMING_HEADER],
      },
      {
        source: '/admin/:path*',
        headers: [...NO_STORE_HEADERS, DENY_FRAMING_HEADER],
      },
      {
        source: '/ticket/:path*',
        headers: [DENY_FRAMING_HEADER],
      },
      {
        source: '/rf/:path*',
        headers: [DENY_FRAMING_HEADER],
      },
      {
        source: '/:locale(hy|en|ru)/rf/:path*',
        headers: [DENY_FRAMING_HEADER],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
