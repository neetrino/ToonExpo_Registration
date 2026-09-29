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
