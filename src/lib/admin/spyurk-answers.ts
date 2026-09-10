import { isSpyurkFormVersion } from '@/lib/questionnaire/form-channel';
import { getSpyurkOptionLabel, getSpyurkQuestionLabel } from '@/lib/questionnaire/spyurk/i18n';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';

type AnswerDisplayRow = {
  label: string;
  value: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

export function isSpyurkAnswers(answers: unknown, formVersion?: string | null): boolean {
  if (isSpyurkFormVersion(formVersion)) {
    return true;
  }
  if (!isRecord(answers)) {
    return false;
  }
  return isRecord(answers.residence) && typeof answers.residence.city === 'string';
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}

function propertyCountryLabel(
  propertyCountry: unknown,
  locale: QuestionnaireLocale,
): { country: string; other: string } {
  if (!isRecord(propertyCountry) || typeof propertyCountry.scope !== 'string') {
    return { country: '', other: '' };
  }

  return {
    country: getSpyurkOptionLabel('propertyCountry', propertyCountry.scope, locale),
    other: typeof propertyCountry.country === 'string' ? propertyCountry.country : '',
  };
}

export function formatSpyurkAnswersForDisplay(
  answers: Record<string, unknown>,
  locale: QuestionnaireLocale = 'en',
): AnswerDisplayRow[] {
  const rows: AnswerDisplayRow[] = [];
  const push = (label: string, value: string | undefined) => {
    if (value?.trim()) {
      rows.push({ label, value });
    }
  };

  if (typeof answers.ageBand === 'string') {
    push(
      getSpyurkQuestionLabel('ageBand', locale),
      getSpyurkOptionLabel('ageBand', answers.ageBand, locale),
    );
  }

  if (isRecord(answers.residence)) {
    if (typeof answers.residence.city === 'string') {
      push(getSpyurkQuestionLabel('residenceCity', locale), answers.residence.city);
    }
    if (typeof answers.residence.region === 'string') {
      push(getSpyurkQuestionLabel('residenceRegion', locale), answers.residence.region);
    }
  }

  if (typeof answers.armeniaConnection === 'string') {
    push(
      getSpyurkQuestionLabel('armeniaConnection', locale),
      getSpyurkOptionLabel('armeniaConnection', answers.armeniaConnection, locale),
    );
  }
  if (typeof answers.armeniaConnectionOther === 'string') {
    push(getSpyurkQuestionLabel('armeniaConnectionOther', locale), answers.armeniaConnectionOther);
  }

  const motives = stringArray(answers.purchaseMotives);
  if (motives.length > 0) {
    push(
      getSpyurkQuestionLabel('purchaseMotives', locale),
      motives.map((item) => getSpyurkOptionLabel('purchaseMotive', item, locale)).join(', '),
    );
  }
  if (typeof answers.purchaseMotivesOther === 'string') {
    push(getSpyurkQuestionLabel('purchaseMotivesOther', locale), answers.purchaseMotivesOther);
  }

  const interestTypes = stringArray(answers.interestTypes);
  if (interestTypes.length > 0) {
    push(
      getSpyurkQuestionLabel('interestTypes', locale),
      interestTypes.map((item) => getSpyurkOptionLabel('interestType', item, locale)).join(', '),
    );
  }
  if (typeof answers.interestTypesOther === 'string') {
    push(getSpyurkQuestionLabel('interestTypesOther', locale), answers.interestTypesOther);
  }

  const investmentTypes = stringArray(answers.investmentPropertyTypes);
  if (investmentTypes.length > 0) {
    push(
      getSpyurkQuestionLabel('investmentPropertyTypes', locale),
      investmentTypes
        .map((item) => getSpyurkOptionLabel('investmentPropertyType', item, locale))
        .join(', '),
    );
  }
  if (typeof answers.investmentPropertyTypeOther === 'string') {
    push(
      getSpyurkQuestionLabel('investmentPropertyTypeOther', locale),
      answers.investmentPropertyTypeOther,
    );
  }

  const country = propertyCountryLabel(answers.propertyCountry, locale);
  push(getSpyurkQuestionLabel('propertyCountry', locale), country.country);
  push(getSpyurkQuestionLabel('propertyCountryOther', locale), country.other);

  if (typeof answers.areaSqm === 'string') {
    push(
      getSpyurkQuestionLabel('areaSqm', locale),
      getSpyurkOptionLabel('areaSqm', answers.areaSqm, locale),
    );
  }
  if (typeof answers.purchaseMethod === 'string') {
    push(
      getSpyurkQuestionLabel('purchaseMethod', locale),
      getSpyurkOptionLabel('purchaseMethod', answers.purchaseMethod, locale),
    );
  }
  if (typeof answers.purchaseBudgetUsd === 'string') {
    push(
      getSpyurkQuestionLabel('purchaseBudgetUsd', locale),
      getSpyurkOptionLabel('purchaseBudgetUsd', answers.purchaseBudgetUsd, locale),
    );
  }
  if (typeof answers.decisionStage === 'string') {
    push(
      getSpyurkQuestionLabel('decisionStage', locale),
      getSpyurkOptionLabel('decisionStage', answers.decisionStage, locale),
    );
  }
  if (typeof answers.investmentGoal === 'string') {
    push(
      getSpyurkQuestionLabel('investmentGoal', locale),
      getSpyurkOptionLabel('investmentGoal', answers.investmentGoal, locale),
    );
  }
  if (typeof answers.investmentTimeline === 'string') {
    push(
      getSpyurkQuestionLabel('investmentTimeline', locale),
      getSpyurkOptionLabel('investmentTimeline', answers.investmentTimeline, locale),
    );
  }
  if (typeof answers.investmentBudgetUsd === 'string') {
    push(
      getSpyurkQuestionLabel('investmentBudgetUsd', locale),
      getSpyurkOptionLabel('investmentBudgetUsd', answers.investmentBudgetUsd, locale),
    );
  }
  if (typeof answers.priorInvestmentExperience === 'string') {
    push(
      getSpyurkQuestionLabel('priorInvestmentExperience', locale),
      getSpyurkOptionLabel('priorInvestmentExperience', answers.priorInvestmentExperience, locale),
    );
  }
  if (typeof answers.priorInvestmentExperienceOther === 'string') {
    push(
      getSpyurkQuestionLabel('priorInvestmentExperienceOther', locale),
      answers.priorInvestmentExperienceOther,
    );
  }

  const marketInterests = stringArray(answers.marketInterests);
  if (marketInterests.length > 0) {
    push(
      getSpyurkQuestionLabel('marketInterests', locale),
      marketInterests
        .map((item) => getSpyurkOptionLabel('marketInterest', item, locale))
        .join(', '),
    );
  }
  if (typeof answers.researchGoal === 'string') {
    push(
      getSpyurkQuestionLabel('researchGoal', locale),
      getSpyurkOptionLabel('researchGoal', answers.researchGoal, locale),
    );
  }
  if (typeof answers.purchaseHorizon === 'string') {
    push(
      getSpyurkQuestionLabel('purchaseHorizon', locale),
      getSpyurkOptionLabel('purchaseHorizon', answers.purchaseHorizon, locale),
    );
  }
  if (typeof answers.armeniaVisitTiming === 'string') {
    push(
      getSpyurkQuestionLabel('armeniaVisitTiming', locale),
      getSpyurkOptionLabel('armeniaVisitTiming', answers.armeniaVisitTiming, locale),
    );
  }
  if (typeof answers.newsletter === 'boolean') {
    push(
      getSpyurkQuestionLabel('newsletter', locale),
      getSpyurkOptionLabel('newsletter', answers.newsletter ? 'yes' : 'no', locale),
    );
  }

  return rows;
}

export function flattenSpyurkAnswersForExport(
  columns: Record<string, string>,
  answers: Record<string, unknown>,
  locale: QuestionnaireLocale,
): void {
  const set = (key: string, value: string | undefined) => {
    if (value?.trim()) {
      columns[key] = value;
    }
  };

  if (typeof answers.ageBand === 'string') {
    set('ageBand', getSpyurkOptionLabel('ageBand', answers.ageBand, locale));
  }
  if (typeof answers.visitPurpose === 'string') {
    set('visitPurpose', getSpyurkOptionLabel('visitPurpose', answers.visitPurpose, locale));
  }
  if (isRecord(answers.residence)) {
    if (typeof answers.residence.city === 'string') {
      set('residenceCity', answers.residence.city);
      set('residenceDetail', answers.residence.city);
    }
    if (typeof answers.residence.region === 'string') {
      set('residenceRegionRf', answers.residence.region);
    }
    set('residence', 'Russian Federation');
  }

  if (typeof answers.armeniaConnection === 'string') {
    set(
      'armeniaConnection',
      getSpyurkOptionLabel('armeniaConnection', answers.armeniaConnection, locale),
    );
  }
  if (typeof answers.armeniaConnectionOther === 'string') {
    set('armeniaConnectionOther', answers.armeniaConnectionOther);
  }

  const motives = stringArray(answers.purchaseMotives);
  if (motives.length > 0) {
    set(
      'purchaseMotives',
      motives.map((item) => getSpyurkOptionLabel('purchaseMotive', item, locale)).join(', '),
    );
  }
  if (typeof answers.purchaseMotivesOther === 'string') {
    set('purchaseMotivesOther', answers.purchaseMotivesOther);
  }

  const interestTypes = stringArray(answers.interestTypes);
  if (interestTypes.length > 0) {
    set(
      'spyurkInterestTypes',
      interestTypes.map((item) => getSpyurkOptionLabel('interestType', item, locale)).join(', '),
    );
    set(
      'interestType',
      interestTypes.map((item) => getSpyurkOptionLabel('interestType', item, locale)).join(', '),
    );
  }
  if (typeof answers.interestTypesOther === 'string') {
    set('spyurkInterestTypesOther', answers.interestTypesOther);
  }

  const investmentTypes = stringArray(answers.investmentPropertyTypes);
  if (investmentTypes.length > 0) {
    set(
      'investmentPropertyType',
      investmentTypes
        .map((item) => getSpyurkOptionLabel('investmentPropertyType', item, locale))
        .join(', '),
    );
  }
  if (typeof answers.investmentPropertyTypeOther === 'string') {
    set('investmentPropertyTypeOther', answers.investmentPropertyTypeOther);
  }

  const country = propertyCountryLabel(answers.propertyCountry, locale);
  set('propertyCountry', country.country);
  set('propertyCountryOther', country.other);

  if (typeof answers.areaSqm === 'string') {
    set('areaSqm', getSpyurkOptionLabel('areaSqm', answers.areaSqm, locale));
  }
  if (typeof answers.purchaseMethod === 'string') {
    set('purchaseMethod', getSpyurkOptionLabel('purchaseMethod', answers.purchaseMethod, locale));
  }
  if (typeof answers.purchaseBudgetUsd === 'string') {
    set(
      'purchaseBudgetUsd',
      getSpyurkOptionLabel('purchaseBudgetUsd', answers.purchaseBudgetUsd, locale),
    );
  }
  if (typeof answers.decisionStage === 'string') {
    set('decisionStage', getSpyurkOptionLabel('decisionStage', answers.decisionStage, locale));
  }
  if (typeof answers.investmentGoal === 'string') {
    set('investmentGoal', getSpyurkOptionLabel('investmentGoal', answers.investmentGoal, locale));
  }
  if (typeof answers.investmentTimeline === 'string') {
    set(
      'investmentTimeline',
      getSpyurkOptionLabel('investmentTimeline', answers.investmentTimeline, locale),
    );
  }
  if (typeof answers.investmentBudgetUsd === 'string') {
    set(
      'investmentBudgetUsd',
      getSpyurkOptionLabel('investmentBudgetUsd', answers.investmentBudgetUsd, locale),
    );
  }
  if (typeof answers.priorInvestmentExperience === 'string') {
    set(
      'priorInvestmentExperience',
      getSpyurkOptionLabel('priorInvestmentExperience', answers.priorInvestmentExperience, locale),
    );
  }
  if (typeof answers.priorInvestmentExperienceOther === 'string') {
    set('priorInvestmentExperienceOther', answers.priorInvestmentExperienceOther);
  }

  const marketInterests = stringArray(answers.marketInterests);
  if (marketInterests.length > 0) {
    set(
      'marketInterests',
      marketInterests
        .map((item) => getSpyurkOptionLabel('marketInterest', item, locale))
        .join(', '),
    );
  }
  if (typeof answers.researchGoal === 'string') {
    set('researchGoal', getSpyurkOptionLabel('researchGoal', answers.researchGoal, locale));
  }
  if (typeof answers.purchaseHorizon === 'string') {
    set(
      'purchaseHorizon',
      getSpyurkOptionLabel('purchaseHorizon', answers.purchaseHorizon, locale),
    );
  }
  if (typeof answers.armeniaVisitTiming === 'string') {
    set(
      'armeniaVisitTiming',
      getSpyurkOptionLabel('armeniaVisitTiming', answers.armeniaVisitTiming, locale),
    );
  }
  if (typeof answers.newsletter === 'boolean') {
    set(
      'newsletter',
      getSpyurkOptionLabel('newsletter', answers.newsletter ? 'yes' : 'no', locale),
    );
  }
}
