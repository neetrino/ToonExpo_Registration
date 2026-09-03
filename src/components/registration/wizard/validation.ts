import { z } from 'zod';
import {
  ABROAD_COUNTRIES,
  AGE_BANDS,
  AREA_SQM_BANDS,
  DECISION_STAGES,
  INVESTMENT_BUDGETS_USD,
  INVESTMENT_GOALS,
  INVESTMENT_PROPERTY_TYPES,
  INVESTMENT_TIMELINES,
  INTEREST_TYPES,
  LOCATION_SEEK_SCOPES,
  MARKET_INTERESTS,
  MARZ_REGIONS,
  MONTHLY_BUDGETS,
  OTHER_TEXT_MAX_LENGTH,
  PRIOR_INVESTMENT_EXPERIENCES,
  PURCHASE_METHODS,
  RESEARCH_GOALS,
  VISIT_PURPOSES,
  YEREVAN_DISTRICTS,
} from '@/lib/questionnaire';
import { LOCATION_CHOICE_MAX, MARKET_INTERESTS_MAX } from '@/lib/questionnaire/constants';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import { normalizePhone } from '@/lib/validation/phone';
import { resolvePhoneCountry } from '@/lib/validation/phone-countries';
import { locationChoiceStepSchema, researchLocationStepSchema } from './location-validation';
import type { WizardFieldErrors, WizardState, WizardStepId } from './types';

type ErrorTranslator = {
  required: string;
  invalidEmail: string;
  invalidPhone: string;
  consentRequired: string;
  validation: string;
  maxSelections: (max: number) => string;
};

const identityStepSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(1).max(64),
    phoneCountry: z.string().min(2).max(2),
  })
  .superRefine((data, ctx) => {
    if (!normalizePhone(data.phone, resolvePhoneCountry(data.phoneCountry))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'invalidPhone',
      });
    }
  });

const otherTextSchema = z.string().trim().min(1).max(OTHER_TEXT_MAX_LENGTH);

const profileStepSchema = z
  .object({
    ageBand: z.enum(AGE_BANDS),
    visitPurpose: z.enum(VISIT_PURPOSES),
    residenceScope: z.enum(LOCATION_SEEK_SCOPES),
    residenceDistrict: z.enum(YEREVAN_DISTRICTS).or(z.literal('')),
    residenceRegion: z.enum(MARZ_REGIONS).or(z.literal('')),
    residenceCountry: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.residenceScope === 'yerevan' && !data.residenceDistrict) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['residenceDistrict'], message: 'required' });
    }

    if (data.residenceScope === 'marz' && !data.residenceRegion) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['residenceRegion'], message: 'required' });
    }

    if (data.residenceScope === 'abroad') {
      const other = otherTextSchema.safeParse(data.residenceCountry);
      if (!other.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['residenceCountry'],
          message: 'required',
        });
      }
    }
  });

const ownResidenceInterestSchema = z
  .object({
    interestType: z.enum(INTEREST_TYPES),
    abroadCountries: z.array(z.enum(ABROAD_COUNTRIES)),
    abroadCountriesOther: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.interestType !== 'abroad') {
      return;
    }

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
  });

const ownResidenceLocationSchema = locationChoiceStepSchema;

const ownResidenceSizeSchema = z.object({
  areaSqm: z.enum(AREA_SQM_BANDS),
  purchaseMethod: z.enum(PURCHASE_METHODS),
});

const ownResidenceBudgetSchema = z.object({
  monthlyBudget: z.enum(MONTHLY_BUDGETS),
  decisionStage: z.enum(DECISION_STAGES),
});

const investmentTypeSchema = z
  .object({
    investmentPropertyType: z.enum(INVESTMENT_PROPERTY_TYPES),
    investmentPropertyTypeOther: z.string(),
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
  });

const investmentLocationSchema = locationChoiceStepSchema;

const investmentSizeSchema = z.object({
  areaSqm: z.enum(AREA_SQM_BANDS),
  purchaseMethod: z.enum(PURCHASE_METHODS),
});

const investmentGoalSchema = z.object({
  investmentGoal: z.enum(INVESTMENT_GOALS),
  investmentTimeline: z.enum(INVESTMENT_TIMELINES),
});

const investmentBudgetSchema = z
  .object({
    investmentBudgetUsd: z.enum(INVESTMENT_BUDGETS_USD),
    priorInvestmentExperience: z.enum(PRIOR_INVESTMENT_EXPERIENCES),
    priorInvestmentExperienceOther: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.priorInvestmentExperience === 'yes_abroad') {
      const other = otherTextSchema.safeParse(data.priorInvestmentExperienceOther);
      if (!other.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['priorInvestmentExperienceOther'],
          message: 'required',
        });
      }
    }
  });

