import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from 'libphonenumber-js';
import { DEFAULT_PHONE_COUNTRY } from '@/lib/validation/constants';

/** Expo-relevant markets first; remaining countries follow alphabetically by localized name. */
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

const PHONE_COUNTRY_SET: ReadonlySet<string> = new Set(getCountries());

export type PhoneCountryOption = {
  code: CountryCode;
  callingCode: string;
  name: string;
  flag: string;
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

/**
 * Localized phone-country options for the registration country selector.
 * Priority markets appear first; the rest are sorted by localized country name.
 */
export function listPhoneCountries(locale: string): PhoneCountryOption[] {
  const displayNames = new Intl.DisplayNames([locale], { type: 'region' });
  const priorityRank = new Map(
    PRIORITY_PHONE_COUNTRIES.map((code, index) => [code, index] as const),
  );

  const options: PhoneCountryOption[] = getCountries().map((code) => {
    const name = displayNames.of(code) ?? code;
    return {
      code,
      callingCode: getCountryCallingCode(code),
      name,
      flag: countryFlagEmoji(code),
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
