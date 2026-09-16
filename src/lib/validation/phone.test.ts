import { describe, expect, it } from 'vitest';
import { digitsOnlyPhone } from '@/lib/validation/phone';

describe('digitsOnlyPhone', () => {
  it('strips letters, spaces, and punctuation', () => {
    expect(digitsOnlyPhone('99 12-34 56a')).toBe('99123456');
    expect(digitsOnlyPhone('+374 (99) 12 34 56')).toBe('37499123456');
  });

  it('keeps an already numeric value unchanged', () => {
    expect(digitsOnlyPhone('99123456')).toBe('99123456');
  });
});
