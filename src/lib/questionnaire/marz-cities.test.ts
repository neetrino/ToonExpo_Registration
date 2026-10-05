import { describe, expect, it } from 'vitest';
import { locationChoiceSchema, residencePlaceSchema } from '@/lib/questionnaire/location-choice';
import { formatMarzSelectionList } from '@/lib/questionnaire/marz-cities';

const labels = {
  region: (code: string) => code,
  city: (code: string) => code,
};

describe('marz city choice', () => {
  it('accepts Ashtarak for an Aragatsotn residence', () => {
    const parsed = residencePlaceSchema.safeParse({
      scope: 'marz',
      region: 'aragatsotn',
      city: 'ashtarak',
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects a city on a region that has no city choice', () => {
    const parsed = residencePlaceSchema.safeParse({
      scope: 'marz',
      region: 'lori',
      city: 'ashtarak',
    });

    expect(parsed.success).toBe(false);
  });

  it('requires a city when Kotayk is selected', () => {
    const parsed = locationChoiceSchema.safeParse({
      yerevanDistricts: [],
      marzRegions: ['kotayk'],
      abroadCountries: [],
    });

    expect(parsed.success).toBe(false);
  });

  it('requires the written place when Other is selected', () => {
    const parsed = locationChoiceSchema.safeParse({
      yerevanDistricts: [],
      marzRegions: ['ararat'],
      marzCities: { ararat: { city: 'other' } },
      abroadCountries: [],
    });

    expect(parsed.success).toBe(false);
  });

  it('accepts a named city and leaves regions without a city choice unchanged', () => {
    const parsed = locationChoiceSchema.safeParse({
      yerevanDistricts: [],
      marzRegions: ['kotayk', 'lori'],
      marzCities: { kotayk: { city: 'other', other: 'Հրազդան' } },
      abroadCountries: [],
    });

    expect(parsed.success).toBe(true);
  });

  it('formats the city beside the region and keeps the free-text place', () => {
    const label = formatMarzSelectionList(
      ['aragatsotn', 'ararat', 'lori'],
      {
        aragatsotn: { city: 'ashtarak' },
        ararat: { city: 'other', other: 'Վեդի' },
      },
      labels,
    );

    expect(label).toBe('aragatsotn — ashtarak, ararat — Վեդի, lori');
  });
});
