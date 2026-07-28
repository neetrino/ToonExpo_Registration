import { getQuestionnaireLabel, questionnaireI18n } from '@/lib/questionnaire/i18n';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import { CSV_ANSWER_COLUMNS } from '@/lib/admin/constants';

type Localized = Record<QuestionnaireLocale, string>;

export type FlattenedAnswerColumns = Record<(typeof CSV_ANSWER_COLUMNS)[number]['key'], string>;

type LabelHelpers = {
  optionLabel: <G extends keyof typeof questionnaireI18n.options>(
    group: G,
    key: string,
  ) => string;
  joinOptionLabels: <G extends keyof typeof questionnaireI18n.options>(
    group: G,
    keys: string[],
  ) => string;
};

function createLabelHelpers(locale: QuestionnaireLocale): LabelHelpers {
  function optionLabel<G extends keyof typeof questionnaireI18n.options>(
    group: G,
    key: string,
  ): string {
    const groupMap = questionnaireI18n.options[group] as Record<string, Localized>;
    const entry = groupMap[key];
    return entry ? getQuestionnaireLabel(entry, locale) : key;
  }

  function joinOptionLabels<G extends keyof typeof questionnaireI18n.options>(
    group: G,
    keys: string[],
  ): string {
    return keys.map((key) => optionLabel(group, key)).join(', ');
  }

  return { optionLabel, joinOptionLabels };
}

function emptyAnswerColumns(): FlattenedAnswerColumns {
  return Object.fromEntries(
    CSV_ANSWER_COLUMNS.map((column) => [column.key, '']),
  ) as FlattenedAnswerColumns;
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
  labels: LabelHelpers,
): void {
  const scope = locationSeek.scope;
  if (typeof scope !== 'string') {
    return;
  }

  setColumn(columns, 'locationSeek', labels.optionLabel('locationSeekScope', scope));

  if (scope === 'yerevan' && Array.isArray(locationSeek.districts)) {
    const districts = locationSeek.districts.filter(
      (item): item is string => typeof item === 'string',
    );
    if (districts.length > 0) {
      setColumn(
        columns,
        'yerevanDistricts',
        labels.joinOptionLabels('yerevanDistrict', districts),
      );
    }
  }

  if (scope === 'marz' && Array.isArray(locationSeek.regions)) {
    const regions = locationSeek.regions.filter((item): item is string => typeof item === 'string');
    if (regions.length > 0) {
      setColumn(columns, 'marzRegions', labels.joinOptionLabels('marzRegion', regions));
    }
  }

  if (scope === 'abroad' && typeof locationSeek.other === 'string' && locationSeek.other) {
    setColumn(columns, 'locationSeekOther', locationSeek.other);
  }
}

