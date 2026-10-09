export const SITE_NAME = 'TOON EXPO';
export const SITE_TITLE = 'TOON EXPO Invest 2026 Vol. 2 Registration';
export const SITE_DESCRIPTION =
  'Register for TOON EXPO Invest 2026 Vol. 2 - international real estate and investment exhibition, November 13-15 at Meridian Exhibition Center.';
export const SITE_EVENT_LINE = 'November 13-15 · Meridian Exhibition Center';
export const BRAND_PRIMARY = '#00303D';
export const BRAND_ACCENT = '#2BA8B0';
export const BRAND_HIGHLIGHT = '#FFD700';

/** Public TOON EXPO Telegram channel. Used on the success screen and in the ticket email. */
export const TELEGRAM_CHANNEL_URL = 'https://t.me/toonexpo';

export function getMetadataBase(): URL {
  return new URL(process.env.SITE_URL ?? 'http://localhost:3000');
}

/** Public production host. Credit links must not follow SITE_URL, which is a local or preview host outside production. */
const PRODUCTION_SITE_HOST = 'reg.toonexpo.com';
const NEETRINO_ORIGIN = 'https://neetrino.com';

/** Footer credit link. `utm_source` is always the production host. */
export function neetrinoCreditHref(): string {
  const url = new URL(NEETRINO_ORIGIN);
  url.searchParams.set('utm_source', PRODUCTION_SITE_HOST);
  return url.toString();
}
