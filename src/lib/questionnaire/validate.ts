import { z } from 'zod';
import { MARKET_INTERESTS_MAX, OTHER_TEXT_MAX_LENGTH } from '@/lib/questionnaire/constants';
import {
  ABROAD_COUNTRIES,
  AGE_BANDS,
  AREA_SQM_BANDS,
  DECISION_STAGES,
  INTERESTED_WHERE_OPTIONS,
  INVESTMENT_BUDGETS_USD,
  INVESTMENT_GOALS,
  INVESTMENT_MARKETS,
  INVESTMENT_PROPERTY_TYPES,
  INVESTMENT_TIMELINES,
  MARKET_INTERESTS,
  MARZ_REGIONS,
  MONTHLY_BUDGETS,
  PRIOR_INVESTMENT_EXPERIENCES,
  PURCHASE_HORIZONS,
  PURCHASE_METHODS,
  RESEARCH_GOALS,
  YEREVAN_DISTRICTS,
} from '@/lib/questionnaire/options';
import type { QuestionnaireAnswers } from '@/lib/questionnaire/types';

const ageBandSchema = z.enum(AGE_BANDS);
const newsletterSchema = z.boolean();
const otherTextSchema = z.string().trim().min(1).max(OTHER_TEXT_MAX_LENGTH);

const locationSeekSchema = z.discriminatedUnion('scope', [
  z.object({
    scope: z.literal('yerevan'),
    districts: z
      .array(z.enum(YEREVAN_DISTRICTS))
      .min(1)
      .max(YEREVAN_DISTRICTS.length)
      .refine((values) => new Set(values).size === values.length, {
        message: 'districts must be unique',
      }),
  }),
  z.object({
    scope: z.literal('marz'),
    regions: z
      .array(z.enum(MARZ_REGIONS))
      .min(1)
      .max(MARZ_REGIONS.length)
      .refine((values) => new Set(values).size === values.length, {
        message: 'regions must be unique',
      }),
  }),
  z.object({
    scope: z.literal('abroad'),
  }),
]);

const ownResidenceShared = {
  ageBand: ageBandSchema,
  visitPurpose: z.literal('own_residence'),
  areaSqm: z.enum(AREA_SQM_BANDS),
  purchaseMethod: z.enum(PURCHASE_METHODS),
  monthlyBudget: z.enum(MONTHLY_BUDGETS),
  decisionStage: z.enum(DECISION_STAGES),
  newsletter: newsletterSchema,
} as const;

const ownResidenceLocalSchema = z.object({
  ...ownResidenceShared,
  interestType: z.enum(['house_townhouse', 'apartment_new']),
  locationSeek: locationSeekSchema,
});

const ownResidenceAbroadSchema = z
  .object({
    ...ownResidenceShared,
    interestType: z.literal('abroad'),
    abroadCountries: z
      .array(z.enum(ABROAD_COUNTRIES))
      .min(1)
      .max(ABROAD_COUNTRIES.length)
      .refine((values) => new Set(values).size === values.length, {
        message: 'abroadCountries must be unique',
      }),
    abroadCountriesOther: otherTextSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.abroadCountries.includes('other') && !data.abroadCountriesOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['abroadCountriesOther'],
        message: 'Required when abroadCountries includes other',
      });
    }
  });

export const ownResidenceAnswersSchema = z.union([
  ownResidenceLocalSchema,
  ownResidenceAbroadSchema,
]);

export const investmentAnswersSchema = z
  .object({
    ageBand: ageBandSchema,
    visitPurpose: z.literal('investment'),
    investmentPropertyType: z.enum(INVESTMENT_PROPERTY_TYPES),
    investmentPropertyTypeOther: otherTextSchema.optional(),
    investmentMarket: z.enum(INVESTMENT_MARKETS),
    investmentMarketOther: otherTextSchema.optional(),
    investmentGoal: z.enum(INVESTMENT_GOALS),
    investmentTimeline: z.enum(INVESTMENT_TIMELINES),
    investmentBudgetUsd: z.enum(INVESTMENT_BUDGETS_USD),
    priorInvestmentExperience: z.enum(PRIOR_INVESTMENT_EXPERIENCES),
    newsletter: newsletterSchema,
  })
  .superRefine((data, ctx) => {
    if (data.investmentPropertyType === 'other' && !data.investmentPropertyTypeOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['investmentPropertyTypeOther'],
        message: 'Required when investmentPropertyType is other',
      });
    }
    if (data.investmentMarket === 'other' && !data.investmentMarketOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['investmentMarketOther'],
        message: 'Required when investmentMarket is other',
      });
    }
  });

export const marketResearchAnswersSchema = z
  .object({
    ageBand: ageBandSchema,
    visitPurpose: z.literal('market_research'),
    marketInterests: z
      .array(z.enum(MARKET_INTERESTS))
      .min(1)
      .max(MARKET_INTERESTS_MAX)
      .refine((values) => new Set(values).size === values.length, {
        message: 'marketInterests must be unique',
      }),
    researchGoal: z.enum(RESEARCH_GOALS),
    interestedWhere: z.enum(INTERESTED_WHERE_OPTIONS),
    interestedWhereOther: otherTextSchema.optional(),
    purchaseHorizon: z.enum(PURCHASE_HORIZONS),
    newsletter: newsletterSchema,
  })
  .superRefine((data, ctx) => {
    if (data.interestedWhere === 'abroad' && !data.interestedWhereOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['interestedWhereOther'],
        message: 'Required when interestedWhere is abroad',
      });
    }
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
