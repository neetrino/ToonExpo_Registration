import { z } from 'zod';
import { MARKET_INTERESTS_MAX, OTHER_TEXT_MAX_LENGTH } from '@/lib/questionnaire/constants';
import {
  locationChoiceSchema,
  researchLocationSchema,
  residencePlaceSchema,
} from '@/lib/questionnaire/location-choice';
import {
  ABROAD_COUNTRIES,
  AGE_BANDS,
  AREA_SQM_BANDS,
  DECISION_STAGES,
  INVESTMENT_BUDGETS_USD,
  INVESTMENT_GOALS,
  INVESTMENT_PROPERTY_TYPES,
  INVESTMENT_TIMELINES,
  MARKET_INTERESTS,
  MONTHLY_BUDGETS,
  PRIOR_INVESTMENT_EXPERIENCES,
  PURCHASE_HORIZONS,
  PURCHASE_METHODS,
  RESEARCH_GOALS,
} from '@/lib/questionnaire/options';
import type { QuestionnaireAnswers } from '@/lib/questionnaire/types';

const ageBandSchema = z.enum(AGE_BANDS);
const newsletterSchema = z.boolean();
const otherTextSchema = z.string().trim().min(1).max(OTHER_TEXT_MAX_LENGTH);

const sharedAnswers = {
  ageBand: ageBandSchema,
  residence: residencePlaceSchema,
  newsletter: newsletterSchema,
} as const;

const ownResidenceSchema = z
  .object({
    ...sharedAnswers,
    visitPurpose: z.literal('own_residence'),
    interestType: z.enum(['apartment_new', 'house_townhouse', 'abroad']),
    abroadCountries: z
      .array(z.enum(ABROAD_COUNTRIES))
      .min(1)
      .max(ABROAD_COUNTRIES.length)
      .refine((values) => new Set(values).size === values.length, {
        message: 'abroadCountries must be unique',
      })
      .optional(),
    abroadCountriesOther: otherTextSchema.optional(),
    locationSeek: locationChoiceSchema,
    areaSqm: z.enum(AREA_SQM_BANDS),
    purchaseMethod: z.enum(PURCHASE_METHODS),
    monthlyBudget: z.enum(MONTHLY_BUDGETS),
    decisionStage: z.enum(DECISION_STAGES),
  })
  .superRefine((data, ctx) => {
    if (data.interestType !== 'abroad') {
      return;
    }

    if (!data.abroadCountries || data.abroadCountries.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['abroadCountries'],
        message: 'Required when interestType is abroad',
      });
    }

    if (data.abroadCountries?.includes('other') && !data.abroadCountriesOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['abroadCountriesOther'],
        message: 'Required when abroadCountries includes other',
      });
    }
  });

export const ownResidenceAnswersSchema = ownResidenceSchema;

export const investmentAnswersSchema = z
  .object({
    ...sharedAnswers,
    visitPurpose: z.literal('investment'),
    investmentPropertyType: z.enum(INVESTMENT_PROPERTY_TYPES),
    investmentPropertyTypeOther: otherTextSchema.optional(),
    locationSeek: locationChoiceSchema,
    investmentGoal: z.enum(INVESTMENT_GOALS),
    areaSqm: z.enum(AREA_SQM_BANDS),
    purchaseMethod: z.enum(PURCHASE_METHODS),
    investmentTimeline: z.enum(INVESTMENT_TIMELINES),
    investmentBudgetUsd: z.enum(INVESTMENT_BUDGETS_USD),
    priorInvestmentExperience: z.enum(PRIOR_INVESTMENT_EXPERIENCES),
    priorInvestmentExperienceOther: otherTextSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.investmentPropertyType === 'other' && !data.investmentPropertyTypeOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['investmentPropertyTypeOther'],
        message: 'Required when investmentPropertyType is other',
      });
    }

    if (data.priorInvestmentExperience === 'yes_abroad' && !data.priorInvestmentExperienceOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['priorInvestmentExperienceOther'],
        message: 'Required when priorInvestmentExperience is yes_abroad',
      });
    }
  });

export const marketResearchAnswersSchema = z.object({
  ...sharedAnswers,
  visitPurpose: z.literal('market_research'),
  marketInterests: z
    .array(z.enum(MARKET_INTERESTS))
    .min(1)
    .max(MARKET_INTERESTS_MAX)
    .refine((values) => new Set(values).size === values.length, {
      message: 'marketInterests must be unique',
    }),
  researchGoal: z.enum(RESEARCH_GOALS),
  researchLocation: researchLocationSchema,
  purchaseHorizon: z.enum(PURCHASE_HORIZONS),
});

/**
 * Validates questionnaire answers for the active form version.
 * Discriminates by visitPurpose; rejects cross-branch fields via schema shape.
 */
export const questionnaireAnswersSchema: z.ZodType<QuestionnaireAnswers> = z.union([
  ownResidenceAnswersSchema,
  investmentAnswersSchema,
  marketResearchAnswersSchema,
]);

export type ParsedQuestionnaireAnswers = z.infer<typeof questionnaireAnswersSchema>;
