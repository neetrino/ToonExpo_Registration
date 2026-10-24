import { describe, expect, it } from 'vitest';
import {
  canonicalizeUtmValue,
  captureUtmFromSearchParams,
  compactUtmAttribution,
  mergeUtmAttribution,
  normalizeUtmValue,
} from '@/lib/attribution/utm';

describe('normalizeUtmValue', () => {
  it('trims and accepts simple labels', () => {
    expect(normalizeUtmValue('  facebook  ')).toBe('facebook');
    expect(normalizeUtmValue('tey-26_v1.2')).toBe('tey-26_v1.2');
  });

  it('accepts spaces, plus signs and Unicode campaign names', () => {
    expect(normalizeUtmValue('SP Flexible')).toBe('SP Flexible');
    expect(normalizeUtmValue('C++ promo')).toBe('C++ promo');
    expect(normalizeUtmValue('Թունէքսպո 2026')).toBe('Թունէքսպո 2026');
    expect(normalizeUtmValue('Весна | ВК')).toBe('Весна | ВК');
  });

  it('collapses Unicode space runs to one space', () => {
    expect(normalizeUtmValue('SP \u00a0  Flexible')).toBe('SP Flexible');
  });

  it('treats empty as absent', () => {
    expect(normalizeUtmValue('')).toBeUndefined();
    expect(normalizeUtmValue('   ')).toBeUndefined();
    expect(normalizeUtmValue(null)).toBeUndefined();
  });

  it('rejects control chars, angle brackets, and overlong values', () => {
    expect(normalizeUtmValue('a'.repeat(129))).toBeUndefined();
    expect(normalizeUtmValue('bad\nvalue')).toBeUndefined();
    expect(normalizeUtmValue('bad\u0000value')).toBeUndefined();
    expect(normalizeUtmValue('bad\u200bvalue')).toBeUndefined();
    expect(normalizeUtmValue('<script>')).toBeUndefined();
  });
});

describe('canonicalizeUtmValue', () => {
  it('applies NFC so composed and decomposed forms match', () => {
    expect(canonicalizeUtmValue('Cafe\u0301')).toBe('Caf\u00e9');
  });
});

describe('captureUtmFromSearchParams', () => {
  it('reads case-insensitive param names', () => {
    const params = new URLSearchParams('UTM_SOURCE=facebook&utm_Medium=video&Utm_Campaign=tey26');
    expect(captureUtmFromSearchParams(params)).toEqual({
      utmSource: 'facebook',
      utmMedium: 'video',
      utmCampaign: 'tey26',
    });
  });

  it('decodes + and percent-encoded Unicode in values', () => {
    const params = new URLSearchParams(
      'utm_source=fb&utm_campaign=SP+Flexible&utm_medium=%D5%BE%D5%AB%D5%A4%D5%A5%D5%B8',
    );
    expect(captureUtmFromSearchParams(params)).toEqual({
      utmSource: 'fb',
      utmMedium: 'վիդեո',
      utmCampaign: 'SP Flexible',
    });
  });

  it('omits invalid or empty fields', () => {
    const params = new URLSearchParams('utm_source=&utm_medium=bad%0Avalue&utm_campaign=ok');
    expect(captureUtmFromSearchParams(params)).toEqual({
      utmCampaign: 'ok',
    });
  });
});

describe('mergeUtmAttribution', () => {
  it('replaces the whole set when a new campaign arrives', () => {
    expect(
      mergeUtmAttribution(
        { utmSource: 'facebook', utmMedium: 'video', utmCampaign: 'old' },
        { utmSource: 'google' },
      ),
    ).toEqual({ utmSource: 'google' });
  });

  it('keeps the existing campaign on a visit without UTM', () => {
    expect(mergeUtmAttribution({ utmSource: 'facebook' }, {})).toEqual({ utmSource: 'facebook' });
  });
});

describe('compactUtmAttribution', () => {
  it('drops undefined keys', () => {
    expect(compactUtmAttribution({ utmSource: 'facebook', utmMedium: undefined })).toEqual({
      utmSource: 'facebook',
    });
  });
});
