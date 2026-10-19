import { describe, expect, it } from 'vitest';
import {
  filterResidenceCountries,
  isResidenceCountry,
  listResidenceCountries,
} from './residence-countries';

describe('residence country catalog', () => {
  it.each(['hy', 'en', 'ru'])('lists all countries with Russian search aliases in %s', (locale) => {
    const options = listResidenceCountries(locale);
    expect(options.length).toBeGreaterThanOrEqual(249);
    expect(new Set(options.map((option) => option.code)).size).toBe(options.length);
    const russia = options.find((option) => option.code === 'RU');
    expect(russia?.search).toContain('РФ');
    expect(russia?.search).toContain('Ռուսաստանի Դաշնություն');
    expect(isResidenceCountry(russia!.name)).toBe(true);
  });
  it('rejects unknown countries and incomplete search queries', () => {
    expect(isResidenceCountry('Atlantis')).toBe(false);
    expect(isResidenceCountry('Ру')).toBe(false);
  });
});

it('matches РФ and ՌԴ exactly instead of matching Norfolk Island', () => {
  for (const query of ['РФ', 'ՌԴ', 'RU', 'Russian Federation']) {
    expect(
      filterResidenceCountries(listResidenceCountries('ru'), query).map((country) => country.code),
    ).toEqual(['RU']);
  }
});
