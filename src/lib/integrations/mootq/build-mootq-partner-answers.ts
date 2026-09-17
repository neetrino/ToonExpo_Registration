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
  MarketResearchAnswers,
  QuestionnaireAnswers,
  ResidencePlace,
} from '@/lib/questionnaire/types';
import type { SpyurkQuestionnaireAnswers } from '@/lib/questionnaire/spyurk/types';

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
      assignSpyurkMappedFields(out, parsed.data, input.locale);
    }
    return out;
  }

  const parsed = questionnaireAnswersSchema.safeParse(input.answers);
  if (!parsed.success) {
    return out;
  }

  assignGeneralMappedFields(out, parsed.data, input.locale);
  return out;
}

function looksLikeSpyurk(answers: unknown): boolean {
  if (!answers || typeof answers !== 'object' || !('residence' in answers)) {
    return false;
  }
  const residence = answers.residence;
  return residence !== null && typeof residence === 'object' && 'city' in residence;
}

function assignGeneralMappedFields(
  out: MootqAnswers,
  answers: QuestionnaireAnswers,
  locale: QuestionnaireLocale,
): void {
  out[MOOTQ_FIELD.ageBand] = optionLabel('ageBand', answers.ageBand, locale);
  out[MOOTQ_FIELD.residenceScope] = optionLabel(
    'locationSeekScope',
    answers.residence.scope,
    locale,
  );
  assignResidenceDetail(out, answers.residence, locale);
  out[MOOTQ_FIELD.visitPurpose] = optionLabel('visitPurpose', answers.visitPurpose, locale);
  out[MOOTQ_FIELD.newsletter] = newsletterLabel(answers.newsletter, locale);

  if (answers.visitPurpose === 'market_research') {
    assignMarketResearchFields(out, answers, locale);
  }
}

function assignSpyurkMappedFields(
  out: MootqAnswers,
  answers: SpyurkQuestionnaireAnswers,
  locale: QuestionnaireLocale,
): void {
  out[MOOTQ_FIELD.ageBand] = optionLabel('ageBand', answers.ageBand, locale);
  out[MOOTQ_FIELD.residenceScope] = optionLabel('locationSeekScope', 'abroad', locale);
  out[MOOTQ_FIELD.residenceDetail] = `${answers.residence.city}, ${answers.residence.region}`;
  out[MOOTQ_FIELD.visitPurpose] = optionLabel('visitPurpose', answers.visitPurpose, locale);
  out[MOOTQ_FIELD.newsletter] = newsletterLabel(answers.newsletter, locale);

  if (answers.visitPurpose === 'market_research') {
    out[MOOTQ_FIELD.marketInterests] = answers.marketInterests.map((code) =>
      optionLabel('marketInterest', code, locale),
    );
    out[MOOTQ_FIELD.researchGoal] = optionLabel('researchGoal', answers.researchGoal, locale);
    out[MOOTQ_FIELD.purchaseHorizon] = optionLabel(
      'purchaseHorizon',
      answers.purchaseHorizon,
      locale,
    );
  }
}

function assignMarketResearchFields(
  out: MootqAnswers,
  answers: MarketResearchAnswers,
  locale: QuestionnaireLocale,
): void {
  out[MOOTQ_FIELD.marketInterests] = answers.marketInterests.map((code) =>
    optionLabel('marketInterest', code, locale),
  );
  out[MOOTQ_FIELD.researchGoal] = optionLabel('researchGoal', answers.researchGoal, locale);
  out[MOOTQ_FIELD.purchaseHorizon] = optionLabel(
    'purchaseHorizon',
    answers.purchaseHorizon,
    locale,
  );
}

function assignResidenceDetail(
  out: MootqAnswers,
  residence: ResidencePlace,
  locale: QuestionnaireLocale,
): void {
  if (residence.scope === 'abroad') {
    out[MOOTQ_FIELD.residenceDetail] = residence.country;
    return;
  }
  if (residence.scope === 'yerevan') {
    out[MOOTQ_FIELD.residenceDetail] = optionLabel('yerevanDistrict', residence.district, locale);
    return;
  }
  out[MOOTQ_FIELD.residenceDetail] = optionLabel('marzRegion', residence.region, locale);
}

function newsletterLabel(value: boolean, locale: QuestionnaireLocale): string {
  return getQuestionnaireLabel(
    value ? questionnaireI18n.options.newsletter.yes : questionnaireI18n.options.newsletter.no,
    locale,
  );
}

type OptionGroupKey = keyof typeof questionnaireI18n.options;

function optionLabel(group: OptionGroupKey, value: string, locale: QuestionnaireLocale): string {
  const options = questionnaireI18n.options[group] as Record<
    string,
    { hy: string; en: string; ru: string }
  >;
  const localized = options[value];
  if (!localized) {
    return value;
  }
  return getQuestionnaireLabel(localized, locale);
}
