import { z } from 'zod';
import { MARKET_INTERESTS_MAX } from '@/lib/questionnaire/constants';
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
  VISIT_PURPOSES,
} from '@/lib/questionnaire/options';
import {
  SPYURK_MULTI_SELECT_MAX,
  SPYURK_RESIDENCE_TEXT_MAX_LENGTH,
} from '@/lib/questionnaire/spyurk/constants';
import {
  ARMENIA_CONNECTIONS,
  ARMENIA_VISIT_TIMINGS,
  INVESTMENT_TYPES_REQUIRING_AREA,
  PROPERTY_COUNTRY_SCOPES,
  PURCHASE_BUDGETS_USD,
  PURCHASE_MOTIVES,
  SPYURK_INTEREST_TYPES,
  SPYURK_INVESTMENT_GOALS,
  SPYURK_RESEARCH_GOALS,
} from '@/lib/questionnaire/spyurk/options';
import { normalizePhone } from '@/lib/validation/phone';
import { resolvePhoneCountry } from '@/lib/validation/phone-countries';
import type { SpyurkWizardFieldErrors, SpyurkWizardState, SpyurkWizardStepId } from './types';

type ErrorTranslator = {
  required: string;
  invalidEmail: string;
  invalidPhone: string;
  consentRequired: string;
  validation: string;
  maxSelections: (max: number) => string;
};

const residenceTextSchema = z.string().trim().min(1).max(SPYURK_RESIDENCE_TEXT_MAX_LENGTH);

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

const profileStepSchema = z.object({
  ageBand: z.enum(AGE_BANDS),
  residenceCity: residenceTextSchema,
  residenceRegion: residenceTextSchema,
});

const backgroundStepSchema = z
  .object({
    armeniaConnection: z.enum(ARMENIA_CONNECTIONS),
    armeniaConnectionOther: z.string(),
    purchaseMotives: z.array(z.enum(PURCHASE_MOTIVES)).min(1).max(SPYURK_MULTI_SELECT_MAX),
    purchaseMotivesOther: z.string(),
    visitPurpose: z.enum(VISIT_PURPOSES),
  })
  .superRefine((data, ctx) => {
    if (data.armeniaConnection === 'other' && !data.armeniaConnectionOther.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['armeniaConnectionOther'],
        message: 'required',
      });
    }
    if (data.purchaseMotives.includes('other') && !data.purchaseMotivesOther.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['purchaseMotivesOther'],
        message: 'required',
      });
    }
  });

const propertyCountryFields = {
  propertyCountryScope: z.enum(PROPERTY_COUNTRY_SCOPES),
  propertyCountryOther: z.string(),
};

function refinePropertyCountry(
  data: { propertyCountryScope: string; propertyCountryOther: string },
  ctx: z.RefinementCtx,
): void {
  if (data.propertyCountryScope === 'other' && !data.propertyCountryOther.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['propertyCountryOther'],
      message: 'required',
    });
  }
}

const ownInterestSchema = z
  .object({
    interestTypes: z.array(z.enum(SPYURK_INTEREST_TYPES)).min(1).max(SPYURK_MULTI_SELECT_MAX),
    interestTypesOther: z.string(),
    ...propertyCountryFields,
  })
  .superRefine((data, ctx) => {
    if (data.interestTypes.includes('other') && !data.interestTypesOther.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['interestTypesOther'],
        message: 'required',
      });
    }
    refinePropertyCountry(data, ctx);
  });

const ownDetailsSchema = z.object({
  areaSqm: z.enum(AREA_SQM_BANDS),
  purchaseMethod: z.enum(PURCHASE_METHODS),
  purchaseBudgetUsd: z.enum(PURCHASE_BUDGETS_USD),
  decisionStage: z.enum(DECISION_STAGES),
});

const followupSchema = z.object({
  armeniaVisitTiming: z.enum(ARMENIA_VISIT_TIMINGS),
  newsletter: z.boolean(),
});

