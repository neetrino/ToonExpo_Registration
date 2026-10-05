import { z } from 'zod';
import { OTHER_TEXT_MAX_LENGTH } from '@/lib/questionnaire/constants';

/** Regions that open a city choice. Other marzes stay region-only. */
export const MARZ_CITY_OPTIONS = {
  aragatsotn: ['ashtarak', 'other'],
  ararat: ['artashat', 'masis', 'other'],
  kotayk: ['abovyan', 'kanakeravan', 'other'],
} as const;

export const MARZ_CITY_REGIONS = ['aragatsotn', 'ararat', 'kotayk'] as const;

export const ALL_MARZ_CITY_CODES = [
  'ashtarak',
  'artashat',
  'masis',
  'abovyan',
  'kanakeravan',
  'other',
] as const;

export type MarzCityRegion = (typeof MARZ_CITY_REGIONS)[number];
export type MarzCityCode = (typeof ALL_MARZ_CITY_CODES)[number];

export type AragatsotnCity = (typeof MARZ_CITY_OPTIONS.aragatsotn)[number];
export type AraratCity = (typeof MARZ_CITY_OPTIONS.ararat)[number];
export type KotaykCity = (typeof MARZ_CITY_OPTIONS.kotayk)[number];

export type MarzCityEntry<TCity extends string> = {
  city: TCity;
  other?: string;
};

/** City choice for each selected region that has one. Omitted keys are not selected. */
export type MarzCities = {
  aragatsotn?: MarzCityEntry<AragatsotnCity>;
  ararat?: MarzCityEntry<AraratCity>;
  kotayk?: MarzCityEntry<KotaykCity>;
};

const otherTextSchema = z.string().trim().min(1).max(OTHER_TEXT_MAX_LENGTH);

type CityLabelers = {
  region: (code: string) => string;
  city: (code: string) => string;
};

const REGION_CITY_SEPARATOR = ' — ';

export function isMarzCityRegion(region: string): region is MarzCityRegion {
  return (MARZ_CITY_REGIONS as readonly string[]).includes(region);
}

function refineCityOther(
  city: string | undefined,
  other: string | undefined,
  ctx: z.RefinementCtx,
): void {
  if (city === 'other' && !other) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['other'],
      message: 'Required when city is other',
    });
  }

  if (city !== 'other' && other) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['other'],
      message: 'other is only allowed when city is other',
    });
  }
}

function citySchema<T extends readonly [string, ...string[]]>(cities: T) {
  return z
    .object({
      city: z.enum(cities),
      other: otherTextSchema.optional(),
    })
    .superRefine((data, ctx) => {
      refineCityOther(data.city, data.other, ctx);
    });
}

export const marzCitiesSchema = z
  .object({
    aragatsotn: citySchema(MARZ_CITY_OPTIONS.aragatsotn).optional(),
    ararat: citySchema(MARZ_CITY_OPTIONS.ararat).optional(),
    kotayk: citySchema(MARZ_CITY_OPTIONS.kotayk).optional(),
  })
  .strict();

/** Requires a city for each selected city-region and rejects cities for unselected ones. */
export function assertMarzCitiesMatchRegions(
  regions: readonly string[],
  cities: MarzCities | undefined,
  ctx: z.RefinementCtx,
): void {
  for (const region of MARZ_CITY_REGIONS) {
    const entry = cities?.[region];
    if (!regions.includes(region)) {
      if (entry) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['marzCities', region],
          message: 'City is only allowed for a selected region',
        });
      }
      continue;
    }

    if (!entry) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['marzCities', region],
        message: 'Select a city',
      });
    }
  }
}

type ResidenceMarzInput = {
  region: string;
  city?: string;
  cityOther?: string;
};

