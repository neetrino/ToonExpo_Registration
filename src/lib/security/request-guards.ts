import { getEnv } from '@/lib/env';

/**
 * Returns true when Origin or Referer matches the configured SITE_URL origin.
 *
 * Production requires Origin or Referer (browser CSRF defense). Development and
 * test allow missing headers so local tooling and Vitest can call the API.
 */
export function isAllowedOrigin(request: Request): boolean {
  const { SITE_URL } = getEnv();
  let allowedOrigin: string;

  try {
    allowedOrigin = new URL(SITE_URL).origin;
  } catch {
    return false;
  }

  const origin = request.headers.get('origin');
  if (origin) {
    return origin === allowedOrigin;
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).origin === allowedOrigin;
    } catch {
      return false;
    }
  }

  return process.env.NODE_ENV !== 'production';
}

/**
 * Honeypot is filled when the optional `website` field is non-empty after trim.
 */
export function isHoneypotFilled(website: string | undefined): boolean {
  return Boolean(website && website.trim().length > 0);
}
