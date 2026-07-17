import { getQuestionnaireLabel, questionnaireI18n } from '@/lib/questionnaire/i18n';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import { CSV_ANSWER_COLUMNS } from '@/lib/admin/constants';

const ADMIN_EXPORT_LOCALE: QuestionnaireLocale = 'en';

type Localized = Record<QuestionnaireLocale, string>;

export type FlattenedAnswerColumns = Record<(typeof CSV_ANSWER_COLUMNS)[number]['key'], string>;

function localizedLabel(entry: Localized): string {
  return getQuestionnaireLabel(entry, ADMIN_EXPORT_LOCALE);
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

function emptyAnswerColumns(): FlattenedAnswerColumns {
  return Object.fromEntries(CSV_ANSWER_COLUMNS.map((column) => [column.key, ''])) as FlattenedAnswerColumns;
}

function setColumn(
  columns: FlattenedAnswerColumns,
  key: keyof FlattenedAnswerColumns,
  value: string | undefined,
): void {
  if (!value?.trim()) {
    return;
  }
  columns[key] = value;
}

function flattenLocationSeek(
  columns: FlattenedAnswerColumns,
  locationSeek: Record<string, unknown>,
): void {
  const scope = locationSeek.scope;
  if (typeof scope !== 'string') {
    return;
  }

  setColumn(columns, 'locationSeek', optionLabel('locationSeekScope', scope));

  if (scope === 'yerevan' && Array.isArray(locationSeek.districts)) {
    const districts = locationSeek.districts.filter(
      (item): item is string => typeof item === 'string',
    );
    if (districts.length > 0) {
      setColumn(columns, 'yerevanDistricts', joinOptionLabels('yerevanDistrict', districts));
    }
  }

  if (scope === 'marz' && Array.isArray(locationSeek.regions)) {
    const regions = locationSeek.regions.filter((item): item is string => typeof item === 'string');
    if (regions.length > 0) {
      setColumn(columns, 'marzRegions', joinOptionLabels('marzRegion', regions));
    }
  }
}

function flattenOwnResidence(columns: FlattenedAnswerColumns, a: Record<string, unknown>): void {
  if (typeof a.interestType === 'string') {
    setColumn(columns, 'interestType', optionLabel('interestType', a.interestType));
  }

  if (a.interestType === 'abroad' && Array.isArray(a.abroadCountries)) {
    const countries = a.abroadCountries.filter((item): item is string => typeof item === 'string');
    if (countries.length > 0) {
      setColumn(columns, 'abroadCountries', joinOptionLabels('abroadCountry', countries));
    }
    if (typeof a.abroadCountriesOther === 'string') {
      setColumn(columns, 'abroadCountriesOther', a.abroadCountriesOther);
    }
  }

  if (
    (a.interestType === 'house_townhouse' || a.interestType === 'apartment_new') &&
    a.locationSeek &&
    typeof a.locationSeek === 'object'
  ) {
    flattenLocationSeek(columns, a.locationSeek as Record<string, unknown>);
  }

  if (typeof a.areaSqm === 'string') {
    setColumn(columns, 'areaSqm', optionLabel('areaSqm', a.areaSqm));
  }
  if (typeof a.purchaseMethod === 'string') {
    setColumn(columns, 'purchaseMethod', optionLabel('purchaseMethod', a.purchaseMethod));
  }
  if (typeof a.monthlyBudget === 'string') {
    setColumn(columns, 'monthlyBudget', optionLabel('monthlyBudget', a.monthlyBudget));
  }
  if (typeof a.decisionStage === 'string') {
    setColumn(columns, 'decisionStage', optionLabel('decisionStage', a.decisionStage));
  }
}

function flattenInvestment(columns: FlattenedAnswerColumns, a: Record<string, unknown>): void {
  if (typeof a.investmentPropertyType === 'string') {
    setColumn(
      columns,
      'investmentPropertyType',
      optionLabel('investmentPropertyType', a.investmentPropertyType),
    );
  }
  if (typeof a.investmentPropertyTypeOther === 'string') {
    setColumn(columns, 'investmentPropertyTypeOther', a.investmentPropertyTypeOther);
  }
  if (typeof a.investmentMarket === 'string') {
    setColumn(columns, 'investmentMarket', optionLabel('investmentMarket', a.investmentMarket));
  }
  if (typeof a.investmentMarketOther === 'string') {
    setColumn(columns, 'investmentMarketOther', a.investmentMarketOther);
  }
  if (typeof a.investmentGoal === 'string') {
    setColumn(columns, 'investmentGoal', optionLabel('investmentGoal', a.investmentGoal));
  }
  if (typeof a.investmentTimeline === 'string') {
    setColumn(
      columns,
      'investmentTimeline',
      optionLabel('investmentTimeline', a.investmentTimeline),
    );
  }
  if (typeof a.investmentBudgetUsd === 'string') {
    setColumn(
      columns,
      'investmentBudgetUsd',
      optionLabel('investmentBudgetUsd', a.investmentBudgetUsd),
    );
  }
  if (typeof a.priorInvestmentExperience === 'string') {
    setColumn(
      columns,
      'priorInvestmentExperience',
      optionLabel('priorInvestmentExperience', a.priorInvestmentExperience),
    );
  }
}

function flattenMarketResearch(columns: FlattenedAnswerColumns, a: Record<string, unknown>): void {
  if (Array.isArray(a.marketInterests)) {
    const interests = a.marketInterests.filter((item): item is string => typeof item === 'string');
    if (interests.length > 0) {
      setColumn(columns, 'marketInterests', joinOptionLabels('marketInterest', interests));
    }
  }
  if (typeof a.researchGoal === 'string') {
    setColumn(columns, 'researchGoal', optionLabel('researchGoal', a.researchGoal));
  }
  if (typeof a.interestedWhere === 'string') {
    setColumn(columns, 'interestedWhere', optionLabel('interestedWhere', a.interestedWhere));
  }
  if (typeof a.interestedWhereOther === 'string') {
    setColumn(columns, 'interestedWhereOther', a.interestedWhereOther);
  }
  if (typeof a.purchaseHorizon === 'string') {
    setColumn(columns, 'purchaseHorizon', optionLabel('purchaseHorizon', a.purchaseHorizon));
  }
}

/**
 * Flatten questionnaire JSON into fixed English CSV columns (human-readable labels).
 * Missing / branch-irrelevant fields stay empty strings.
 */
export function flattenRegistrationAnswersForExport(answers: unknown): FlattenedAnswerColumns {
  const columns = emptyAnswerColumns();

  if (!answers || typeof answers !== 'object') {
    return columns;
  }

  const record = answers as Record<string, unknown>;
  const visitPurpose = record.visitPurpose;

  if (typeof visitPurpose === 'string') {
    setColumn(columns, 'visitPurpose', optionLabel('visitPurpose', visitPurpose));
  }

  if (typeof record.ageBand === 'string') {
    setColumn(columns, 'ageBand', optionLabel('ageBand', record.ageBand));
  }

  switch (visitPurpose) {
    case 'own_residence':
      flattenOwnResidence(columns, record);
      break;
    case 'investment':
      flattenInvestment(columns, record);
      break;
    case 'market_research':
      flattenMarketResearch(columns, record);
      break;
    default:
      break;
  }

  if (typeof record.newsletter === 'boolean') {
    setColumn(columns, 'newsletter', optionLabel('newsletter', record.newsletter ? 'yes' : 'no'));
  }

  return columns;
}