const marketResearchFocusSchema = z.object({
  marketInterests: z
    .array(z.enum(MARKET_INTERESTS))
    .min(1)
    .max(MARKET_INTERESTS_MAX)
    .refine((values) => new Set(values).size === values.length, {
      message: 'unique',
    }),
  researchGoal: z.enum(RESEARCH_GOALS),
});

const marketResearchWhereSchema = researchLocationStepSchema;

const finishStepSchema = z.object({
  newsletter: z.boolean(),
  privacyConsent: z.literal(true),
});

function mapIssueMessage(issue: z.ZodIssue, t: ErrorTranslator): string {
  if (issue.path[0] === 'privacyConsent') {
    return t.consentRequired;
  }

  if (issue.code === 'invalid_string' && 'validation' in issue && issue.validation === 'email') {
    return t.invalidEmail;
  }

  if (issue.path[0] === 'phone' || issue.message === 'invalidPhone') {
    return t.invalidPhone;
  }

  if (issue.message === 'unique') {
    return t.validation;
  }

  if (issue.message === 'max') {
    return t.maxSelections(LOCATION_CHOICE_MAX);
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

function pickState(stepId: WizardStepId, state: WizardState): Record<string, unknown> {
  switch (stepId) {
    case 'identity':
      return {
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        phone: state.phone,
        phoneCountry: state.phoneCountry,
      };
    case 'profile':
      return {
        ageBand: state.ageBand || undefined,
        visitPurpose: state.visitPurpose || undefined,
        residenceScope: state.residenceScope || undefined,
        residenceDistrict: state.residenceDistrict,
        residenceRegion: state.residenceRegion,
        residenceCountry: state.residenceCountry,
      };
    case 'own-residence-interest':
      return {
        interestType: state.interestType || undefined,
        abroadCountries: state.abroadCountries,
        abroadCountriesOther: state.abroadCountriesOther,
      };
    case 'own-residence-location':
    case 'investment-location':
      return {
        locationSeekScopes: state.locationSeekScopes,
        locationSeekAbroadCountries: state.locationSeekAbroadCountries,
        locationSeekAbroadOther: state.locationSeekAbroadOther,
        yerevanDistricts: state.yerevanDistricts,
        marzRegions: state.marzRegions,
      };
    case 'own-residence-size':
      return {
        areaSqm: state.areaSqm || undefined,
        purchaseMethod: state.purchaseMethod || undefined,
      };
    case 'own-residence-budget':
      return {
        monthlyBudget: state.monthlyBudget || undefined,
        decisionStage: state.decisionStage || undefined,
      };
    case 'investment-type':
      return {
        investmentPropertyType: state.investmentPropertyType || undefined,
        investmentPropertyTypeOther: state.investmentPropertyTypeOther,
      };
    case 'investment-size':
      return {
        areaSqm: state.areaSqm || undefined,
        purchaseMethod: state.purchaseMethod || undefined,
      };
    case 'investment-goal':
      return {
        investmentGoal: state.investmentGoal || undefined,
        investmentTimeline: state.investmentTimeline || undefined,
      };
    case 'investment-budget':
      return {
        investmentBudgetUsd: state.investmentBudgetUsd || undefined,
        priorInvestmentExperience: state.priorInvestmentExperience || undefined,
        priorInvestmentExperienceOther: state.priorInvestmentExperienceOther,
      };
    case 'market-research-focus':
      return {
        marketInterests: state.marketInterests,
        researchGoal: state.researchGoal || undefined,
      };
    case 'market-research-where':
      return {
        researchScopes: state.researchScopes,
        yerevanDistricts: state.yerevanDistricts,
        marzRegions: state.marzRegions,
        researchAbroadCountry: state.researchAbroadCountry,
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
    case 'own-residence-location':
      result = ownResidenceLocationSchema.safeParse(data);
      break;
    case 'own-residence-size':
      result = ownResidenceSizeSchema.safeParse(data);
      break;
    case 'own-residence-budget':
      result = ownResidenceBudgetSchema.safeParse(data);
      break;
    case 'investment-type':
      result = investmentTypeSchema.safeParse(data);
      break;
    case 'investment-location':
      result = investmentLocationSchema.safeParse(data);
      break;
    case 'investment-goal':
      result = investmentGoalSchema.safeParse(data);
      break;
    case 'investment-size':
      result = investmentSizeSchema.safeParse(data);
      break;
    case 'investment-budget':
      result = investmentBudgetSchema.safeParse(data);
      break;
    case 'market-research-focus':
      result = marketResearchFocusSchema.safeParse(data);
      break;
    case 'market-research-where':
      result = marketResearchWhereSchema.safeParse(data);
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
