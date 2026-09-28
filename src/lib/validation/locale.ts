export const REGISTRATION_LOCALES = ['hy', 'en', 'ru'] as const;

export type RegistrationLocale = (typeof REGISTRATION_LOCALES)[number];

const LOCALE_ALIASES: Record<string, RegistrationLocale> = {
  hy: 'hy',
  hye: 'hy',
  arm: 'hy',
  am: 'hy',
  armenian: 'hy',
  հայ: 'hy',
  հայերեն: 'hy',
  en: 'en',
  eng: 'en',
  english: 'en',
  անգլերեն: 'en',
  английский: 'en',
  англ: 'en',
  ru: 'ru',
  rus: 'ru',
  russian: 'ru',
  русский: 'ru',
  рус: 'ru',
  ռուսերեն: 'ru',
};

/**
 * Maps a partner locale token to `hy`, `en`, or `ru`.
 * Accepts case, surrounding space, underscores, and BCP 47 tags (`hy-AM`).
 * The bare token `am` is the Armenia country code. It is not treated as a
 * BCP 47 primary language, so `am-ET` stays rejected.
 */
export function normalizeRegistrationLocale(value: string): RegistrationLocale | undefined {
  const token = value.trim().toLowerCase().replace(/_/g, '-');
  if (!token) {
    return undefined;
  }

  const exact = LOCALE_ALIASES[token];
  if (exact) {
    return exact;
  }

  const primary = token.split('-')[0] ?? '';
  if (primary !== token && isRegistrationLocale(primary)) {
    return primary;
  }

  return undefined;
}

function isRegistrationLocale(value: string): value is RegistrationLocale {
  return value === 'hy' || value === 'en' || value === 'ru';
}

/**
 * Safe locale token for logs. Does not include other request fields.
 */
export function describeRejectedLocale(value: unknown): string {
  if (value === undefined) {
    return 'missing';
  }
  if (value === null) {
    return 'null';
  }
  if (typeof value !== 'string') {
    return typeof value;
  }

  const compact = value
    .trim()
    .slice(0, 40)
    .replace(/[^\p{L}\p{N}_.-]/gu, '');
  return compact.length > 0 ? compact : 'blank';
}
