import { hasLocale } from 'next-intl';
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './routing';

/** next-intl default cookie; kept named so first-visit vs remembered locale stay explicit. */
const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

const intlMiddlewareByLocale = {
  hy: createMiddleware({ ...routing, defaultLocale: 'hy' }),
  en: createMiddleware({ ...routing, defaultLocale: 'en' }),
  ru: createMiddleware({ ...routing, defaultLocale: 'ru' }),
} as const;

/**
 * First visit (no cookie) uses Armenian. Later visits honor the saved locale.
 * Browser Accept-Language is ignored because `localeDetection` is off.
 */
export function handleIntlRouting(request: NextRequest) {
  const saved = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  const locale = hasLocale(routing.locales, saved) ? saved : routing.defaultLocale;
  return intlMiddlewareByLocale[locale](request);
}
