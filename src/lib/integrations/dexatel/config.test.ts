import { afterEach, describe, expect, it } from 'vitest';
import { getDexatelSmsConfig, TRANSACTIONAL_SMS_SENDER } from '@/lib/integrations/dexatel/config';

const originalKey = process.env.DEXATEL_API_KEY;
const originalFrom = process.env.DEXATEL_SMS_FROM;

describe('getDexatelSmsConfig', () => {
  afterEach(() => {
    restoreEnv('DEXATEL_API_KEY', originalKey);
    restoreEnv('DEXATEL_SMS_FROM', originalFrom);
  });

  it('accepts the transactional sender', () => {
    process.env.DEXATEL_API_KEY = 'test-key-value';
    process.env.DEXATEL_SMS_FROM = TRANSACTIONAL_SMS_SENDER;

    expect(getDexatelSmsConfig()).toEqual({
      ok: true,
      apiKey: 'test-key-value',
      from: 'TOONEXPO.',
    });
  });

  it('rejects the marketing sender', () => {
    process.env.DEXATEL_API_KEY = 'test-key-value';
    process.env.DEXATEL_SMS_FROM = 'TOONEXPO';

    expect(getDexatelSmsConfig()).toEqual({ ok: false, code: 'NOT_CONFIGURED' });
  });
});

function restoreEnv(name: 'DEXATEL_API_KEY' | 'DEXATEL_SMS_FROM', value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}