/** Checks a single residence marz: city required only for Aragatsotn, Ararat, and Kotayk. */
export function assertResidenceMarzCity(data: ResidenceMarzInput, ctx: z.RefinementCtx): void {
  if (!isMarzCityRegion(data.region)) {
    if (data.city || data.cityOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['city'],
        message: 'City is only allowed for regions with a city choice',
      });
    }
    return;
  }

  const allowed = MARZ_CITY_OPTIONS[data.region] as readonly string[];
  if (!data.city || !allowed.includes(data.city)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['city'],
      message: 'Select a city',
    });
    return;
  }

  if (data.city === 'other' && !data.cityOther) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cityOther'],
      message: 'Required when city is other',
    });
  }

  if (data.city !== 'other' && data.cityOther) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cityOther'],
      message: 'cityOther is only allowed when city is other',
    });
  }
}

function readCityEntry(cities: unknown, region: string): { city?: string; other?: string } | null {
  if (!cities || typeof cities !== 'object') {
    return null;
  }

  const entry = (cities as Record<string, unknown>)[region];
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const record = entry as Record<string, unknown>;
  return {
    city: typeof record.city === 'string' ? record.city : undefined,
    other: typeof record.other === 'string' ? record.other : undefined,
  };
}

/** Region label, with the chosen city or free-text place beside it. */
export function formatMarzSelectionLabel(
  region: string,
  cities: unknown,
  labels: CityLabelers,
): string {
  const regionLabel = labels.region(region);
  const entry = readCityEntry(cities, region);
  if (!entry?.city) {
    return regionLabel;
  }

  if (entry.city === 'other') {
    const text = entry.other?.trim();
    return text ? `${regionLabel}${REGION_CITY_SEPARATOR}${text}` : regionLabel;
  }

  return `${regionLabel}${REGION_CITY_SEPARATOR}${labels.city(entry.city)}`;
}

export function formatMarzSelectionList(
  regions: readonly string[],
  cities: unknown,
  labels: CityLabelers,
): string {
  return regions.map((region) => formatMarzSelectionLabel(region, cities, labels)).join(', ');
}

export function formatResidenceMarzLabel(
  region: string,
  city: unknown,
  cityOther: unknown,
  labels: CityLabelers,
): string {
  if (!isMarzCityRegion(region) || typeof city !== 'string') {
    return labels.region(region);
  }

  return formatMarzSelectionLabel(
    region,
    { [region]: { city, other: typeof cityOther === 'string' ? cityOther : undefined } },
    labels,
  );
}

type CityDraft = {
  aragatsotn: string;
  ararat: string;
  kotayk: string;
};

function storedEntry<TCity extends string>(
  city: string,
  allowed: readonly TCity[],
  other: string,
): MarzCityEntry<TCity> | undefined {
  if (!(allowed as readonly string[]).includes(city)) {
    return undefined;
  }

  const selected = city as TCity;
  if (selected !== 'other') {
    return { city: selected };
  }

  const text = other.trim();
  return text ? { city: selected, other: text } : { city: selected };
}

/** Builds the stored city map from wizard drafts. Incomplete "other" text is kept for schema rejection. */
export function toStoredMarzCities(
  regions: readonly string[],
  city: CityDraft,
  other: CityDraft,
): MarzCities {
  const stored: MarzCities = {};

  if (regions.includes('aragatsotn')) {
    stored.aragatsotn = storedEntry(city.aragatsotn, MARZ_CITY_OPTIONS.aragatsotn, other.aragatsotn);
  }
  if (regions.includes('ararat')) {
    stored.ararat = storedEntry(city.ararat, MARZ_CITY_OPTIONS.ararat, other.ararat);
  }
  if (regions.includes('kotayk')) {
    stored.kotayk = storedEntry(city.kotayk, MARZ_CITY_OPTIONS.kotayk, other.kotayk);
  }

  return stored;
}

export function hasStoredMarzCities(cities: MarzCities): boolean {
  return Boolean(cities.aragatsotn || cities.ararat || cities.kotayk);
}
