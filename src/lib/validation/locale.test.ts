import { describe, expect, it } from 'vitest';
import { describeRejectedLocale, normalizeRegistrationLocale } from '@/lib/validation/locale';

describe('normalizeRegistrationLocale', () => {
  it.each([
    ['hy', 'hy'],
    ['EN', 'en'],
    [' ru ', 'ru'],
    ['hy-AM', 'hy'],
    ['en_US', 'en'],
    ['ru-RU', 'ru'],
    ['am', 'hy'],
    ['ARM', 'hy'],
    ['hye', 'hy'],
    ['armenian', 'hy'],
    ['հայերեն', 'hy'],
    ['eng', 'en'],
    ['english', 'en'],
    ['անգլերեն', 'en'],
    ['rus', 'ru'],
    ['русский', 'ru'],
    ['ռուսերեն', 'ru'],
  ])('maps %j to %s', (input, expected) => {
    expect(normalizeRegistrationLocale(input)).toBe(expected);
  });

  it.each(['', '   ', 'fr', 'de-DE', 'am-ET', 'hy en'])('rejects %j', (input) => {
    expect(normalizeRegistrationLocale(input)).toBeUndefined();
  });
});

describe('describeRejectedLocale', () => {
  it('classifies missing, blank, and non-string values without echoing junk', () => {
    expect(describeRejectedLocale(undefined)).toBe('missing');
    expect(describeRejectedLocale(null)).toBe('null');
    expect(describeRejectedLocale(1)).toBe('number');
    expect(describeRejectedLocale('   ')).toBe('blank');
    expect(describeRejectedLocale('hy-AM\ninjected')).toBe('hy-AMinjected');
  });
});
