import { MOOTQ_FIELD } from '@/lib/integrations/mootq/mootq-field-ids';
import type { MootqAnswers } from '@/lib/integrations/mootq/flatten-answers';
import {
  getQuestionnaireLabel,
  questionnaireI18n,
  type QuestionnaireLocale,
} from '@/lib/questionnaire/i18n';
import { isSpyurkFormVersion } from '@/lib/questionnaire/form-channel';
import { spyurkQuestionnaireAnswersSchema } from '@/lib/questionnaire/spyurk/validate';
import { questionnaireAnswersSchema } from '@/lib/questionnaire/validate';
import type {
  InvestmentAnswers,
  LocationChoice,
  MarketResearchAnswers,
  OwnResidenceAnswers,
  QuestionnaireAnswers,
  ResidencePlace,
} from '@/lib/questionnaire/types';
import type { SpyurkQuestionnaireAnswers } from '@/lib/questionnaire/spyurk/types';

/**
 * Mootq option catalogs are Armenian. Always resolve field_* labels in `hy`
 * so CRM select values match partner examples regardless of visitor locale.
 */
const MOOTQ_LABEL_LOCALE: QuestionnaireLocale = 'hy';

/**
 * Exact partner option strings that differ from our UI i18n (hy).
 * Keys: `${optionGroup}.${code}`.
 */
const MOOTQ_LABEL_OVERRIDES: Record<string, string> = {
  'investmentBudgetUsd.up_to_150k': 'Մինչև 150․000 ԱՄՆ դոլար',
  'priorInvestmentExperience.no_first': 'Ոչ. սա կլինի առաջին ներդրումս',
  'decisionStage.ready_1_month': 'Պատրաստ եմ գործարք իրականացնել մոտ ժամանակում',
};

export type BuildMootqPartnerAnswersInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  locale: QuestionnaireLocale;
  formVersion?: string | null;
  answers: unknown;
};

/**
 * Build Mootq CRM `answers` object: identity + localized field_* values.
 */
export function buildMootqPartnerAnswers(input: BuildMootqPartnerAnswersInput): MootqAnswers {
  const out: MootqAnswers = {
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone,
  };

  if (isSpyurkFormVersion(input.formVersion) || looksLikeSpyurk(input.answers)) {
    const parsed = spyurkQuestionnaireAnswersSchema.safeParse(input.answers);
    if (parsed.success) {
      assignSpyurkMappedFields(out, parsed.data);
    }
    return out;
  }

  const parsed = questionnaireAnswersSchema.safeParse(input.answers);
  if (!parsed.success) {
    return out;
  }

  assignGeneralMappedFields(out, parsed.data);
  return out;
}

function looksLikeSpyurk(answers: unknown): boolean {
  if (!answers || typeof answers !== 'object' || !('residence' in answers)) {
    return false;
  }
  const residence = answers.residence;
  return residence !== null && typeof residence === 'object' && 'city' in residence;
}

function assignGeneralMappedFields(out: MootqAnswers, answers: QuestionnaireAnswers): void {
  out[MOOTQ_FIELD.ageBand] = optionLabel('ageBand', answers.ageBand);
  out[MOOTQ_FIELD.residenceScope] = optionLabel('locationSeekScope', answers.residence.scope);
  assignResidenceDetail(out, answers.residence);
  out[MOOTQ_FIELD.visitPurpose] = optionLabel('visitPurpose', answers.visitPurpose);
  out[MOOTQ_FIELD.newsletter] = newsletterLabel(answers.newsletter);

  switch (answers.visitPurpose) {
    case 'market_research':
      assignMarketResearchFields(out, answers);
      return;
    case 'investment':
      assignInvestmentFields(out, answers);
      return;
    case 'own_residence':
      assignOwnResidenceFields(out, answers);
      return;
    default: {
      const exhaustive: never = answers;
      return exhaustive;
    }
  }
}

function assignSpyurkMappedFields(out: MootqAnswers, answers: SpyurkQuestionnaireAnswers): void {
  out[MOOTQ_FIELD.ageBand] = optionLabel('ageBand', answers.ageBand);
  out[MOOTQ_FIELD.residenceScope] = optionLabel('locationSeekScope', 'abroad');
  out[MOOTQ_FIELD.residenceDetail] = `${answers.residence.city}, ${answers.residence.region}`;
  out[MOOTQ_FIELD.visitPurpose] = optionLabel('visitPurpose', answers.visitPurpose);
  out[MOOTQ_FIELD.newsletter] = newsletterLabel(answers.newsletter);

  if (answers.visitPurpose === 'market_research') {
    out[MOOTQ_FIELD.marketInterests] = answers.marketInterests.map((code) =>
      optionLabel('marketInterest', code),
    );
    out[MOOTQ_FIELD.researchGoal] = optionLabel('researchGoal', answers.researchGoal);
    out[MOOTQ_FIELD.purchaseHorizon] = optionLabel('purchaseHorizon', answers.purchaseHorizon);
  }
}

