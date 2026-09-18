const isDevelopment = process.env.NODE_ENV === 'development';

const BASE_DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "img-src 'self' data: blob: https://*.google-analytics.com https://www.googletagmanager.com https://*.g.doubleclick.net https://*.google.com https://*.google.am https://mc.yandex.ru https://mc.yandex.com https://yandex.ru https://www.facebook.com",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com https://mc.yandex.ru https://mc.yandex.com https://connect.facebook.net${isDevelopment ? " 'unsafe-eval'" : ''}`,
  "connect-src 'self' https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com https://*.g.doubleclick.net https://*.google.com https://*.google.am https://pagead2.googlesyndication.com https://va.vercel-scripts.com https://vitals.vercel-insights.com https://mc.yandex.ru https://mc.yandex.com wss://mc.yandex.ru wss://mc.yandex.com https://www.facebook.com https://connect.facebook.net",
  'frame-src https://www.googletagmanager.com blob: https://mc.yandex.ru https://mc.yandex.com',
  "worker-src 'self' blob:",
] as const;

function buildContentSecurityPolicy(frameAncestors: string): string {
  return [
    ...BASE_DIRECTIVES.slice(0, 3),
    `frame-ancestors ${frameAncestors}`,
    ...BASE_DIRECTIVES.slice(3),
    ...(isDevelopment ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

/** Default clickjacking policy for private and non-Meta routes. */
export const DEFAULT_CONTENT_SECURITY_POLICY = buildContentSecurityPolicy("'none'");

/**
 * Allows Meta's Event Setup Tool to frame only the public general questionnaire.
 * The route scope is enforced in `proxy.ts`.
 */
export const META_EVENT_SETUP_CONTENT_SECURITY_POLICY = buildContentSecurityPolicy(
  "'self' https://facebook.com https://*.facebook.com",
);
