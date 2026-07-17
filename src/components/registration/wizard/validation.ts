import { z } from 'zod';
import { QUESTIONNAIRE_DEFINITION } from '@/lib/questionnaire/definition';
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
  INTEREST_TYPES,
  LOCATION_SEEK_SCOPES,
  MARKET_INTERESTS,
  MARZ_REGIONS,
  MONTHLY_BUDGETS,
  PRIOR_INVESTMENT_EXPERIENCES,
  PURCHASE_HORIZONS,
  PURCHASE_METHODS,
  RESEARCH_GOALS,
  VISIT_PURPOSES,
  YEREVAN_DISTRICTS,
} from '@/lib/questionnaire';
import { MARKET_INTERESTS_MAX, OTHER_TEXT_MAX_LENGTH } from '@/lib/questionnaire/constants';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import type { WizardFieldErrors, WizardState, WizardStepId } from './types';

type ErrorTranslator = {
  required: string;
  invalidEmail: string;
  invalidPhone: string;
  consentRequired: string;
  validation: string;
  maxSelections: (max: number) => string;
};

const identityStepSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(5).max(20),
});

const profileStepSchema = z.object({
  ageBand: z.enum(AGE_BANDS),
  visitPurpose: z.enum(VISIT_PURPOSES),
});

const otherTextSchema = z.string().trim().min(1).max(OTHER_TEXT_MAX_LENGTH);

const ownResidenceInterestSchema = z
  .object({
    interestType: z.enum(INTEREST_TYPES),
    abroadCountries: z.array(z.enum(ABROAD_COUNTRIES)),
    abroadCountriesOther: z.string(),
    locationSeekScope: z.enum(LOCATION_SEEK_SCOPES).or(z.literal('')),
    yerevanDistricts: z.array(z.enum(YEREVAN_DISTRICTS)),
    marzRegions: z.array(z.enum(MARZ_REGIONS)),
  })
  .superRefine((data, ctx) => {
    if (data.interestType === 'abroad') {
      if (data.abroadCountries.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['abroadCountries'], message: 'required' });
      }

      if (data.abroadCountries.includes('other')) {
        const other = otherTextSchema.safeParse(data.abroadCountriesOther);
        if (!other.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['abroadCountriesOther'],
            message: 'required',
          });
        }
      }

      return;
    }

    const needsLocationSeek = QUESTIONNAIRE_DEFINITION.branches.own_residence.interestType.locationSeekFor.includes(
      data.interestType,
    );

    if (!needsLocationSeek) {
      return;
    }

    if (!data.locationSeekScope) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['locationSeekScope'], message: 'required' });
      return;
    }

    if (data.locationSeekScope === 'yerevan' && data.yerevanDistricts.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['yerevanDistricts'], message: 'required' });
    }

    if (data.locationSeekScope === 'marz' && data.marzRegions.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['marzRegions'], message: 'required' });
    }
  });

const ownResidenceDetailsSchema = z.object({
  areaSqm: z.enum(AREA_SQM_BANDS),
  purchaseMethod: z.enum(PURCHASE_METHODS),
  monthlyBudget: z.enum(MONTHLY_BUDGETS),
  decisionStage: z.enum(DECISION_STAGES),
});

const investmentStepSchema = z
  .object({
    investmentPropertyType: z.enum(INVESTMENT_PROPERTY_TYPES),
    investmentPropertyTypeOther: z.string(),
    investmentMarket: z.enum(INVESTMENT_MARKETS),
    investmentMarketOther: z.string(),
    investmentGoal: z.enum(INVESTMENT_GOALS),
    investmentTimeline: z.enum(INVESTMENT_TIMELINES),
    investmentBudgetUsd: z.enum(INVESTMENT_BUDGETS_USD),
    priorInvestmentExperience: z.enum(PRIOR_INVESTMENT_EXPERIENCES),
  })
  .superRefine((data, ctx) => {
    if (data.investmentPropertyType === 'other') {
      const other = otherTextSchema.safeParse(data.investmentPropertyTypeOther);
      if (!other.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['investmentPropertyTypeOther'],
          message: 'required',
        });
      }
    }

    if (data.investmentMarket === 'other') {
      const other = otherTextSchema.safeParse(data.investmentMarketOther);
      if (!other.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['investmentMarketOther'],
          message: 'required',
        });
      }
    }
  });

const marketResearchStepSchema = z
  .object({
    marketInterests: z
      .array(z.enum(MARKET_INTERESTS))
      .min(1)
      .max(MARKET_INTERESTS_MAX)
      .refine((values) => new Set(values).size === values.length, {
        message: 'unique',
      }),
    researchGoal: z.enum(RESEARCH_GOALS),
    interestedWhere: z.enum(INTERESTED_WHERE_OPTIONS),
    interestedWhereOther: z.string(),
    purchaseHorizon: z.enum(PURCHASE_HORIZONS),
  })
  .superRefine((data, ctx) => {
    if (data.interestedWhere === 'abroad') {
      const other = otherTextSchema.safeParse(data.interestedWhereOther);
      if (!other.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['interestedWhereOther'],
          message: 'required',
        });
      }
    }
  });

