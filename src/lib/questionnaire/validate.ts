import { assertBranchMarzCities } from '@/lib/questionnaire/marz-cities';
import { refineIncomeTaxRefund } from '@/lib/questionnaire/purchase-financing';
import { z } from 'zod';
import { MARKET_INTERESTS_MAX, OTHER_TEXT_MAX_LENGTH } from '@/lib/questionnaire/constants';
import {
  locationChoiceSchema,
  researchLocationSchema,
  residencePlaceSchema,
  storedResidencePlaceSchema,
  storedResearchLocationSchema,
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
const otherTextSchema = z.string().trim().min(1).max(OTHER_TEXT_MAX_LENGTH);

function createQuestionnaireSchemas(legacy = false) {
  const sharedAnswers = {
    ageBand: ageBandSchema,
    residence: legacy ? storedResidencePlaceSchema : residencePlaceSchema,
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
      purchaseMethod: legacy
        ? z.enum(['cash', 'mortgage', 'installment', 'mixed'])
        : z.enum(PURCHASE_METHODS),
      incomeTaxRefund: z.boolean().optional(),
      monthlyBudget: z.enum(MONTHLY_BUDGETS),
      decisionStage: z.enum(DECISION_STAGES),
    })
    .superRefine((data, ctx) => {
      refineIncomeTaxRefund(data, ctx, !legacy);
      if (!legacy)
        assertBranchMarzCities(
          data.visitPurpose,
          data.locationSeek.marzRegions,
          data.locationSeek.marzCities,
          ctx,
        );
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

  const ownResidenceAnswersSchema = ownResidenceSchema;

  const investmentAnswersSchema = z
    .object({
      ...sharedAnswers,
      visitPurpose: z.literal('investment'),
      investmentPropertyType: z.enum(INVESTMENT_PROPERTY_TYPES),
      investmentPropertyTypeOther: otherTextSchema.optional(),
      locationSeek: locationChoiceSchema,
      investmentGoal: legacy
        ? z.union([
            z.array(z.enum(INVESTMENT_GOALS)).min(1).max(4),
            z.enum([...INVESTMENT_GOALS, 'multiple']),
          ])
        : z
            .array(z.enum(INVESTMENT_GOALS))
            .min(1)
            .max(4)
            .refine((values) => new Set(values).size === values.length, {
              message: 'Values must be unique',
            }),
      areaSqm: z.enum(AREA_SQM_BANDS),
      purchaseMethod: legacy
        ? z.enum(['cash', 'mortgage', 'installment', 'mixed'])
        : z.enum(PURCHASE_METHODS),
      incomeTaxRefund: z.boolean().optional(),
      investmentTimeline: z.enum(INVESTMENT_TIMELINES),
      investmentBudgetUsd: z.enum(INVESTMENT_BUDGETS_USD),
      priorInvestmentExperience: z.enum(PRIOR_INVESTMENT_EXPERIENCES),
      priorInvestmentExperienceOther: otherTextSchema.optional(),
    })
    .superRefine((data, ctx) => {
      refineIncomeTaxRefund(data, ctx, !legacy);
      if (!legacy)
        assertBranchMarzCities(
          data.visitPurpose,
          data.locationSeek.marzRegions,
          data.locationSeek.marzCities,
          ctx,
        );
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

  const marketResearchAnswersSchema = z.object({
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
    researchLocation: legacy ? storedResearchLocationSchema : researchLocationSchema,
    purchaseHorizon: z.enum(PURCHASE_HORIZONS),
  });

  /**
   * Validates questionnaire answers for the active form version.
   * Discriminates by visitPurpose; rejects cross-branch fields via schema shape.
   */
  const questionnaireAnswersSchema: z.ZodType<QuestionnaireAnswers, z.ZodTypeDef, unknown> =
    z.union([ownResidenceAnswersSchema, investmentAnswersSchema, marketResearchAnswersSchema]);

  return {
    ownResidenceAnswersSchema,
    investmentAnswersSchema,
    marketResearchAnswersSchema,
    questionnaireAnswersSchema,
  };
}

export const {
  ownResidenceAnswersSchema,
  investmentAnswersSchema,
  marketResearchAnswersSchema,
  questionnaireAnswersSchema,
} = createQuestionnaireSchemas();
export const storedQuestionnaireAnswersSchema =
  createQuestionnaireSchemas(true).questionnaireAnswersSchema;

export type ParsedQuestionnaireAnswers = z.infer<typeof questionnaireAnswersSchema>;