function assignMarketResearchFields(out: MootqAnswers, answers: MarketResearchAnswers): void {
  out[MOOTQ_FIELD.marketInterests] = answers.marketInterests.map((code) =>
    optionLabel('marketInterest', code),
  );
  out[MOOTQ_FIELD.researchGoal] = optionLabel('researchGoal', answers.researchGoal);
  out[MOOTQ_FIELD.purchaseHorizon] = optionLabel('purchaseHorizon', answers.purchaseHorizon);
}

function assignInvestmentFields(out: MootqAnswers, answers: InvestmentAnswers): void {
  const propertyLabel =
    answers.investmentPropertyType === 'other' && answers.investmentPropertyTypeOther
      ? answers.investmentPropertyTypeOther
      : optionLabel('investmentPropertyType', answers.investmentPropertyType);
  out[MOOTQ_FIELD.investmentPropertyType] = propertyLabel;

  assignLocationSeek(
    out,
    answers.locationSeek,
    MOOTQ_FIELD.investmentLocationScope,
    MOOTQ_FIELD.investmentLocationDetails,
  );

  out[MOOTQ_FIELD.investmentGoal] = optionLabel('investmentGoal', answers.investmentGoal);
  out[MOOTQ_FIELD.investmentAreaSqm] = optionLabel('areaSqm', answers.areaSqm);
  out[MOOTQ_FIELD.investmentPurchaseMethod] = optionLabel('purchaseMethod', answers.purchaseMethod);
  out[MOOTQ_FIELD.investmentTimeline] = optionLabel(
    'investmentTimeline',
    answers.investmentTimeline,
  );
  out[MOOTQ_FIELD.investmentBudgetUsd] = optionLabel(
    'investmentBudgetUsd',
    answers.investmentBudgetUsd,
  );

  out[MOOTQ_FIELD.priorInvestmentExperience] = optionLabel(
    'priorInvestmentExperience',
    answers.priorInvestmentExperience,
  );
}

function assignOwnResidenceFields(out: MootqAnswers, answers: OwnResidenceAnswers): void {
  out[MOOTQ_FIELD.interestType] = optionLabel('interestType', answers.interestType);
  assignLocationSeek(
    out,
    answers.locationSeek,
    MOOTQ_FIELD.residenceLocationScope,
    MOOTQ_FIELD.residenceLocationDetails,
  );
  out[MOOTQ_FIELD.residenceAreaSqm] = optionLabel('areaSqm', answers.areaSqm);
  out[MOOTQ_FIELD.residencePurchaseMethod] = optionLabel('purchaseMethod', answers.purchaseMethod);
  out[MOOTQ_FIELD.monthlyBudget] = optionLabel('monthlyBudget', answers.monthlyBudget);
  out[MOOTQ_FIELD.decisionStage] = optionLabel('decisionStage', answers.decisionStage);
}

function assignLocationSeek(
  out: MootqAnswers,
  location: LocationChoice,
  scopeField: string,
  detailsField: string,
): void {
  if (location.yerevanDistricts.length > 0) {
    out[scopeField] = optionLabel('locationSeekScope', 'yerevan');
    out[detailsField] = location.yerevanDistricts.map((code) =>
      optionLabel('yerevanDistrict', code),
    );
    return;
  }
  if (location.marzRegions.length > 0) {
    out[scopeField] = optionLabel('locationSeekScope', 'marz');
    out[detailsField] = location.marzRegions.map((code) => optionLabel('marzRegion', code));
    return;
  }
  if (location.abroadCountries.length > 0) {
    out[scopeField] = optionLabel('locationSeekScope', 'abroad');
    out[detailsField] = location.abroadCountries.map((code) => optionLabel('abroadCountry', code));
    return;
  }
  if (location.abroadCountriesOther) {
    out[scopeField] = optionLabel('locationSeekScope', 'abroad');
    out[detailsField] = [location.abroadCountriesOther];
  }
}

function assignResidenceDetail(out: MootqAnswers, residence: ResidencePlace): void {
  if (residence.scope === 'abroad') {
    out[MOOTQ_FIELD.residenceDetail] = residence.country;
    return;
  }
  if (residence.scope === 'yerevan') {
    out[MOOTQ_FIELD.residenceDetail] = optionLabel('yerevanDistrict', residence.district);
    return;
  }
  out[MOOTQ_FIELD.residenceDetail] = optionLabel('marzRegion', residence.region);
}

function newsletterLabel(value: boolean): string {
  return getQuestionnaireLabel(
    value ? questionnaireI18n.options.newsletter.yes : questionnaireI18n.options.newsletter.no,
    MOOTQ_LABEL_LOCALE,
  );
}

type OptionGroupKey = keyof typeof questionnaireI18n.options;

function optionLabel(group: OptionGroupKey, value: string): string {
  const override = MOOTQ_LABEL_OVERRIDES[`${group}.${value}`];
  if (override) {
    return override;
  }
  const options = questionnaireI18n.options[group] as Record<
    string,
    { hy: string; en: string; ru: string }
  >;
  const localized = options[value];
  if (!localized) {
    return value;
  }
  return getQuestionnaireLabel(localized, MOOTQ_LABEL_LOCALE);
}
