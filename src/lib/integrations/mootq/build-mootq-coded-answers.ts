import type { MootqCodedAnswers } from '@/lib/integrations/mootq/apply-registration-schema';
import {
  assignMootqCountryList,
  assignMootqLocationChoice,
} from '@/lib/integrations/mootq/assign-mootq-location-answers';
import { toMootqOptionLabel } from '@/lib/integrations/mootq/build-mootq-partner-answers';
import {
  INVESTMENT_CITY_QUESTIONS,
  MOOTQ_QUESTION_CODE,
  OWN_RESIDENCE_CITY_QUESTIONS,
} from '@/lib/integrations/mootq/mootq-question-codes';
import { isSpyurkFormVersion } from '@/lib/questionnaire/form-channel';
import { getSpyurkOptionLabel } from '@/lib/questionnaire/spyurk/i18n';
import type { SpyurkQuestionnaireAnswers } from '@/lib/questionnaire/spyurk/types';
import { spyurkQuestionnaireAnswersSchema } from '@/lib/questionnaire/spyurk/validate';
import type {
  InvestmentAnswers,
  MarketResearchAnswers,
  OwnResidenceAnswers,
  QuestionnaireAnswers,
  ResearchLocation,
  ResidencePlace,
} from '@/lib/questionnaire/types';
import { questionnaireAnswersSchema } from '@/lib/questionnaire/validate';

const CODE = MOOTQ_QUESTION_CODE;

export type BuildMootqCodedAnswersInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  formVersion?: string | null;
  answers?: unknown;
};

/** Map a registration onto stable question codes. Ids are applied later from the live schema. */
export function buildMootqCodedAnswers(input: BuildMootqCodedAnswersInput): MootqCodedAnswers {
  const coded: MootqCodedAnswers = {
    [CODE.firstName]: input.firstName,
    [CODE.lastName]: input.lastName,
    [CODE.phone]: input.phone,
    [CODE.email]: input.email,
  };
  assignNewsletter(coded, input.answers);

  if (isSpyurkAnswers(input.formVersion, input.answers)) {
    const parsed = spyurkQuestionnaireAnswersSchema.safeParse(input.answers);
    if (parsed.success) {
      assignSpyurkAnswers(coded, parsed.data);
    }
    return coded;
  }

  const parsed = questionnaireAnswersSchema.safeParse(input.answers);
  if (parsed.success) {
    assignGeneralAnswers(coded, parsed.data);
  }
  return coded;
}

function assignNewsletter(coded: MootqCodedAnswers, answers: unknown): void {
  if (!answers || typeof answers !== 'object' || !('newsletter' in answers)) {
    return;
  }
  const newsletter = answers.newsletter;
  if (typeof newsletter !== 'boolean') {
    return;
  }
  coded[CODE.newsletter] = toMootqOptionLabel('newsletter', newsletter ? 'yes' : 'no');
}

function assignGeneralAnswers(coded: MootqCodedAnswers, answers: QuestionnaireAnswers): void {
  coded[CODE.ageBand] = toMootqOptionLabel('ageBand', answers.ageBand);
  coded[CODE.residenceScope] = toMootqOptionLabel('locationSeekScope', answers.residence.scope);
  assignResidence(coded, answers.residence);
  coded[CODE.visitPurpose] = toMootqOptionLabel('visitPurpose', answers.visitPurpose);

  if (answers.visitPurpose === 'market_research') {
    assignMarketResearch(coded, answers);
    return;
  }
  if (answers.visitPurpose === 'investment') {
    assignInvestment(coded, answers);
    return;
  }
  assignOwnResidence(coded, answers);
}

function assignResidence(coded: MootqCodedAnswers, residence: ResidencePlace): void {
  if (residence.scope === 'yerevan') {
    coded[CODE.residenceYerevan] = toMootqOptionLabel('yerevanDistrict', residence.district);
    return;
  }
  if (residence.scope === 'abroad') {
    coded[CODE.residenceAbroad] = residence.country;
    return;
  }
  coded[CODE.residenceMarz] = toMootqOptionLabel('marzRegion', residence.region);
}

function assignMarketResearch(coded: MootqCodedAnswers, answers: MarketResearchAnswers): void {
  coded[CODE.marketInterests] = answers.marketInterests.map((code) =>
    toMootqOptionLabel('marketInterest', code),
  );
  coded[CODE.researchGoal] = toMootqOptionLabel('researchGoal', answers.researchGoal);
  coded[CODE.purchaseHorizon] = toMootqOptionLabel('purchaseHorizon', answers.purchaseHorizon);
  assignResearchLocation(coded, answers.researchLocation);
}

