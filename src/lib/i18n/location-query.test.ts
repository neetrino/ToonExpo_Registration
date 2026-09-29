import { describe, expect, it } from 'vitest';
import { localeSwitchHref, queryFromLocationSearch } from '@/lib/i18n/location-query';

describe('queryFromLocationSearch', () => {
  it('treats an empty search as absent', () => {
    expect(queryFromLocationSearch('')).toBeUndefined();
    expect(queryFromLocationSearch('?')).toBeUndefined();
  });

  it('keeps UTM params and other query keys', () => {
    expect(
      queryFromLocationSearch('?utm_source=facebook&utm_medium=cpc&utm_campaign=tey26&fbclid=abc'),
    ).toEqual({
      utm_source: 'facebook',
      utm_medium: 'cpc',
      utm_campaign: 'tey26',
      fbclid: 'abc',
    });
  });

  it('decodes encoded values', () => {
    expect(queryFromLocationSearch('?utm_campaign=toon%20expo')).toEqual({
      utm_campaign: 'toon expo',
    });
  });
});

describe('localeSwitchHref', () => {
  it('returns the pathname alone when there is no query', () => {
    expect(localeSwitchHref('/privacy', '')).toBe('/privacy');
  });

  it('attaches the current query to the unprefixed pathname', () => {
    expect(localeSwitchHref('/', '?utm_source=facebook&utm_medium=cpc&utm_campaign=tey26')).toEqual(
      {
        pathname: '/',
        query: {
          utm_source: 'facebook',
          utm_medium: 'cpc',
          utm_campaign: 'tey26',
        },
      },
    );
  });
});
