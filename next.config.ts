import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Pragmatic CSP for Next.js App Router + Auth.js (server-side Resend only).
 * `unsafe-inline` is required for Next.js inline bootstrap scripts and CSS-in-JS /
 * Tailwind runtime style attributes. Revisit with nonces when hardening further.
 * `unsafe-eval` is allowed only in development — React DevTools / RSC reconstruction
 * need it; production never includes it.
 */
const isDev = process.env.NODE_ENV === 'development';

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "connect-src 'self'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
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
        headers: [...NO_STORE_HEADERS],
      },
      {
        source: '/admin/:path*',
        headers: [...NO_STORE_HEADERS],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
