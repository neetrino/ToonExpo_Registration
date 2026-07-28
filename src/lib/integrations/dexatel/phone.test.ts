import { describe, expect, it } from 'vitest';
import { toDexatelPhoneDigits } from '@/lib/integrations/dexatel/phone';

describe('toDexatelPhoneDigits', () => {
  it('strips plus and non-digits from E.164', () => {
    expect(toDexatelPhoneDigits('+37477668682')).toBe('37477668682');
  });

  it('accepts already-digit numbers', () => {
    expect(toDexatelPhoneDigits('37499123456')).toBe('37499123456');
  });

  it('rejects too-short values', () => {
    expect(toDexatelPhoneDigits('+374')).toBeNull();
  });
});
