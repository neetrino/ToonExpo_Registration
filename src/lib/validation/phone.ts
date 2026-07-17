import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import { DEFAULT_PHONE_COUNTRY, PHONE_MAX_LENGTH } from '@/lib/validation/constants';

export type NormalizedPhone = {
  phone: string;
  phoneNormalized: string;
};

/**
 * Parse a phone number to E.164. Defaults to Armenia (+374) when no country code is present.
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
