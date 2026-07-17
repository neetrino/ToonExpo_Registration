import { getQuestionnaireLabel, questionnaireI18n } from '@/lib/questionnaire/i18n';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';

const ADMIN_DISPLAY_LOCALE: QuestionnaireLocale = 'en';

type Localized = Record<QuestionnaireLocale, string>;

export type AnswerDisplayRow = {
  label: string;
  value: string;
};

export type FormattedRegistrationAnswers = {
  visitPurposeLabel: string | null;
  rows: AnswerDisplayRow[];
};

function localizedLabel(entry: Localized): string {
  return getQuestionnaireLabel(entry, ADMIN_DISPLAY_LOCALE);
}

function questionLabel(key: keyof typeof questionnaireI18n.questions): string {
  return localizedLabel(questionnaireI18n.questions[key]);
}

function optionLabel<G extends keyof typeof questionnaireI18n.options>(
  group: G,
  key: string,
): string {
  const groupMap = questionnaireI18n.options[group] as Record<string, Localized>;
  const entry = groupMap[key];
  return entry ? localizedLabel(entry) : key;
}

function joinOptionLabels<G extends keyof typeof questionnaireI18n.options>(
  group: G,
  keys: string[],
): string {
  return keys.map((key) => optionLabel(group, key)).join(', ');
}

function pushRow(rows: AnswerDisplayRow[], label: string, value: string | undefined): void {
  if (!value?.trim()) {
    return;
  }
  rows.push({ label, value });
}

function formatLocationSeek(
  locationSeek: Record<string, unknown>,
): AnswerDisplayRow[] {
  const rows: AnswerDisplayRow[] = [];
  const scope = locationSeek.scope;

  if (typeof scope !== 'string') {
    return rows;
  }

  pushRow(rows, questionLabel('locationSeek'), optionLabel('locationSeekScope', scope));

  if (scope === 'yerevan' && Array.isArray(locationSeek.districts)) {
    const districts = locationSeek.districts.filter((item): item is string => typeof item === 'string');
    if (districts.length > 0) {
      pushRow(rows, questionLabel('yerevanDistricts'), joinOptionLabels('yerevanDistrict', districts));
    }
  }

  if (scope === 'marz' && Array.isArray(locationSeek.regions)) {
    const regions = locationSeek.regions.filter((item): item is string => typeof item === 'string');
    if (regions.length > 0) {
      pushRow(rows, questionLabel('marzRegions'), joinOptionLabels('marzRegion', regions));
    }
  }

  return rows;
}

function formatOwnResidenceAnswers(a: Record<string, unknown>, rows: AnswerDisplayRow[]): void {
  if (typeof a.interestType === 'string') {
    pushRow(rows, questionLabel('interestType'), optionLabel('interestType', a.interestType));
  }

  if (a.interestType === 'abroad' && Array.isArray(a.abroadCountries)) {
    const countries = a.abroadCountries.filter((item): item is string => typeof item === 'string');
    if (countries.length > 0) {
      pushRow(rows, questionLabel('abroadCountries'), joinOptionLabels('abroadCountry', countries));
    }
    if (typeof a.abroadCountriesOther === 'string') {
      pushRow(rows, questionLabel('abroadCountriesOther'), a.abroadCountriesOther);
    }
  }

  if (
    (a.interestType === 'house_townhouse' || a.interestType === 'apartment_new') &&
    a.locationSeek &&
    typeof a.locationSeek === 'object'
  ) {
    rows.push(...formatLocationSeek(a.locationSeek as Record<string, unknown>));
  }

  if (typeof a.areaSqm === 'string') {
    pushRow(rows, questionLabel('areaSqm'), optionLabel('areaSqm', a.areaSqm));
  }
  if (typeof a.purchaseMethod === 'string') {
    pushRow(rows, questionLabel('purchaseMethod'), optionLabel('purchaseMethod', a.purchaseMethod));
  }
  if (typeof a.monthlyBudget === 'string') {
    pushRow(rows, questionLabel('monthlyBudget'), optionLabel('monthlyBudget', a.monthlyBudget));
  }
  if (typeof a.decisionStage === 'string') {
    pushRow(rows, questionLabel('decisionStage'), optionLabel('decisionStage', a.decisionStage));
  }
}

