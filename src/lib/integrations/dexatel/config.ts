export type DexatelSmsConfig =
  { ok: true; apiKey: string; from: string } | { ok: false; code: 'NOT_CONFIGURED' };

/**
 * Transactional alphanumeric sender. The trailing dot selects this sender.
 * `TOONEXPO` without the dot is the marketing sender and must not be used:
 * Viva drops that traffic in the evening and on non-working days.
 */
export const TRANSACTIONAL_SMS_SENDER = 'TOONEXPO.';

/**
 * Read Dexatel SMS credentials at call time.
 * Unset, placeholder, or marketing-sender values skip SMS; email delivery still runs.
 */
export function getDexatelSmsConfig(): DexatelSmsConfig {
  const apiKey = process.env.DEXATEL_API_KEY?.trim();
  const from = process.env.DEXATEL_SMS_FROM?.trim();

  if (!apiKey || !from || isPlaceholderDexatelValue(apiKey) || from !== TRANSACTIONAL_SMS_SENDER) {
    return { ok: false, code: 'NOT_CONFIGURED' };
  }

  return { ok: true, apiKey, from };
}

function isPlaceholderDexatelValue(value: string): boolean {
  return value.includes('replace') || value.length < 4;
}
