import type { CountryCode } from 'libphonenumber-js';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import { PHONE_MAX_LENGTH } from '@/lib/validation/constants';
import { formatNationalPhoneInput, nationalPhoneInput } from '@/lib/validation/phone';

/**
 * National digits to store when a phone input was painted outside React.
 * In-app browsers autofill `95117710` or `095117710` without `onChange`, so the
 * controlled field never becomes `(95) 11-77-10`.
 * Returns null when the painted value already matches the formatted number, or has no digits.
 */
export function adoptAutofilledPhoneDigits(
  domValue: string,
  country: CountryCode,
  currentDigits: string,
): string | null {
  if (domValue === formatNationalPhoneInput(currentDigits, country)) {
    return null;
  }

  const digits = digitsFromExternalPhone(domValue, country);
  if (digits.length === 0 || digits === currentDigits) {
    return null;
  }

  return digits;
}

function digitsFromExternalPhone(value: string, country: CountryCode): string {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > PHONE_MAX_LENGTH * 2) {
    return '';
  }

  const parsed = parsePhoneNumberFromString(trimmed, country);
  if (parsed?.isValid() && parsed.country === country) {
    return nationalPhoneInput(parsed.nationalNumber, country);
  }

  return nationalPhoneInput(value, country);
}
