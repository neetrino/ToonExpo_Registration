import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import { DEFAULT_PHONE_COUNTRY, PHONE_MAX_LENGTH } from '@/lib/validation/constants';

export type NormalizedPhone = {
  phone: string;
  phoneNormalized: string;
};

/** Keep only ASCII digits so the local number field cannot accept letters or symbols. */
export function digitsOnlyPhone(value: string): string {
  return value.replace(/\D/g, '');
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
