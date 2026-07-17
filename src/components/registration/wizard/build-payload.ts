import type { LocationSeek } from '@/lib/questionnaire/types';
import { FORM_VERSION, questionnaireAnswersSchema } from '@/lib/questionnaire';
import type { QuestionnaireAnswers } from '@/lib/questionnaire/types';
import { PRIVACY_POLICY_VERSION } from '@/lib/privacy';
import type { Locale } from '@/types/locale';
import type { WizardState } from './types';

function buildLocationSeek(state: WizardState): LocationSeek {
  if (state.locationSeekScope === 'yerevan') {
    return { scope: 'yerevan', districts: state.yerevanDistricts };
  }

  if (state.locationSeekScope === 'marz') {
    return { scope: 'marz', regions: state.marzRegions };
  }

  return { scope: 'abroad' };
}

/** Builds questionnaire answers from wizard state. Returns null when incomplete. */
export function buildQuestionnaireAnswers(state: WizardState): QuestionnaireAnswers | null {
  if (!state.ageBand || !state.visitPurpose || state.newsletter === null) {
    return null;
  }

  const shared = {
    ageBand: state.ageBand,
    visitPurpose: state.visitPurpose,
    newsletter: state.newsletter,
  };

  if (state.visitPurpose === 'own_residence') {
    if (
      !state.interestType ||
      !state.areaSqm ||
      !state.purchaseMethod ||
      !state.monthlyBudget ||
      !state.decisionStage
    ) {
      return null;
    }

    if (state.interestType === 'abroad') {
      const answers = {
        ...shared,
        visitPurpose: 'own_residence' as const,
        interestType: 'abroad' as const,
        abroadCountries: state.abroadCountries,
        abroadCountriesOther: state.abroadCountriesOther.trim() || undefined,
        areaSqm: state.areaSqm,
        purchaseMethod: state.purchaseMethod,
        monthlyBudget: state.monthlyBudget,
        decisionStage: state.decisionStage,
      };

      const parsed = questionnaireAnswersSchema.safeParse(answers);
      return parsed.success ? parsed.data : null;
    }

    if (!state.locationSeekScope) {
      return null;
    }

    const answers = {
      ...shared,
      visitPurpose: 'own_residence' as const,
      interestType: state.interestType,
      locationSeek: buildLocationSeek(state),
      areaSqm: state.areaSqm,
      purchaseMethod: state.purchaseMethod,
      monthlyBudget: state.monthlyBudget,
      decisionStage: state.decisionStage,
    };

    const parsed = questionnaireAnswersSchema.safeParse(answers);
    return parsed.success ? parsed.data : null;
  }

  if (state.visitPurpose === 'investment') {
    if (
      !state.investmentPropertyType ||
      !state.investmentMarket ||
      !state.investmentGoal ||
      !state.investmentTimeline ||
      !state.investmentBudgetUsd ||
      !state.priorInvestmentExperience
    ) {
      return null;
    }

    const answers = {
      ...shared,
      visitPurpose: 'investment' as const,
      investmentPropertyType: state.investmentPropertyType,
      investmentPropertyTypeOther: state.investmentPropertyTypeOther.trim() || undefined,
      investmentMarket: state.investmentMarket,
      investmentMarketOther: state.investmentMarketOther.trim() || undefined,
      investmentGoal: state.investmentGoal,
      investmentTimeline: state.investmentTimeline,
      investmentBudgetUsd: state.investmentBudgetUsd,
      priorInvestmentExperience: state.priorInvestmentExperience,
    };

    const parsed = questionnaireAnswersSchema.safeParse(answers);
    return parsed.success ? parsed.data : null;
  }

  if (
    !state.researchGoal ||
    !state.interestedWhere ||
    !state.purchaseHorizon ||
    state.marketInterests.length === 0
  ) {
    return null;
  }

  const answers = {
    ...shared,
    visitPurpose: 'market_research' as const,
    marketInterests: state.marketInterests,
    researchGoal: state.researchGoal,
    interestedWhere: state.interestedWhere,
    interestedWhereOther: state.interestedWhereOther.trim() || undefined,
    purchaseHorizon: state.purchaseHorizon,
  };

  const parsed = questionnaireAnswersSchema.safeParse(answers);
  return parsed.success ? parsed.data : null;
}

export type RegistrationSubmitPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCountry: WizardState['phoneCountry'];
  locale: Locale;
  privacyConsent: true;
  privacyPolicyVersion: string;
  formVersion: typeof FORM_VERSION;
  answers: QuestionnaireAnswers;
  website: string;
};

/** Builds the full API payload from wizard state. */
export function buildRegistrationPayload(
  state: WizardState,
  locale: Locale,
): RegistrationSubmitPayload | null {
  const answers = buildQuestionnaireAnswers(state);

  if (!answers || !state.privacyConsent) {
    return null;
  }

  return {
    firstName: state.firstName.trim(),
    lastName: state.lastName.trim(),
    email: state.email.trim(),
    phone: state.phone.trim(),
    phoneCountry: state.phoneCountry,
    locale,
    privacyConsent: true,
    privacyPolicyVersion: PRIVACY_POLICY_VERSION,
    formVersion: FORM_VERSION,
    answers,
    website: state.website,
  };
}
