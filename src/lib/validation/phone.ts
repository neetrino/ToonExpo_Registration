import {
  getCountryCallingCode,
  Metadata,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js';
import { DEFAULT_PHONE_COUNTRY, PHONE_MAX_LENGTH } from '@/lib/validation/constants';

export type NormalizedPhone = {
  phone: string;
  phoneNormalized: string;
};

const NATIONAL_PHONE_DIGIT_LIMITS = new Map<CountryCode, number>();

/**
 * Digits typed after the country code.
 * Russian metadata also lists 14; a visitor mobile is 10 (`+7` + `9993005512`).
 */
const VISITOR_NATIONAL_LENGTH: Partial<Record<CountryCode, number>> = {
  RU: 10,
};

/** Keep only ASCII digits so the local number field cannot accept letters or symbols. */
export function digitsOnlyPhone(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * National digit count the visitor types for this country.
 */
export function nationalPhoneDigitLimit(country: CountryCode): number {
  const visitorLength = VISITOR_NATIONAL_LENGTH[country];
  if (visitorLength !== undefined) {
    return visitorLength;
  }

  const cached = NATIONAL_PHONE_DIGIT_LIMITS.get(country);
  if (cached !== undefined) {
    return cached;
  }

  const metadata = new Metadata();
  metadata.selectNumberingPlan(country);
  const lengths = metadata.numberingPlan?.possibleLengths() ?? [];
  const limit = lengths.length > 0 ? Math.max(...lengths) : PHONE_MAX_LENGTH;
  NATIONAL_PHONE_DIGIT_LIMITS.set(country, limit);
  return limit;
}

/** Russian mobiles display as `(965) 300-55-12`. The stored value stays 10 digits. */
export function formatNationalPhoneInput(digits: string, country: CountryCode): string {
  if (country !== 'RU' || digits.length === 0) {
    return digits;
  }

  const area = digits.slice(0, 3);
  if (digits.length < 3) {
    return `(${area}`;
  }

  const subscriber = digits.slice(3);
  if (subscriber.length === 0) {
    return `(${area})`;
  }

  const groups = [subscriber.slice(0, 3), subscriber.slice(3, 5), subscriber.slice(5, 7)].filter(
    (group) => group.length > 0,
  );
  return `(${area}) ${groups.join('-')}`;
}

/** Example shown beside an invalid-phone error. Russian numbers use the field format. */
export function nationalPhoneExample(country: CountryCode): string {
  const callingCode = getCountryCallingCode(country);
  if (country === 'RU') {
    return `+${callingCode} (965) 300-55-12`;
  }

  return `+${callingCode} ${nationalPhonePlaceholder(country)}`;
}

/** Placeholder that shows where the Russian area code sits in parentheses. */
export function nationalPhonePlaceholder(country: CountryCode): string {
  if (country === 'RU') {
    return '(XXX) XXX-XX-XX';
  }

  return 'X'.repeat(nationalPhoneDigitLimit(country));
}

/**
 * Next stored digits after a keystroke.
 * Backspace on a parenthesis or dash still removes a digit.
 */
export function nextNationalPhoneDigits(
  rawValue: string,
  previousDigits: string,
  country: CountryCode,
): string {
  const nextDigits = nationalPhoneInput(rawValue, country);
  const formatted = formatNationalPhoneInput(previousDigits, country);
  const deletedFormatting = nextDigits === previousDigits && rawValue.length < formatted.length;
  if (deletedFormatting) {
    return previousDigits.slice(0, -1);
  }

  return nextDigits;
}

/** Digits-only local number, without a pasted country code, capped at the national length. */
export function nationalPhoneInput(value: string, country: CountryCode): string {
  const limit = nationalPhoneDigitLimit(country);
  const digits = stripCountryPrefix(digitsOnlyPhone(value), country, limit);
  return digits.slice(0, limit);
}

function stripCountryPrefix(digits: string, country: CountryCode, limit: number): string {
  const callingCode = String(getCountryCallingCode(country));
  if (digits.startsWith(callingCode) && digits.length === callingCode.length + limit) {
    return digits.slice(callingCode.length);
  }

  if (country === 'RU' && digits.startsWith('8') && digits.length === limit + 1) {
    return digits.slice(1);
  }

  return digits;
}

/**
 * Parse a phone number to E.164.
 * Uses `defaultCountry` when the input has no international prefix (e.g. local Armenian digits).
 */
export function normalizePhone(
  value: string,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY,
): NormalizedPhone | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > PHONE_MAX_LENGTH * 2) {
    return null;
  }

  const parsed = parsePhoneNumberFromString(trimmed, defaultCountry);
  if (!parsed || !parsed.isValid()) {
    return null;
  }

  const phoneNormalized = parsed.format('E.164');
  if (phoneNormalized.length > PHONE_MAX_LENGTH) {
    return null;
  }

  return {
    phone: parsed.formatInternational(),
    phoneNormalized,
  };
}