const investmentTypeSchema = z
  .object({
    investmentPropertyTypes: z
      .array(z.enum(INVESTMENT_PROPERTY_TYPES))
      .min(1)
      .max(SPYURK_MULTI_SELECT_MAX),
    investmentPropertyTypeOther: z.string(),
    ...propertyCountryFields,
  })
  .superRefine((data, ctx) => {
    if (data.investmentPropertyTypes.includes('other') && !data.investmentPropertyTypeOther.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['investmentPropertyTypeOther'],
        message: 'required',
      });
    }
    refinePropertyCountry(data, ctx);
  });

const investmentGoalSchema = z.object({
  investmentGoal: z.enum(SPYURK_INVESTMENT_GOALS),
});

const investmentDetailsSchema = z
  .object({
    investmentPropertyTypes: z.array(z.enum(INVESTMENT_PROPERTY_TYPES)),
    areaSqm: z.enum(AREA_SQM_BANDS).or(z.literal('')),
    purchaseMethod: z.enum(PURCHASE_METHODS),
    investmentTimeline: z.enum(INVESTMENT_TIMELINES),
    investmentBudgetUsd: z.enum(INVESTMENT_BUDGETS_USD),
  })
  .superRefine((data, ctx) => {
    const needsArea = data.investmentPropertyTypes.some((type) =>
      (INVESTMENT_TYPES_REQUIRING_AREA as readonly string[]).includes(type),
    );
    if (needsArea && !data.areaSqm) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['areaSqm'], message: 'required' });
    }
  });

const investmentFollowupSchema = z
  .object({
    priorInvestmentExperience: z.enum(PRIOR_INVESTMENT_EXPERIENCES),
    priorInvestmentExperienceOther: z.string(),
    armeniaVisitTiming: z.enum(ARMENIA_VISIT_TIMINGS),
    newsletter: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const needsCountry =
      data.priorInvestmentExperience === 'yes_abroad' ||
      data.priorInvestmentExperience === 'yes_both';
    if (needsCountry && !data.priorInvestmentExperienceOther.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['priorInvestmentExperienceOther'],
        message: 'required',
      });
    }
  });

const researchFocusSchema = z.object({
  marketInterests: z.array(z.enum(MARKET_INTERESTS)).min(1).max(MARKET_INTERESTS_MAX),
  researchGoal: z.enum(SPYURK_RESEARCH_GOALS),
});

const researchFollowupSchema = z
  .object({
    ...propertyCountryFields,
    purchaseHorizon: z.enum(PURCHASE_HORIZONS),
    armeniaVisitTiming: z.enum(ARMENIA_VISIT_TIMINGS),
    newsletter: z.boolean(),
  })
  .superRefine(refinePropertyCountry);

const finishSchema = z.object({
  privacyConsent: z.literal(true),
});

