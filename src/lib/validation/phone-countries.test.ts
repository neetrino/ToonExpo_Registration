import { describe, expect, it } from 'vitest';
import {
  filterPhoneCountries,
  listPhoneCountries,
} from '@/lib/validation/phone-countries';

describe('filterPhoneCountries', () => {
  const countries = listPhoneCountries('en');

  it('matches by English country name', () => {
    const result = filterPhoneCountries(countries, 'Armenia');
    expect(result.some((option) => option.code === 'AM')).toBe(true);
  });

  it('matches by ISO country code', () => {
    const result = filterPhoneCountries(countries, 'am');
    expect(result[0]?.code).toBe('AM');
  });

  it('matches by calling code with or without plus', () => {
    expect(filterPhoneCountries(countries, '374').some((option) => option.code === 'AM')).toBe(
      true,
    );
    expect(filterPhoneCountries(countries, '+374').some((option) => option.code === 'AM')).toBe(
      true,
    );
  });

  it('matches Russian and Armenian localized names in search text', () => {
    expect(filterPhoneCountries(countries, 'Россия').some((option) => option.code === 'RU')).toBe(
      true,
    );
    expect(
      filterPhoneCountries(countries, 'Հայաստան').some((option) => option.code === 'AM'),
    ).toBe(true);
  });

  it('returns all countries for an empty query', () => {
    expect(filterPhoneCountries(countries, '   ')).toHaveLength(countries.length);
  });
});