function assignResearchLocation(coded: MootqCodedAnswers, location: ResearchLocation): void {
  if (location.undecided) {
    coded[CODE.researchLocationScope] = toMootqOptionLabel('locationSeekScope', 'undecided');
    return;
  }
  if (location.yerevanDistricts.length > 0) {
    coded[CODE.researchLocationScope] = toMootqOptionLabel('locationSeekScope', 'yerevan');
    coded[CODE.researchYerevan] = location.yerevanDistricts.map((code) =>
      toMootqOptionLabel('yerevanDistrict', code),
    );
    return;
  }
  if (location.marzRegions.length > 0) {
    coded[CODE.researchLocationScope] = toMootqOptionLabel('locationSeekScope', 'marz');
    coded[CODE.researchMarz] = location.marzRegions.map((code) =>
      toMootqOptionLabel('marzRegion', code),
    );
    return;
  }
  if (location.abroadCountry) {
    coded[CODE.researchLocationScope] = toMootqOptionLabel('locationSeekScope', 'abroad');
    coded[CODE.researchAbroad] = location.abroadCountry;
  }
}

function assignInvestment(coded: MootqCodedAnswers, answers: InvestmentAnswers): void {
  coded[CODE.investmentPropertyType] = toMootqOptionLabel(
    'investmentPropertyType',
    answers.investmentPropertyType,
  );
  if (answers.investmentPropertyType === 'other' && answers.investmentPropertyTypeOther?.trim()) {
    coded[CODE.investmentPropertyOther] = answers.investmentPropertyTypeOther.trim();
  }
  assignMootqLocationChoice(coded, answers.locationSeek, {
    scope: CODE.investmentLocationScope,
    yerevan: CODE.investmentYerevan,
    marz: CODE.investmentMarz,
    abroad: CODE.investmentAbroad,
    abroadOther: CODE.investmentAbroadOther,
    cities: INVESTMENT_CITY_QUESTIONS,
  });
  coded[CODE.investmentGoal] = toMootqOptionLabel('investmentGoal', answers.investmentGoal);
  coded[CODE.investmentArea] = toMootqOptionLabel('areaSqm', answers.areaSqm);
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

function assignOwnResidence(coded: MootqCodedAnswers, answers: OwnResidenceAnswers): void {
  coded[CODE.interestType] = toMootqOptionLabel('interestType', answers.interestType);
  if (answers.interestType === 'abroad') {
    assignMootqCountryList(
      coded,
      answers.abroadCountries ?? [],
      answers.abroadCountriesOther,
      CODE.ownAbroadCountries,
      CODE.ownAbroadCountryOther,
    );
  }
  assignMootqLocationChoice(coded, answers.locationSeek, {
    scope: CODE.ownLocationScope,
    yerevan: CODE.ownYerevan,
    marz: CODE.ownMarz,
    abroad: CODE.ownAbroadSeek,
    abroadOther: CODE.ownAbroadSeekOther,
    cities: OWN_RESIDENCE_CITY_QUESTIONS,
  });
  coded[CODE.ownArea] = toMootqOptionLabel('areaSqm', answers.areaSqm);
  coded[CODE.ownPurchaseMethod] = toMootqOptionLabel('purchaseMethod', answers.purchaseMethod);
  coded[CODE.monthlyBudget] = toMootqOptionLabel('monthlyBudget', answers.monthlyBudget);
  coded[CODE.decisionStage] = toMootqOptionLabel('decisionStage', answers.decisionStage);
}

function assignSpyurkAnswers(coded: MootqCodedAnswers, answers: SpyurkQuestionnaireAnswers): void {
  coded[CODE.ageBand] = toMootqOptionLabel('ageBand', answers.ageBand);
  coded[CODE.residenceScope] = toMootqOptionLabel('locationSeekScope', 'abroad');
  coded[CODE.residenceAbroad] = `${answers.residence.city}, ${answers.residence.region}`;
  coded[CODE.visitPurpose] = toMootqOptionLabel('visitPurpose', answers.visitPurpose);
  if (answers.visitPurpose !== 'market_research') {
    return;
  }
  coded[CODE.marketInterests] = answers.marketInterests.map((code) =>
    toMootqOptionLabel('marketInterest', code),
  );
  coded[CODE.researchGoal] = getSpyurkOptionLabel('researchGoal', answers.researchGoal, 'hy');
  coded[CODE.purchaseHorizon] = toMootqOptionLabel('purchaseHorizon', answers.purchaseHorizon);
}

function isSpyurkAnswers(formVersion: string | null | undefined, answers: unknown): boolean {
  if (isSpyurkFormVersion(formVersion)) {
    return true;
  }
  if (!answers || typeof answers !== 'object' || !('residence' in answers)) {
    return false;
  }
  const residence = answers.residence;
  if (!residence || typeof residence !== 'object') {
    return false;
  }
  const record = residence as Record<string, unknown>;
  return typeof record.city === 'string' && typeof record.scope !== 'string';
}
