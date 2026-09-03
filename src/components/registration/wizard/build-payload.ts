import { FORM_VERSION, questionnaireAnswersSchema } from '@/lib/questionnaire';
import type {
  LocationChoice,
  QuestionnaireAnswers,
  ResearchLocation,
  ResidencePlace,
} from '@/lib/questionnaire/types';
import { PRIVACY_POLICY_VERSION } from '@/lib/privacy';
import type { Locale } from '@/types/locale';
import type { WizardState } from './types';

function buildResidence(state: WizardState): ResidencePlace | null {
  if (state.residenceScope === 'yerevan' && state.residenceDistrict) {
    return { scope: 'yerevan', district: state.residenceDistrict };
  }

  if (state.residenceScope === 'marz' && state.residenceRegion) {
    return { scope: 'marz', region: state.residenceRegion };
  }

  if (state.residenceScope === 'abroad' && state.residenceCountry.trim()) {
    return { scope: 'abroad', country: state.residenceCountry.trim() };
  }

  return null;
}

function buildLocationChoice(state: WizardState): LocationChoice {
  return {
    yerevanDistricts: state.yerevanDistricts,
    marzRegions: state.marzRegions,
    abroadCountries: state.locationSeekAbroadCountries,
    abroadCountriesOther: state.locationSeekAbroadOther.trim() || undefined,
  };
}

function buildResearchLocation(state: WizardState): ResearchLocation {
  const undecided = state.researchScopes.includes('undecided');

  return {
    undecided,
    yerevanDistricts: undecided ? [] : state.yerevanDistricts,
    marzRegions: undecided ? [] : state.marzRegions,
    abroadCountry: undecided ? undefined : state.researchAbroadCountry.trim() || undefined,
  };
}

/** Builds questionnaire answers from wizard state. Returns null when incomplete. */
export function buildQuestionnaireAnswers(state: WizardState): QuestionnaireAnswers | null {
  const residence = buildResidence(state);

  if (!state.ageBand || !state.visitPurpose || state.newsletter === null || !residence) {
    return null;
  }

  const shared = {
    ageBand: state.ageBand,
    residence,
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

    const answers = {
      ...shared,
      visitPurpose: 'own_residence' as const,
      interestType: state.interestType,
      abroadCountries: state.interestType === 'abroad' ? state.abroadCountries : undefined,
      abroadCountriesOther:
        state.interestType === 'abroad' ? state.abroadCountriesOther.trim() || undefined : undefined,
      locationSeek: buildLocationChoice(state),
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
      !state.investmentGoal ||
      !state.areaSqm ||
      !state.purchaseMethod ||
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
      locationSeek: buildLocationChoice(state),
      investmentGoal: state.investmentGoal,
      areaSqm: state.areaSqm,
      purchaseMethod: state.purchaseMethod,
      investmentTimeline: state.investmentTimeline,
      investmentBudgetUsd: state.investmentBudgetUsd,
      priorInvestmentExperience: state.priorInvestmentExperience,
      priorInvestmentExperienceOther: state.priorInvestmentExperienceOther.trim() || undefined,
    };

    const parsed = questionnaireAnswersSchema.safeParse(answers);
    return parsed.success ? parsed.data : null;
  }

  if (!state.researchGoal || !state.purchaseHorizon || state.marketInterests.length === 0) {
    return null;
  }

  const answers = {
    ...shared,
    visitPurpose: 'market_research' as const,
    marketInterests: state.marketInterests,
    researchGoal: state.researchGoal,
    researchLocation: buildResearchLocation(state),
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
