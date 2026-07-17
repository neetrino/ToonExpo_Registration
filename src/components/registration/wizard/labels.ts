import {
  getQuestionnaireLabel,
  questionnaireI18n,
  type QuestionnaireLocale,
} from '@/lib/questionnaire/i18n';

type QuestionKey = keyof typeof questionnaireI18n.questions;

const OPTION_GROUP_BY_FIELD = {
  ageBand: 'ageBand',
  visitPurpose: 'visitPurpose',
  interestType: 'interestType',
  abroadCountries: 'abroadCountry',
  areaSqm: 'areaSqm',
  purchaseMethod: 'purchaseMethod',
  monthlyBudget: 'monthlyBudget',
  decisionStage: 'decisionStage',
  investmentPropertyType: 'investmentPropertyType',
  investmentMarket: 'investmentMarket',
  investmentGoal: 'investmentGoal',
  investmentTimeline: 'investmentTimeline',
  investmentBudgetUsd: 'investmentBudgetUsd',
  priorInvestmentExperience: 'priorInvestmentExperience',
  marketInterests: 'marketInterest',
  researchGoal: 'researchGoal',
  interestedWhere: 'interestedWhere',
  purchaseHorizon: 'purchaseHorizon',
  locationSeekScope: 'locationSeekScope',
  yerevanDistricts: 'yerevanDistrict',
  marzRegions: 'marzRegion',
  newsletter: 'newsletter',
} as const;

type OptionGroupKey = (typeof OPTION_GROUP_BY_FIELD)[keyof typeof OPTION_GROUP_BY_FIELD];

/** Localized questionnaire question prompt. */
export function getQuestionLabel(questionKey: QuestionKey, locale: QuestionnaireLocale): string {
  return getQuestionnaireLabel(questionnaireI18n.questions[questionKey], locale);
}

/** Localized option label for a questionnaire field value. */
export function getOptionLabel(
  field: keyof typeof OPTION_GROUP_BY_FIELD,
  value: string,
  locale: QuestionnaireLocale,
): string {
  const groupKey = OPTION_GROUP_BY_FIELD[field] as OptionGroupKey;
  const group = questionnaireI18n.options[groupKey] as Record<
    string,
    { hy: string; en: string; ru: string }
  >;
  const localized = group[value];

  if (!localized) {
    return value;
  }

  return getQuestionnaireLabel(localized, locale);
}
