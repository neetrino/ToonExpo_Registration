import { z } from 'zod';
import { LOCATION_CHOICE_MAX, OTHER_TEXT_MAX_LENGTH } from '@/lib/questionnaire/constants';
import {
  ALL_MARZ_CITY_CODES,
  assertMarzCitiesMatchRegions,
  assertResidenceMarzCity,
  marzCitiesSchema,
} from '@/lib/questionnaire/marz-cities';
import { ABROAD_COUNTRIES, MARZ_REGIONS, YEREVAN_DISTRICTS } from '@/lib/questionnaire/options';
import type { ResidencePlace } from '@/lib/questionnaire/types';

const otherTextSchema = z.string().trim().min(1).max(OTHER_TEXT_MAX_LENGTH);

const uniqueYerevanDistricts = z
  .array(z.enum(YEREVAN_DISTRICTS))
  .refine((items) => new Set(items).size === items.length, { message: 'districts must be unique' });

const uniqueMarzRegions = z
  .array(z.enum(MARZ_REGIONS))
  .refine((items) => new Set(items).size === items.length, { message: 'regions must be unique' });

const uniqueAbroadCountries = z
  .array(z.enum(ABROAD_COUNTRIES))
  .refine((items) => new Set(items).size === items.length, {
    message: 'abroadCountries must be unique',
  });

/** Counts selected location leaves across Yerevan, marz, and abroad. */
export function countLocationChoiceLeaves(choice: {
  yerevanDistricts: readonly string[];
  marzRegions: readonly string[];
  abroadCountries: readonly string[];
}): number {
  return choice.yerevanDistricts.length + choice.marzRegions.length + choice.abroadCountries.length;
}

function countActiveLocationGroups(
  hasYerevan: boolean,
  hasMarz: boolean,
  hasAbroad: boolean,
): number {
  return Number(hasYerevan) + Number(hasMarz) + Number(hasAbroad);
}

export const residencePlaceSchema: z.ZodType<ResidencePlace> = z
  .discriminatedUnion('scope', [
    z.object({
      scope: z.literal('yerevan'),
      district: z.enum(YEREVAN_DISTRICTS),
    }),
    z.object({
      scope: z.literal('marz'),
      region: z.enum(MARZ_REGIONS),
      city: z.enum(ALL_MARZ_CITY_CODES).optional(),
      cityOther: otherTextSchema.optional(),
    }),
    z.object({
      scope: z.literal('abroad'),
      country: otherTextSchema,
    }),
  ])
  .superRefine((data, ctx) => {
    if (data.scope === 'marz') {
      assertResidenceMarzCity(data, ctx);
    }
  });

export const locationChoiceSchema = z
  .object({
    yerevanDistricts: uniqueYerevanDistricts,
    marzRegions: uniqueMarzRegions,
    marzCities: marzCitiesSchema.optional(),
    abroadCountries: uniqueAbroadCountries,
    abroadCountriesOther: otherTextSchema.optional(),
  })
  .superRefine((data, ctx) => {
    assertMarzCitiesMatchRegions(data.marzRegions, data.marzCities, ctx);
    const count = countLocationChoiceLeaves(data);
    const groups = countActiveLocationGroups(
      data.yerevanDistricts.length > 0,
      data.marzRegions.length > 0,
      data.abroadCountries.length > 0,
    );

    if (count < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['yerevanDistricts'],
        message: 'Select at least one location',
      });
    }

    if (groups > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['yerevanDistricts'],
        message: 'Select locations from only one scope',
      });
    }

    if (count > LOCATION_CHOICE_MAX) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['yerevanDistricts'],
        message: `Select at most ${LOCATION_CHOICE_MAX} locations`,
      });
    }

    if (data.abroadCountries.includes('other') && !data.abroadCountriesOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['abroadCountriesOther'],
        message: 'Required when abroadCountries includes other',
      });
    }
  });

export const researchLocationSchema = z
  .object({
    undecided: z.boolean(),
    yerevanDistricts: uniqueYerevanDistricts,
    marzRegions: uniqueMarzRegions,
    marzCities: marzCitiesSchema.optional(),
    abroadCountry: otherTextSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.undecided) {
      assertMarzCitiesMatchRegions(data.marzRegions, data.marzCities, ctx);
    }
    const hasYerevan = data.yerevanDistricts.length > 0;
    const hasMarz = data.marzRegions.length > 0;
    const hasAbroad = Boolean(data.abroadCountry);
    const leafCount = data.yerevanDistricts.length + data.marzRegions.length + Number(hasAbroad);

    if (data.undecided) {
      if (hasYerevan || hasMarz || hasAbroad || data.marzCities) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['undecided'],
          message: 'Undecided cannot be combined with other locations',
        });
      }
      return;
    }

    if (!hasYerevan && !hasMarz && !hasAbroad) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['yerevanDistricts'],
        message: 'Select at least one location',
      });
    }

    if (countActiveLocationGroups(hasYerevan, hasMarz, hasAbroad) > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['yerevanDistricts'],
        message: 'Select locations from only one scope',
      });
    }

    if (leafCount > LOCATION_CHOICE_MAX) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['yerevanDistricts'],
        message: `Select at most ${LOCATION_CHOICE_MAX} locations`,
      });
    }
  });
