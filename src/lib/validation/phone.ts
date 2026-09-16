import { Metadata, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import { DEFAULT_PHONE_COUNTRY, PHONE_MAX_LENGTH } from '@/lib/validation/constants';

export type NormalizedPhone = {
  phone: string;
  phoneNormalized: string;
};

const NATIONAL_PHONE_DIGIT_LIMITS = new Map<CountryCode, number>();

/** Keep only ASCII digits so the local number field cannot accept letters or symbols. */
export function digitsOnlyPhone(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Maximum national significant-number length for a country (libphonenumber metadata).
 */
export function nationalPhoneDigitLimit(country: CountryCode): number {
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

/** Digits-only local number, truncated to the selected country's maximum length. */
export function nationalPhoneInput(value: string, country: CountryCode): string {
  return digitsOnlyPhone(value).slice(0, nationalPhoneDigitLimit(country));
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
