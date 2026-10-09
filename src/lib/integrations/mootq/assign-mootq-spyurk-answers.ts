import type { MootqCodedAnswers } from '@/lib/integrations/mootq/apply-registration-schema';
import { toMootqOptionLabel } from '@/lib/integrations/mootq/build-mootq-partner-answers';
import { MOOTQ_QUESTION_CODE } from '@/lib/integrations/mootq/mootq-question-codes';
import { MOOTQ_OTHER_OPTION } from '@/lib/integrations/mootq/registration-schema';
import { getSpyurkOptionLabel } from '@/lib/questionnaire/spyurk/i18n';
import type {
  SpyurkInterestType,
  SpyurkInvestmentAnswers,
  SpyurkOwnResidenceAnswers,
  SpyurkPropertyCountry,
  SpyurkQuestionnaireAnswers,
} from '@/lib/questionnaire/spyurk/types';
import type { InterestType } from '@/lib/questionnaire/types';

const CODE = MOOTQ_QUESTION_CODE;

/** Spyurk property kinds that have an exact Mootq counterpart; the rest stay unanswered. */
const SPYURK_TO_MOOTQ_INTEREST: Partial<Record<SpyurkInterestType, InterestType>> = {
  apartment_new: 'apartment_new',
  house_villa_townhouse: 'house_townhouse',
};

/** Map Spyurk answers onto the event questions they correspond to. Nothing is guessed. */
export function assignMootqSpyurkAnswers(
  coded: MootqCodedAnswers,
  answers: SpyurkQuestionnaireAnswers,
): void {
  coded[CODE.ageBand] = toMootqOptionLabel('ageBand', answers.ageBand);
  coded[CODE.residenceScope] = toMootqOptionLabel('locationSeekScope', 'abroad');
  coded[CODE.residenceAbroad] = `${answers.residence.city}, ${answers.residence.region}`;
  coded[CODE.visitPurpose] = toMootqOptionLabel('visitPurpose', answers.visitPurpose);

  if (answers.visitPurpose === 'market_research') {
    coded[CODE.marketInterests] = answers.marketInterests.map((code) =>
      toMootqOptionLabel('marketInterest', code),
    );
    coded[CODE.researchGoal] = getSpyurkOptionLabel('researchGoal', answers.researchGoal, 'hy');
    coded[CODE.purchaseHorizon] = toMootqOptionLabel('purchaseHorizon', answers.purchaseHorizon);
    return;
  }
  if (answers.visitPurpose === 'investment') {
    assignSpyurkInvestment(coded, answers);
    return;
  }
  assignSpyurkOwnResidence(coded, answers);
}

function assignSpyurkOwnResidence(
  coded: MootqCodedAnswers,
  answers: SpyurkOwnResidenceAnswers,
): void {
  const abroadCountry = propertyAbroadCountry(answers.propertyCountry);
  if (abroadCountry) {
    coded[CODE.interestType] = toMootqOptionLabel('interestType', 'abroad');
    coded[CODE.ownAbroadCountries] = [abroadCountry];
    coded[CODE.ownLocationScope] = toMootqOptionLabel('locationSeekScope', 'abroad');
    coded[CODE.ownAbroadSeek] = [abroadCountry];
  } else {
    assignSingleInterestType(coded, answers.interestTypes);
  }
  coded[CODE.ownArea] = toMootqOptionLabel('areaSqm', answers.areaSqm);
  coded[CODE.ownPurchaseMethod] = toMootqOptionLabel('purchaseMethod', answers.purchaseMethod);
  coded[CODE.decisionStage] = toMootqOptionLabel('decisionStage', answers.decisionStage);
}

function assignSingleInterestType(
  coded: MootqCodedAnswers,
  interestTypes: readonly SpyurkInterestType[],
): void {
  const mapped = new Set(interestTypes.map((type) => SPYURK_TO_MOOTQ_INTEREST[type]));
  const [only] = [...mapped];
  if (mapped.size === 1 && only) {
    coded[CODE.interestType] = toMootqOptionLabel('interestType', only);
  }
}

function assignSpyurkInvestment(coded: MootqCodedAnswers, answers: SpyurkInvestmentAnswers): void {
  assignInvestmentPropertyTypes(coded, answers);
  const abroadCountry = propertyAbroadCountry(answers.propertyCountry);
  if (abroadCountry) {
    coded[CODE.investmentLocationScope] = toMootqOptionLabel('locationSeekScope', 'abroad');
    coded[CODE.investmentAbroad] = [abroadCountry];
  }
  coded[CODE.investmentGoal] = toMootqOptionLabel('investmentGoal', answers.investmentGoal);
  if (answers.areaSqm) {
    coded[CODE.investmentArea] = toMootqOptionLabel('areaSqm', answers.areaSqm);
  }
  coded[CODE.investmentPurchaseMethod] = toMootqOptionLabel(
    'purchaseMethod',
    answers.purchaseMethod,
  );
  coded[CODE.investmentTimeline] = toMootqOptionLabel(
    'investmentTimeline',
    answers.investmentTimeline,
  );
  coded[CODE.investmentBudget] = toMootqOptionLabel(
    'investmentBudgetUsd',
    answers.investmentBudgetUsd,
  );
  coded[CODE.priorExperience] = toMootqOptionLabel(
    'priorInvestmentExperience',
    answers.priorInvestmentExperience,
  );
  if (answers.priorInvestmentExperienceOther?.trim()) {
    coded[CODE.priorExperienceCountry] = answers.priorInvestmentExperienceOther.trim();
  }
}

/** One type → that option; several → «Այլ» with every chosen type spelled out. */
function assignInvestmentPropertyTypes(
  coded: MootqCodedAnswers,
  answers: SpyurkInvestmentAnswers,
): void {
  const other = answers.investmentPropertyTypeOther?.trim();
  const labels = answers.investmentPropertyTypes
    .filter((type) => type !== 'other')
    .map((type) => toMootqOptionLabel('investmentPropertyType', type));
  if (other) {
    labels.push(other);
  }
  const [single] = labels;
  if (labels.length === 1 && single && !other) {
    coded[CODE.investmentPropertyType] = single;
    return;
  }
  if (labels.length > 0) {
    coded[CODE.investmentPropertyType] = MOOTQ_OTHER_OPTION;
    coded[CODE.investmentPropertyOther] = labels.join(', ');
  }
}

function propertyAbroadCountry(propertyCountry: SpyurkPropertyCountry): string | null {
  if (propertyCountry.scope !== 'other') {
    return null;
  }
  const country = propertyCountry.country.trim();
  return country.length > 0 ? country : null;
}