const finishStepSchema = z.object({
  newsletter: z.boolean(),
  privacyConsent: z.literal(true),
});

function mapIssueMessage(issue: z.ZodIssue, t: ErrorTranslator): string {
  if (issue.path[0] === 'privacyConsent') {
    return t.consentRequired;
  }

  if (
    issue.code === 'invalid_string' &&
    'validation' in issue &&
    issue.validation === 'email'
  ) {
    return t.invalidEmail;
  }

  if (issue.path[0] === 'phone') {
    return t.invalidPhone;
  }

  if (issue.message === 'unique') {
    return t.validation;
  }

  if (issue.message === 'required' || issue.code === 'too_small' || issue.code === 'invalid_type') {
    return t.required;
  }

  return t.validation;
}

function issuesToFieldErrors(issues: z.ZodIssue[], t: ErrorTranslator): WizardFieldErrors {
  const errors: WizardFieldErrors = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !errors[field]) {
      errors[field] = mapIssueMessage(issue, t);
    }
  }

  return errors;
}

function pickState<T extends WizardStepId>(
  stepId: T,
  state: WizardState,
): Record<string, unknown> {
  switch (stepId) {
    case 'identity':
      return {
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        phone: state.phone,
      };
    case 'profile':
      return {
        ageBand: state.ageBand || undefined,
        visitPurpose: state.visitPurpose || undefined,
      };
    case 'own-residence-interest':
      return {
        interestType: state.interestType || undefined,
        abroadCountries: state.abroadCountries,
        abroadCountriesOther: state.abroadCountriesOther,
        locationSeekScope: state.locationSeekScope,
        yerevanDistricts: state.yerevanDistricts,
        marzRegions: state.marzRegions,
      };
    case 'own-residence-details':
      return {
        areaSqm: state.areaSqm || undefined,
        purchaseMethod: state.purchaseMethod || undefined,
        monthlyBudget: state.monthlyBudget || undefined,
        decisionStage: state.decisionStage || undefined,
      };
    case 'investment':
      return {
        investmentPropertyType: state.investmentPropertyType || undefined,
        investmentPropertyTypeOther: state.investmentPropertyTypeOther,
        investmentMarket: state.investmentMarket || undefined,
        investmentMarketOther: state.investmentMarketOther,
        investmentGoal: state.investmentGoal || undefined,
        investmentTimeline: state.investmentTimeline || undefined,
        investmentBudgetUsd: state.investmentBudgetUsd || undefined,
        priorInvestmentExperience: state.priorInvestmentExperience || undefined,
      };
    case 'market-research':
      return {
        marketInterests: state.marketInterests,
        researchGoal: state.researchGoal || undefined,
        interestedWhere: state.interestedWhere || undefined,
        interestedWhereOther: state.interestedWhereOther,
        purchaseHorizon: state.purchaseHorizon || undefined,
      };
    case 'finish':
      return {
        newsletter: state.newsletter ?? undefined,
        privacyConsent: state.privacyConsent ? true : undefined,
      };
    default:
      return {};
  }
}

/** Validates the current wizard step and returns field errors when invalid. */
export function validateWizardStep(
  stepId: WizardStepId,
  state: WizardState,
  t: ErrorTranslator,
): WizardFieldErrors {
  const data = pickState(stepId, state);

  let result: z.SafeParseReturnType<unknown, unknown>;

  switch (stepId) {
    case 'identity':
      result = identityStepSchema.safeParse(data);
      break;
    case 'profile':
      result = profileStepSchema.safeParse(data);
      break;
    case 'own-residence-interest':
      result = ownResidenceInterestSchema.safeParse(data);
      break;
    case 'own-residence-details':
      result = ownResidenceDetailsSchema.safeParse(data);
      break;
    case 'investment':
      result = investmentStepSchema.safeParse(data);
      break;
    case 'market-research':
      result = marketResearchStepSchema.safeParse(data);
      break;
    case 'finish':
      result = finishStepSchema.safeParse(data);
      break;
    default:
      return {};
  }

  if (result.success) {
    return {};
  }

  return issuesToFieldErrors(result.error.issues, t);
}

/** Returns whether the current step passes validation. */
export function isWizardStepValid(
  stepId: WizardStepId,
  state: WizardState,
  t: ErrorTranslator,
): boolean {
  return Object.keys(validateWizardStep(stepId, state, t)).length === 0;
}

export type { QuestionnaireLocale };