function formatInvestmentAnswers(a: Record<string, unknown>, rows: AnswerDisplayRow[]): void {
  if (typeof a.investmentPropertyType === 'string') {
    pushRow(
      rows,
      questionLabel('investmentPropertyType'),
      optionLabel('investmentPropertyType', a.investmentPropertyType),
    );
  }
  if (typeof a.investmentPropertyTypeOther === 'string') {
    pushRow(rows, questionLabel('investmentPropertyTypeOther'), a.investmentPropertyTypeOther);
  }
  if (typeof a.investmentMarket === 'string') {
    pushRow(rows, questionLabel('investmentMarket'), optionLabel('investmentMarket', a.investmentMarket));
  }
  if (typeof a.investmentMarketOther === 'string') {
    pushRow(rows, questionLabel('investmentMarketOther'), a.investmentMarketOther);
  }
  if (typeof a.investmentGoal === 'string') {
    pushRow(rows, questionLabel('investmentGoal'), optionLabel('investmentGoal', a.investmentGoal));
  }
  if (typeof a.investmentTimeline === 'string') {
    pushRow(
      rows,
      questionLabel('investmentTimeline'),
      optionLabel('investmentTimeline', a.investmentTimeline),
    );
  }
  if (typeof a.investmentBudgetUsd === 'string') {
    pushRow(
      rows,
      questionLabel('investmentBudgetUsd'),
      optionLabel('investmentBudgetUsd', a.investmentBudgetUsd),
    );
  }
  if (typeof a.priorInvestmentExperience === 'string') {
    pushRow(
      rows,
      questionLabel('priorInvestmentExperience'),
      optionLabel('priorInvestmentExperience', a.priorInvestmentExperience),
    );
  }
}

function formatMarketResearchAnswers(a: Record<string, unknown>, rows: AnswerDisplayRow[]): void {
  if (Array.isArray(a.marketInterests)) {
    const interests = a.marketInterests.filter((item): item is string => typeof item === 'string');
    if (interests.length > 0) {
      pushRow(rows, questionLabel('marketInterests'), joinOptionLabels('marketInterest', interests));
    }
  }
  if (typeof a.researchGoal === 'string') {
    pushRow(rows, questionLabel('researchGoal'), optionLabel('researchGoal', a.researchGoal));
  }
  if (typeof a.interestedWhere === 'string') {
    pushRow(rows, questionLabel('interestedWhere'), optionLabel('interestedWhere', a.interestedWhere));
  }
  if (typeof a.interestedWhereOther === 'string') {
    pushRow(rows, questionLabel('interestedWhereOther'), a.interestedWhereOther);
  }
  if (typeof a.purchaseHorizon === 'string') {
    pushRow(rows, questionLabel('purchaseHorizon'), optionLabel('purchaseHorizon', a.purchaseHorizon));
  }
}

/**
 * Turn stored questionnaire JSON into English label/value rows for admin display.
 * Omits empty fields; visit purpose is returned separately for section headers.
 */
export function formatRegistrationAnswersForDisplay(
  answers: unknown,
): FormattedRegistrationAnswers {
  if (!answers || typeof answers !== 'object') {
    return { visitPurposeLabel: null, rows: [] };
  }

  const record = answers as Record<string, unknown>;
  const visitPurpose = record.visitPurpose;

  if (typeof visitPurpose !== 'string') {
    return { visitPurposeLabel: null, rows: [] };
  }

  const visitPurposeLabel = optionLabel('visitPurpose', visitPurpose);
  const rows: AnswerDisplayRow[] = [];

  if (typeof record.ageBand === 'string') {
    pushRow(rows, questionLabel('ageBand'), optionLabel('ageBand', record.ageBand));
  }

  switch (visitPurpose) {
    case 'own_residence':
      formatOwnResidenceAnswers(record, rows);
      break;
    case 'investment':
      formatInvestmentAnswers(record, rows);
      break;
    case 'market_research':
      formatMarketResearchAnswers(record, rows);
      break;
    default:
      break;
  }

  if (typeof record.newsletter === 'boolean') {
    pushRow(
      rows,
      questionLabel('newsletter'),
      optionLabel('newsletter', record.newsletter ? 'yes' : 'no'),
    );
  }

  return { visitPurposeLabel, rows };
}
