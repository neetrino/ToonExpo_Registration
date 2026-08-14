export const SITE_NAME = 'TOON EXPO';
export const SITE_TITLE = 'TOON EXPO. Invest 2026 Vol. 2 Registration';
export const SITE_DESCRIPTION =
  'Register for TOON EXPO. Invest 2026 Vol. 2 - international real estate and investment exhibition, November 13-15 at Meridian Exhibition Center.';
export const SITE_EVENT_LINE = 'November 13-15 · Meridian Exhibition Center';
export const BRAND_PRIMARY = '#00303D';
export const BRAND_ACCENT = '#2BA8B0';
export const BRAND_HIGHLIGHT = '#FFD700';

export function getMetadataBase(): URL {
  return new URL(process.env.SITE_URL ?? 'http://localhost:3000');
}
