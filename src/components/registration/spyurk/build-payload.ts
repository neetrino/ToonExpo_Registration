import { SPYURK_FORM_VERSION } from '@/lib/questionnaire/spyurk/constants';
import type {
  SpyurkPropertyCountry,
  SpyurkQuestionnaireAnswers,
} from '@/lib/questionnaire/spyurk/types';
import { spyurkQuestionnaireAnswersSchema } from '@/lib/questionnaire/spyurk/validate';
import type { RegistrationSubmitPayload } from '@/components/registration/submit-registration';
import type { SpyurkWizardState } from './types';

function buildPropertyCountry(state: SpyurkWizardState): SpyurkPropertyCountry | null {
  if (state.propertyCountryScope === 'armenia') {
    return { scope: 'armenia' };
  }
  if (state.propertyCountryScope === 'other' && state.propertyCountryOther.trim()) {
    return { scope: 'other', country: state.propertyCountryOther.trim() };
  }
  return null;
}

function buildShared(state: SpyurkWizardState) {
  if (!state.ageBand || !state.armeniaConnection || state.purchaseMotives.length === 0) {
    return null;
  }

  return {
    ageBand: state.ageBand,
    residence: {
      city: state.residenceCity.trim(),
      region: state.residenceRegion.trim(),
    },
    armeniaConnection: state.armeniaConnection,
    armeniaConnectionOther: state.armeniaConnectionOther.trim() || undefined,
    purchaseMotives: state.purchaseMotives,
    purchaseMotivesOther: state.purchaseMotivesOther.trim() || undefined,
    newsletter: false,
  };
}

export function buildSpyurkQuestionnaireAnswers(
  state: SpyurkWizardState,
): SpyurkQuestionnaireAnswers | null {
  const shared = buildShared(state);
  const propertyCountry = buildPropertyCountry(state);

  if (!shared || !state.visitPurpose || !propertyCountry || !state.armeniaVisitTiming) {
    return null;
  }

  if (state.visitPurpose === 'own_residence') {
    if (
      state.interestTypes.length === 0 ||
      !state.areaSqm ||
      !state.purchaseMethod ||
      !state.purchaseBudgetUsd ||
      !state.decisionStage
    ) {
      return null;
    }

    return parseAnswers({
      ...shared,
      visitPurpose: 'own_residence',
      interestTypes: state.interestTypes,
      interestTypesOther: state.interestTypesOther.trim() || undefined,
      propertyCountry,
      areaSqm: state.areaSqm,
      purchaseMethod: state.purchaseMethod,
      purchaseBudgetUsd: state.purchaseBudgetUsd,
      decisionStage: state.decisionStage,
      armeniaVisitTiming: state.armeniaVisitTiming,
    });
  }

  if (state.visitPurpose === 'investment') {
    if (
      state.investmentPropertyTypes.length === 0 ||
      !state.investmentGoal ||
      !state.purchaseMethod ||
      !state.investmentTimeline ||
      !state.investmentBudgetUsd ||
      !state.priorInvestmentExperience
    ) {
      return null;
    }

    return parseAnswers({
      ...shared,
      visitPurpose: 'investment',
      investmentPropertyTypes: state.investmentPropertyTypes,
      investmentPropertyTypeOther: state.investmentPropertyTypeOther.trim() || undefined,
      propertyCountry,
      investmentGoal: state.investmentGoal,
      areaSqm: state.areaSqm || undefined,
      purchaseMethod: state.purchaseMethod,
      investmentTimeline: state.investmentTimeline,
      investmentBudgetUsd: state.investmentBudgetUsd,
      priorInvestmentExperience: state.priorInvestmentExperience,
      priorInvestmentExperienceOther: state.priorInvestmentExperienceOther.trim() || undefined,
      armeniaVisitTiming: state.armeniaVisitTiming,
    });
  }

  if (!state.researchGoal || !state.purchaseHorizon || state.marketInterests.length === 0) {
    return null;
  }

  return parseAnswers({
    ...shared,
    visitPurpose: 'market_research',
    marketInterests: state.marketInterests,
    researchGoal: state.researchGoal,
    propertyCountry,
    purchaseHorizon: state.purchaseHorizon,
    armeniaVisitTiming: state.armeniaVisitTiming,
  });
}

function parseAnswers(answers: unknown): SpyurkQuestionnaireAnswers | null {
  const parsed = spyurkQuestionnaireAnswersSchema.safeParse(answers);
  return parsed.success ? parsed.data : null;
}

export function buildSpyurkRegistrationPayload(
  state: SpyurkWizardState,
): RegistrationSubmitPayload | null {
  const answers = buildSpyurkQuestionnaireAnswers(state);
  if (!answers || !state.privacyConsent) {
    return null;
  }

  return {
    firstName: state.firstName.trim(),
    lastName: state.lastName.trim(),
    email: state.email.trim(),
    phone: state.phone.trim(),
    phoneCountry: state.phoneCountry,
    privacyConsent: true,
    formVersion: SPYURK_FORM_VERSION,
    answers,
    website: state.website,
  };
}
