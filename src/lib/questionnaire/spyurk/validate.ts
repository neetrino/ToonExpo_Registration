import { z } from 'zod';
import { MARKET_INTERESTS_MAX, OTHER_TEXT_MAX_LENGTH } from '@/lib/questionnaire/constants';
import {
  AGE_BANDS,
  AREA_SQM_BANDS,
  DECISION_STAGES,
  INVESTMENT_BUDGETS_USD,
  INVESTMENT_PROPERTY_TYPES,
  INVESTMENT_TIMELINES,
  MARKET_INTERESTS,
  PRIOR_INVESTMENT_EXPERIENCES,
  PURCHASE_HORIZONS,
  PURCHASE_METHODS,
} from '@/lib/questionnaire/options';
import {
  SPYURK_MULTI_SELECT_MAX,
  SPYURK_RESIDENCE_TEXT_MAX_LENGTH,
} from '@/lib/questionnaire/spyurk/constants';
import {
  ARMENIA_CONNECTIONS,
  ARMENIA_VISIT_TIMINGS,
  INVESTMENT_TYPES_REQUIRING_AREA,
  PURCHASE_BUDGETS_USD,
  PURCHASE_MOTIVES,
  SPYURK_INTEREST_TYPES,
  SPYURK_INVESTMENT_GOALS,
  SPYURK_RESEARCH_GOALS,
} from '@/lib/questionnaire/spyurk/options';
import type { SpyurkQuestionnaireAnswers } from '@/lib/questionnaire/spyurk/types';

const otherTextSchema = z.string().trim().min(1).max(OTHER_TEXT_MAX_LENGTH);
const residenceTextSchema = z.string().trim().min(1).max(SPYURK_RESIDENCE_TEXT_MAX_LENGTH);

const uniqueEnumArray = <T extends readonly [string, ...string[]]>(values: T, max: number) =>
  z
    .array(z.enum(values))
    .min(1)
    .max(max)
    .refine((items) => new Set(items).size === items.length, { message: 'Values must be unique' });

const propertyCountrySchema = z.discriminatedUnion('scope', [
  z.object({ scope: z.literal('armenia') }),
  z.object({ scope: z.literal('other'), country: otherTextSchema }),
]);

const sharedAnswers = {
  ageBand: z.enum(AGE_BANDS),
  residence: z.object({
    city: residenceTextSchema,
    region: residenceTextSchema,
  }),
  armeniaConnection: z.enum(ARMENIA_CONNECTIONS),
  armeniaConnectionOther: otherTextSchema.optional(),
  purchaseMotives: uniqueEnumArray(PURCHASE_MOTIVES, SPYURK_MULTI_SELECT_MAX),
  purchaseMotivesOther: otherTextSchema.optional(),
  newsletter: z.boolean(),
} as const;

function refineSharedOthers(
  data: {
    armeniaConnection: string;
    armeniaConnectionOther?: string;
    purchaseMotives: readonly string[];
    purchaseMotivesOther?: string;
  },
  ctx: z.RefinementCtx,
): void {
  if (data.armeniaConnection === 'other' && !data.armeniaConnectionOther) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['armeniaConnectionOther'],
      message: 'Required when armeniaConnection is other',
    });
  }

  if (data.purchaseMotives.includes('other') && !data.purchaseMotivesOther) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['purchaseMotivesOther'],
      message: 'Required when purchaseMotives includes other',
    });
  }
}

export const spyurkOwnResidenceAnswersSchema = z
  .object({
    ...sharedAnswers,
    visitPurpose: z.literal('own_residence'),
    interestTypes: uniqueEnumArray(SPYURK_INTEREST_TYPES, SPYURK_MULTI_SELECT_MAX),
    interestTypesOther: otherTextSchema.optional(),
    propertyCountry: propertyCountrySchema,
    areaSqm: z.enum(AREA_SQM_BANDS),
    purchaseMethod: z.enum(PURCHASE_METHODS),
    purchaseBudgetUsd: z.enum(PURCHASE_BUDGETS_USD),
    decisionStage: z.enum(DECISION_STAGES),
    armeniaVisitTiming: z.enum(ARMENIA_VISIT_TIMINGS),
  })
  .superRefine((data, ctx) => {
    refineSharedOthers(data, ctx);
    if (data.interestTypes.includes('other') && !data.interestTypesOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['interestTypesOther'],
        message: 'Required when interestTypes includes other',
      });
    }
  });

export const spyurkInvestmentAnswersSchema = z
  .object({
    ...sharedAnswers,
    visitPurpose: z.literal('investment'),
    investmentPropertyTypes: uniqueEnumArray(INVESTMENT_PROPERTY_TYPES, SPYURK_MULTI_SELECT_MAX),
    investmentPropertyTypeOther: otherTextSchema.optional(),
    propertyCountry: propertyCountrySchema,
    investmentGoal: z.enum(SPYURK_INVESTMENT_GOALS),
    areaSqm: z.enum(AREA_SQM_BANDS).optional(),
    purchaseMethod: z.enum(PURCHASE_METHODS),
    investmentTimeline: z.enum(INVESTMENT_TIMELINES),
    investmentBudgetUsd: z.enum(INVESTMENT_BUDGETS_USD),
    priorInvestmentExperience: z.enum(PRIOR_INVESTMENT_EXPERIENCES),
    priorInvestmentExperienceOther: otherTextSchema.optional(),
    armeniaVisitTiming: z.enum(ARMENIA_VISIT_TIMINGS),
  })
  .superRefine((data, ctx) => {
    refineSharedOthers(data, ctx);

    if (data.investmentPropertyTypes.includes('other') && !data.investmentPropertyTypeOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['investmentPropertyTypeOther'],
        message: 'Required when investmentPropertyTypes includes other',
      });
    }

    const needsArea = data.investmentPropertyTypes.some((type) =>
      (INVESTMENT_TYPES_REQUIRING_AREA as readonly string[]).includes(type),
    );
    if (needsArea && !data.areaSqm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['areaSqm'],
        message: 'Required for apartment, apart-hotel, office, or commercial property',
      });
    }

    const needsCountry =
      data.priorInvestmentExperience === 'yes_abroad' ||
      data.priorInvestmentExperience === 'yes_both';
    if (needsCountry && !data.priorInvestmentExperienceOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['priorInvestmentExperienceOther'],
        message: 'Required when prior investment includes abroad',
      });
    }
  });

export const spyurkMarketResearchAnswersSchema = z
  .object({
    ...sharedAnswers,
    visitPurpose: z.literal('market_research'),
    marketInterests: uniqueEnumArray(MARKET_INTERESTS, MARKET_INTERESTS_MAX),
    researchGoal: z.enum(SPYURK_RESEARCH_GOALS),
    propertyCountry: propertyCountrySchema,
    purchaseHorizon: z.enum(PURCHASE_HORIZONS),
    armeniaVisitTiming: z.enum(ARMENIA_VISIT_TIMINGS),
  })
  .superRefine((data, ctx) => {
    refineSharedOthers(data, ctx);
  });

export const spyurkQuestionnaireAnswersSchema: z.ZodType<SpyurkQuestionnaireAnswers> = z.union([
  spyurkOwnResidenceAnswersSchema,
  spyurkInvestmentAnswersSchema,
  spyurkMarketResearchAnswersSchema,
]);

export type ParsedSpyurkQuestionnaireAnswers = z.infer<typeof spyurkQuestionnaireAnswersSchema>;
