import { describe, expect, it } from 'vitest';
import {
  captureUtmFromSearchParams,
  compactUtmAttribution,
  mergeUtmAttribution,
  normalizeUtmValue,
} from '@/lib/attribution/utm';

describe('normalizeUtmValue', () => {
  it('trims and accepts allowlisted labels', () => {
    expect(normalizeUtmValue('  facebook  ')).toBe('facebook');
    expect(normalizeUtmValue('tey-26_v1.2')).toBe('tey-26_v1.2');
  });

  it('treats empty as absent', () => {
    expect(normalizeUtmValue('')).toBeUndefined();
    expect(normalizeUtmValue('   ')).toBeUndefined();
    expect(normalizeUtmValue(null)).toBeUndefined();
  });

  it('rejects control chars, spaces, and overlong values', () => {
    expect(normalizeUtmValue('face book')).toBeUndefined();
    expect(normalizeUtmValue('a'.repeat(129))).toBeUndefined();
    expect(normalizeUtmValue('bad\nvalue')).toBeUndefined();
  });
});

describe('captureUtmFromSearchParams', () => {
  it('reads case-insensitive param names', () => {
    const params = new URLSearchParams(
      'UTM_SOURCE=facebook&utm_Medium=video&Utm_Campaign=tey26',
    );
    expect(captureUtmFromSearchParams(params)).toEqual({
      utmSource: 'facebook',
      utmMedium: 'video',
      utmCampaign: 'tey26',
    });
  });

  it('omits invalid or empty fields', () => {
    const params = new URLSearchParams('utm_source=&utm_medium=ok value&utm_campaign=ok');
    expect(captureUtmFromSearchParams(params)).toEqual({
      utmCampaign: 'ok',
    });
  });
});

describe('mergeUtmAttribution', () => {
  it('keeps the first non-empty value per field', () => {
    expect(
      mergeUtmAttribution(
        { utmSource: 'facebook' },
        { utmSource: 'google', utmMedium: 'video' },
      ),
    ).toEqual({
      utmSource: 'facebook',
      utmMedium: 'video',
      utmCampaign: undefined,
    });
  });
});

describe('compactUtmAttribution', () => {
  it('drops undefined keys', () => {
    expect(compactUtmAttribution({ utmSource: 'facebook', utmMedium: undefined })).toEqual({
      utmSource: 'facebook',
    });
  });
});
