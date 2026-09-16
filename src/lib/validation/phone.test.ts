import { describe, expect, it } from 'vitest';
import {
  digitsOnlyPhone,
  nationalPhoneDigitLimit,
  nationalPhoneInput,
} from '@/lib/validation/phone';

describe('digitsOnlyPhone', () => {
  it('strips letters, spaces, and punctuation', () => {
    expect(digitsOnlyPhone('99 12-34 56a')).toBe('99123456');
    expect(digitsOnlyPhone('+374 (99) 12 34 56')).toBe('37499123456');
  });

  it('keeps an already numeric value unchanged', () => {
    expect(digitsOnlyPhone('99123456')).toBe('99123456');
  });
});

describe('nationalPhoneDigitLimit', () => {
  it('returns the maximum national length for common expo countries', () => {
    expect(nationalPhoneDigitLimit('AM')).toBe(8);
    expect(nationalPhoneDigitLimit('GE')).toBe(9);
    expect(nationalPhoneDigitLimit('US')).toBe(10);
    expect(nationalPhoneDigitLimit('RU')).toBe(14);
  });
});

describe('nationalPhoneInput', () => {
  it('keeps only digits up to the country maximum', () => {
    expect(nationalPhoneInput('99ab-123456789', 'AM')).toBe('99123456');
    expect(nationalPhoneInput('599123456789', 'GE')).toBe('599123456');
  });
});
