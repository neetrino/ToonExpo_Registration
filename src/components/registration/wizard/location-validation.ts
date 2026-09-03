import { z } from 'zod';
import {
  ABROAD_COUNTRIES,
  LOCATION_CHOICE_MAX,
  LOCATION_SEEK_SCOPES,
  MARZ_REGIONS,
  OTHER_TEXT_MAX_LENGTH,
  RESEARCH_LOCATION_SCOPES,
  YEREVAN_DISTRICTS,
} from '@/lib/questionnaire';
import { countLocationChoiceLeaves } from '@/lib/questionnaire/location-choice';

const otherTextSchema = z.string().trim().min(1).max(OTHER_TEXT_MAX_LENGTH);

export const locationChoiceStepSchema = z
  .object({
    locationSeekScopes: z.array(z.enum(LOCATION_SEEK_SCOPES)).min(1),
    locationSeekAbroadCountries: z.array(z.enum(ABROAD_COUNTRIES)),
    locationSeekAbroadOther: z.string(),
    yerevanDistricts: z.array(z.enum(YEREVAN_DISTRICTS)),
    marzRegions: z.array(z.enum(MARZ_REGIONS)),
  })
  .superRefine((data, ctx) => {
    if (data.locationSeekScopes.includes('yerevan') && data.yerevanDistricts.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['yerevanDistricts'],
        message: 'required',
      });
    }

    if (data.locationSeekScopes.includes('marz') && data.marzRegions.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['marzRegions'], message: 'required' });
    }

    if (data.locationSeekScopes.includes('abroad')) {
      if (data.locationSeekAbroadCountries.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['locationSeekAbroadCountries'],
          message: 'required',
        });
      }

      if (data.locationSeekAbroadCountries.includes('other')) {
        const other = otherTextSchema.safeParse(data.locationSeekAbroadOther);
        if (!other.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['locationSeekAbroadOther'],
            message: 'required',
          });
        }
      }
    }

    const leaves = countLocationChoiceLeaves({
      yerevanDistricts: data.yerevanDistricts,
      marzRegions: data.marzRegions,
      abroadCountries: data.locationSeekAbroadCountries,
    });

    if (leaves > LOCATION_CHOICE_MAX) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['locationSeekScopes'],
        message: 'max',
      });
    }
  });

export const researchLocationStepSchema = z
  .object({
    researchScopes: z.array(z.enum(RESEARCH_LOCATION_SCOPES)).min(1).max(LOCATION_CHOICE_MAX),
    yerevanDistricts: z.array(z.enum(YEREVAN_DISTRICTS)),
    marzRegions: z.array(z.enum(MARZ_REGIONS)),
    researchAbroadCountry: z.string(),
    purchaseHorizon: z.enum([
      'up_to_3_months',
      '3-6_months',
      '6-12_months',
      '1-2_years',
      'no_plans',
    ]),
  })
  .superRefine((data, ctx) => {
    if (data.researchScopes.includes('undecided') && data.researchScopes.length > 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['researchScopes'], message: 'required' });
    }

    if (data.researchScopes.includes('yerevan') && data.yerevanDistricts.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['yerevanDistricts'],
        message: 'required',
      });
    }

    if (data.researchScopes.includes('marz') && data.marzRegions.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['marzRegions'], message: 'required' });
    }

    if (data.researchScopes.includes('abroad')) {
      const other = otherTextSchema.safeParse(data.researchAbroadCountry);
      if (!other.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['researchAbroadCountry'],
          message: 'required',
        });
      }
    }

    if (!data.researchScopes.includes('undecided')) {
      const leaves =
        data.yerevanDistricts.length +
        data.marzRegions.length +
        Number(data.researchScopes.includes('abroad'));

      if (leaves > LOCATION_CHOICE_MAX) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['researchScopes'],
          message: 'max',
        });
      }
    }
  });
