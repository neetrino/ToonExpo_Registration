/**
 * Convert E.164 (`+374…`) to Dexatel digits-only MSISDN (`374…`).
 */
export function toDexatelPhoneDigits(phoneE164: string): string | null {
  const digits = phoneE164.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) {
    return null;
  }
  return digits;
}
