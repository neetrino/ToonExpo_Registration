import { describe, expect, it } from 'vitest';
import {
  digitsOnlyPhone,
  formatNationalPhoneInput,
  nationalPhoneDigitLimit,
  nationalPhoneExample,
  nationalPhoneInput,
  nextNationalPhoneDigits,
  normalizePhone,
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
    expect(nationalPhoneDigitLimit('RU')).toBe(10);
  });
});

describe('nationalPhoneInput', () => {
  it('keeps only digits up to the country maximum', () => {
    expect(nationalPhoneInput('99ab-123456789', 'AM')).toBe('99123456');
    expect(nationalPhoneInput('599123456789', 'GE')).toBe('599123456');
  });

  it('stores a pasted Russian mobile as 10 national digits', () => {
    expect(nationalPhoneInput('+79993005512', 'RU')).toBe('9993005512');
    expect(nationalPhoneInput('89993005512', 'RU')).toBe('9993005512');
    expect(nationalPhoneInput('9993005512', 'RU')).toBe('9993005512');
    expect(normalizePhone('9993005512', 'RU')?.phoneNormalized).toBe('+79993005512');
    expect(nationalPhoneInput('(965) 300-55-12', 'RU')).toBe('9653005512');
  });
});

describe('nationalPhoneExample', () => {
  it('shows the Russian field format and a calling-code pattern for other countries', () => {
    expect(nationalPhoneExample('RU')).toBe('+7 (965) 300-55-12');
    expect(nationalPhoneExample('AM')).toBe('+374 (XX) XX-XX-XX');
  });
});

describe('formatNationalPhoneInput', () => {
  it('wraps the leading code in parentheses and dashes the rest', () => {
    expect(formatNationalPhoneInput('9', 'RU')).toBe('(9');
    expect(formatNationalPhoneInput('965', 'RU')).toBe('(965)');
    expect(formatNationalPhoneInput('9653005512', 'RU')).toBe('(965) 300-55-12');
    expect(formatNationalPhoneInput('91', 'AM')).toBe('(91)');
    expect(formatNationalPhoneInput('99123456', 'AM')).toBe('(99) 12-34-56');
    expect(formatNationalPhoneInput('555123456', 'GE')).toBe('(555) 12-34-56');
    expect(formatNationalPhoneInput('2015550123', 'US')).toBe('(201) 555-0123');
  });

  it('removes a digit when backspace lands on a formatting character', () => {
    expect(nextNationalPhoneDigits('(965', '965', 'RU')).toBe('96');
  });
});
