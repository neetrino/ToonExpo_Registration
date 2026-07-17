import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from 'libphonenumber-js';
import { DEFAULT_PHONE_COUNTRY } from '@/lib/validation/constants';

/** Expo-relevant markets first; remaining countries follow alphabetically by display name. */
const PRIORITY_PHONE_COUNTRIES: readonly CountryCode[] = [
  'AM',
  'RU',
  'US',
  'GE',
  'IR',
  'AE',
  'FR',
  'DE',
  'GB',
  'CA',
  'UA',
  'BY',
  'KZ',
  'TR',
  'IL',
  'NL',
  'BE',
  'IT',
  'ES',
  'PL',
];

const SEARCH_NAME_LOCALES = ['en', 'ru', 'hy'] as const;

const PHONE_COUNTRY_SET: ReadonlySet<string> = new Set(getCountries());

export type PhoneCountryOption = {
  code: CountryCode;
  callingCode: string;
  name: string;
  flag: string;
  /** Lowercased blob for matching name, ISO code, and calling code. */
  searchText: string;
};

/** Returns true when `value` is a supported ISO 3166-1 alpha-2 calling-code country. */
export function isPhoneCountry(value: string): value is CountryCode {
  return PHONE_COUNTRY_SET.has(value);
}

/** Normalizes an unknown draft/API value to a valid phone country, defaulting to Armenia. */
export function resolvePhoneCountry(value: unknown): CountryCode {
  if (typeof value !== 'string') {
    return DEFAULT_PHONE_COUNTRY;
  }

  const normalized = value.trim().toUpperCase();
  return isPhoneCountry(normalized) ? normalized : DEFAULT_PHONE_COUNTRY;
}

function countryFlagEmoji(code: CountryCode): string {
  return [...code].map((char) => String.fromCodePoint(127397 + char.charCodeAt(0))).join('');
}

function buildSearchText(
  code: CountryCode,
  callingCode: string,
  displayName: string,
  nameLocalizers: ReadonlyArray<Intl.DisplayNames>,
): string {
  const parts = new Set<string>([
    code.toLowerCase(),
    callingCode,
    `+${callingCode}`,
    displayName.toLowerCase(),
  ]);

  for (const localizer of nameLocalizers) {
    const localized = localizer.of(code);
    if (localized) {
      parts.add(localized.toLowerCase());
    }
  }

  return [...parts].join(' ');
}

/**
 * Phone-country options for the registration country selector.
 * Pass `locale` for localized display names. Search matches en/ru/hy names plus codes.
 * Priority markets appear first; the rest are sorted by display name.
 */
export function listPhoneCountries(locale = 'en'): PhoneCountryOption[] {
  const displayNames = new Intl.DisplayNames([locale], { type: 'region' });
  const searchLocalizers = SEARCH_NAME_LOCALES.map(
    (searchLocale) => new Intl.DisplayNames([searchLocale], { type: 'region' }),
  );
  const priorityRank = new Map(
    PRIORITY_PHONE_COUNTRIES.map((code, index) => [code, index] as const),
  );

  const options: PhoneCountryOption[] = getCountries().map((code) => {
    const callingCode = getCountryCallingCode(code);
    const name = displayNames.of(code) ?? code;
    return {
      code,
      callingCode,
      name,
      flag: countryFlagEmoji(code),
      searchText: buildSearchText(code, callingCode, name, searchLocalizers),
    };
  });

  options.sort((left, right) => {
    const leftRank = priorityRank.get(left.code);
    const rightRank = priorityRank.get(right.code);

    if (leftRank !== undefined || rightRank !== undefined) {
      if (leftRank === undefined) {
        return 1;
      }
      if (rightRank === undefined) {
        return -1;
      }
      return leftRank - rightRank;
    }

    return left.name.localeCompare(right.name, locale);
  });

  return options;
}

/** Filters countries by localized name, ISO code, or calling code (with or without +). */
export function filterPhoneCountries(
  options: readonly PhoneCountryOption[],
  query: string,
): PhoneCountryOption[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [...options];
  }

  const withoutPlus = normalized.startsWith('+') ? normalized.slice(1) : normalized;

  return options.filter((option) => {
    return (
      option.searchText.includes(normalized) ||
      option.searchText.includes(withoutPlus) ||
      option.code.toLowerCase().includes(normalized) ||
      option.callingCode.includes(withoutPlus)
    );
  });
}
