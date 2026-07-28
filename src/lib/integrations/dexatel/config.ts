export type DexatelSmsConfig =
  { ok: true; apiKey: string; from: string } | { ok: false; code: 'NOT_CONFIGURED' };

/**
 * Read Dexatel SMS credentials at call time.
 * Unset/placeholder values skip SMS job creation; email delivery still runs.
 */
export function getDexatelSmsConfig(): DexatelSmsConfig {
  const apiKey = process.env.DEXATEL_API_KEY?.trim();
  const from = process.env.DEXATEL_SMS_FROM?.trim();

  if (!apiKey || !from || isPlaceholderDexatelValue(apiKey) || isPlaceholderDexatelValue(from)) {
    return { ok: false, code: 'NOT_CONFIGURED' };
  }

  return { ok: true, apiKey, from };
}

function isPlaceholderDexatelValue(value: string): boolean {
  return value.includes('replace') || value.length < 4;
}