function pickState(stepId: SpyurkWizardStepId, state: SpyurkWizardState): Record<string, unknown> {
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
        residenceCity: state.residenceCity,
        residenceRegion: state.residenceRegion,
      };
    case 'background':
      return {
        armeniaConnection: state.armeniaConnection || undefined,
        armeniaConnectionOther: state.armeniaConnectionOther,
        purchaseMotives: state.purchaseMotives,
        purchaseMotivesOther: state.purchaseMotivesOther,
        visitPurpose: state.visitPurpose || undefined,
      };
    case 'own-interest':
      return {
        interestTypes: state.interestTypes,
        interestTypesOther: state.interestTypesOther,
        propertyCountryScope: state.propertyCountryScope || undefined,
        propertyCountryOther: state.propertyCountryOther,
      };
    case 'own-details':
      return {
        areaSqm: state.areaSqm || undefined,
        purchaseMethod: state.purchaseMethod || undefined,
        purchaseBudgetUsd: state.purchaseBudgetUsd || undefined,
        decisionStage: state.decisionStage || undefined,
      };
    case 'own-followup':
      return {
        armeniaVisitTiming: state.armeniaVisitTiming || undefined,
        newsletter: state.newsletter,
      };
    case 'investment-type':
      return {
        investmentPropertyTypes: state.investmentPropertyTypes,
        investmentPropertyTypeOther: state.investmentPropertyTypeOther,
        propertyCountryScope: state.propertyCountryScope || undefined,
        propertyCountryOther: state.propertyCountryOther,
      };
    case 'investment-goal':
      return { investmentGoal: state.investmentGoal || undefined };
    case 'investment-details':
      return {
        investmentPropertyTypes: state.investmentPropertyTypes,
        areaSqm: state.areaSqm,
        purchaseMethod: state.purchaseMethod || undefined,
        investmentTimeline: state.investmentTimeline || undefined,
        investmentBudgetUsd: state.investmentBudgetUsd || undefined,
      };
    case 'investment-followup':
      return {
        priorInvestmentExperience: state.priorInvestmentExperience || undefined,
        priorInvestmentExperienceOther: state.priorInvestmentExperienceOther,
        armeniaVisitTiming: state.armeniaVisitTiming || undefined,
        newsletter: state.newsletter,
      };
    case 'research-focus':
      return {
        marketInterests: state.marketInterests,
        researchGoal: state.researchGoal || undefined,
      };
    case 'research-followup':
      return {
        propertyCountryScope: state.propertyCountryScope || undefined,
        propertyCountryOther: state.propertyCountryOther,
        purchaseHorizon: state.purchaseHorizon || undefined,
        armeniaVisitTiming: state.armeniaVisitTiming || undefined,
        newsletter: state.newsletter,
      };
    case 'finish':
      return { privacyConsent: state.privacyConsent || undefined };
    default: {
      const exhaustive: never = stepId;
      return exhaustive;
    }
  }
}

function schemaForStep(stepId: SpyurkWizardStepId): z.ZodType<unknown> {
  switch (stepId) {
    case 'identity':
      return identityStepSchema;
    case 'profile':
      return profileStepSchema;
    case 'background':
      return backgroundStepSchema;
    case 'own-interest':
      return ownInterestSchema;
    case 'own-details':
      return ownDetailsSchema;
    case 'own-followup':
      return followupSchema;
    case 'investment-type':
      return investmentTypeSchema;
    case 'investment-goal':
      return investmentGoalSchema;
    case 'investment-details':
      return investmentDetailsSchema;
    case 'investment-followup':
      return investmentFollowupSchema;
    case 'research-focus':
      return researchFocusSchema;
    case 'research-followup':
      return researchFollowupSchema;
    case 'finish':
      return finishSchema;
    default: {
      const exhaustive: never = stepId;
      return exhaustive;
    }
  }
}

function mapIssueMessage(issue: z.ZodIssue, t: ErrorTranslator): string {
  if (issue.message === 'invalidPhone') {
    return t.invalidPhone;
  }
  if (issue.path[0] === 'email' && issue.code === z.ZodIssueCode.invalid_string) {
    return t.invalidEmail;
  }
  if (issue.path[0] === 'privacyConsent') {
    return t.consentRequired;
  }
  if (issue.message === 'required' || issue.code === z.ZodIssueCode.too_small) {
    return t.required;
  }
  return t.validation;
}

function issuesToFieldErrors(issues: z.ZodIssue[], t: ErrorTranslator): SpyurkWizardFieldErrors {
  const errors: SpyurkWizardFieldErrors = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !errors[field]) {
      errors[field] = mapIssueMessage(issue, t);
    }
  }
  return errors;
}

export function validateSpyurkWizardStep(
  stepId: SpyurkWizardStepId,
  state: SpyurkWizardState,
  t: ErrorTranslator,
): SpyurkWizardFieldErrors {
  const parsed = schemaForStep(stepId).safeParse(pickState(stepId, state));
  if (parsed.success) {
    return {};
  }
  return issuesToFieldErrors(parsed.error.issues, t);
}

export function isSpyurkWizardStepValid(
  stepId: SpyurkWizardStepId,
  state: SpyurkWizardState,
  t: ErrorTranslator,
): boolean {
  return Object.keys(validateSpyurkWizardStep(stepId, state, t)).length === 0;
}