function flattenOwnResidence(
  columns: FlattenedAnswerColumns,
  a: Record<string, unknown>,
  labels: LabelHelpers,
): void {
  if (typeof a.interestType === 'string') {
    setColumn(columns, 'interestType', labels.optionLabel('interestType', a.interestType));
  }

  if (a.interestType === 'abroad' && Array.isArray(a.abroadCountries)) {
    const countries = a.abroadCountries.filter((item): item is string => typeof item === 'string');
    if (countries.length > 0) {
      setColumn(columns, 'abroadCountries', labels.joinOptionLabels('abroadCountry', countries));
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
    flattenLocationSeek(columns, a.locationSeek as Record<string, unknown>, labels);
  }

  if (typeof a.areaSqm === 'string') {
    setColumn(columns, 'areaSqm', labels.optionLabel('areaSqm', a.areaSqm));
  }
  if (typeof a.purchaseMethod === 'string') {
    setColumn(columns, 'purchaseMethod', labels.optionLabel('purchaseMethod', a.purchaseMethod));
  }
  if (typeof a.monthlyBudget === 'string') {
    setColumn(columns, 'monthlyBudget', labels.optionLabel('monthlyBudget', a.monthlyBudget));
  }
  if (typeof a.decisionStage === 'string') {
    setColumn(columns, 'decisionStage', labels.optionLabel('decisionStage', a.decisionStage));
  }
}

function flattenInvestment(
  columns: FlattenedAnswerColumns,
  a: Record<string, unknown>,
  labels: LabelHelpers,
): void {
  if (typeof a.investmentPropertyType === 'string') {
    setColumn(
      columns,
      'investmentPropertyType',
      labels.optionLabel('investmentPropertyType', a.investmentPropertyType),
    );
  }
  if (typeof a.investmentPropertyTypeOther === 'string') {
    setColumn(columns, 'investmentPropertyTypeOther', a.investmentPropertyTypeOther);
  }
  if (typeof a.investmentMarket === 'string') {
    setColumn(
      columns,
      'investmentMarket',
      labels.optionLabel('investmentMarket', a.investmentMarket),
    );
  }
  if (typeof a.investmentMarketOther === 'string') {
    setColumn(columns, 'investmentMarketOther', a.investmentMarketOther);
  }
  if (typeof a.investmentGoal === 'string') {
    setColumn(columns, 'investmentGoal', labels.optionLabel('investmentGoal', a.investmentGoal));
  }
  if (typeof a.investmentTimeline === 'string') {
    setColumn(
      columns,
      'investmentTimeline',
      labels.optionLabel('investmentTimeline', a.investmentTimeline),
    );
  }
  if (typeof a.investmentBudgetUsd === 'string') {
    setColumn(
      columns,
      'investmentBudgetUsd',
      labels.optionLabel('investmentBudgetUsd', a.investmentBudgetUsd),
    );
  }
  if (typeof a.priorInvestmentExperience === 'string') {
    setColumn(
      columns,
      'priorInvestmentExperience',
      labels.optionLabel('priorInvestmentExperience', a.priorInvestmentExperience),
    );
  }
}

function flattenMarketResearch(
  columns: FlattenedAnswerColumns,
  a: Record<string, unknown>,
  labels: LabelHelpers,
): void {
  if (Array.isArray(a.marketInterests)) {
    const interests = a.marketInterests.filter((item): item is string => typeof item === 'string');
    if (interests.length > 0) {
      setColumn(columns, 'marketInterests', labels.joinOptionLabels('marketInterest', interests));
    }
  }
  if (typeof a.researchGoal === 'string') {
    setColumn(columns, 'researchGoal', labels.optionLabel('researchGoal', a.researchGoal));
  }
  if (typeof a.interestedWhere === 'string') {
    setColumn(
      columns,
      'interestedWhere',
      labels.optionLabel('interestedWhere', a.interestedWhere),
    );
  }
  if (typeof a.interestedWhereOther === 'string') {
    setColumn(columns, 'interestedWhereOther', a.interestedWhereOther);
  }
  if (typeof a.purchaseHorizon === 'string') {
    setColumn(columns, 'purchaseHorizon', labels.optionLabel('purchaseHorizon', a.purchaseHorizon));
  }
}

/**
 * Flatten questionnaire JSON into fixed CSV columns with human-readable labels
 * in the registration locale. Missing / branch-irrelevant fields stay empty strings.
 */
export function flattenRegistrationAnswersForExport(
  answers: unknown,
  locale: QuestionnaireLocale,
): FlattenedAnswerColumns {
  const columns = emptyAnswerColumns();
  const labels = createLabelHelpers(locale);

  if (!answers || typeof answers !== 'object') {
    return columns;
  }

  const record = answers as Record<string, unknown>;
  const visitPurpose = record.visitPurpose;

  if (typeof visitPurpose === 'string') {
    setColumn(columns, 'visitPurpose', labels.optionLabel('visitPurpose', visitPurpose));
  }

  if (typeof record.ageBand === 'string') {
    setColumn(columns, 'ageBand', labels.optionLabel('ageBand', record.ageBand));
  }

  switch (visitPurpose) {
    case 'own_residence':
      flattenOwnResidence(columns, record, labels);
      break;
    case 'investment':
      flattenInvestment(columns, record, labels);
      break;
    case 'market_research':
      flattenMarketResearch(columns, record, labels);
      break;
    default:
      break;
  }

  if (typeof record.newsletter === 'boolean') {
    setColumn(
      columns,
      'newsletter',
      labels.optionLabel('newsletter', record.newsletter ? 'yes' : 'no'),
    );
  }

  return columns;
}
