import { FORM_VERSION } from '@/lib/questionnaire/constants';
import { formChannelFromVersion, isSpyurkFormVersion } from '@/lib/questionnaire/form-channel';
import { SPYURK_FORM_VERSION } from '@/lib/questionnaire/spyurk/constants';
import type {
  SpyurkInvestmentAnswers,
  SpyurkMarketResearchAnswers,
  SpyurkOwnResidenceAnswers,
  SpyurkPropertyCountry,
  SpyurkQuestionnaireAnswers,
  SpyurkResidence,
} from '@/lib/questionnaire/spyurk/types';
import { spyurkQuestionnaireAnswersSchema } from '@/lib/questionnaire/spyurk/validate';
import type {
  InvestmentAnswers,
  LocationChoice,
  MarketResearchAnswers,
  OwnResidenceAnswers,
  QuestionnaireAnswers,
  ResearchLocation,
  ResidencePlace,
} from '@/lib/questionnaire/types';
import { questionnaireAnswersSchema } from '@/lib/questionnaire/validate';

export type MootqAnswerValue = string | number | boolean | readonly string[] | readonly number[];

export type MootqAnswers = Record<string, MootqAnswerValue>;

/**
 * Maps stored Toon Expo questionnaire JSON to the contract Appendix A wire object.
 * Returns undefined when answers are missing or not a known form payload.
 */
export function flattenQuestionnaireAnswers(input: {
  formVersion?: string | null;
  answers: unknown;
}): MootqAnswers | undefined {
  if (input.answers === null || input.answers === undefined) {
    return undefined;
  }

  if (isSpyurkFormVersion(input.formVersion) || looksLikeSpyurkAnswers(input.answers)) {
    const parsed = spyurkQuestionnaireAnswersSchema.safeParse(input.answers);
    if (!parsed.success) {
      return undefined;
    }
    const flattened = flattenSpyurkAnswers(parsed.data);
    flattened.form_version = input.formVersion ?? SPYURK_FORM_VERSION;
    flattened.form_channel = formChannelFromVersion(input.formVersion ?? SPYURK_FORM_VERSION);
    return flattened;
  }

  const parsed = questionnaireAnswersSchema.safeParse(input.answers);
  if (!parsed.success) {
    return undefined;
  }

  const flattened = flattenParsedAnswers(parsed.data);
  flattened.form_version = input.formVersion ?? FORM_VERSION;
  flattened.form_channel = formChannelFromVersion(input.formVersion ?? FORM_VERSION);
  return flattened;
}

function looksLikeSpyurkAnswers(answers: unknown): boolean {
  if (!answers || typeof answers !== 'object' || !('residence' in answers)) {
    return false;
  }

  const residence = answers.residence;
  return residence !== null && typeof residence === 'object' && 'city' in residence;
}

function flattenParsedAnswers(answers: QuestionnaireAnswers): MootqAnswers {
  switch (answers.visitPurpose) {
    case 'own_residence':
      return flattenOwnResidence(answers);
    case 'investment':
      return flattenInvestment(answers);
    case 'market_research':
      return flattenMarketResearch(answers);
    default: {
      const exhaustive: never = answers;
      return exhaustive;
    }
  }
}

function flattenShared(answers: QuestionnaireAnswers): MootqAnswers {
  const flat: MootqAnswers = {
    age_band: answers.ageBand,
    visit_purpose: answers.visitPurpose,
    newsletter: answers.newsletter,
  };

  assignResidence(flat, answers.residence);
  return flat;
}

function flattenOwnResidence(answers: OwnResidenceAnswers): MootqAnswers {
  const flat = flattenShared(answers);
  flat.interest_type = answers.interestType;
  flat.area_sqm = answers.areaSqm;
  flat.purchase_method = answers.purchaseMethod;
  flat.monthly_budget = answers.monthlyBudget;
  flat.decision_stage = answers.decisionStage;
  assignOptional(flat, 'abroad_countries', answers.abroadCountries);
  assignOptional(flat, 'abroad_countries_other', answers.abroadCountriesOther);
  assignLocationChoice(flat, answers.locationSeek);
  return flat;
}

function flattenInvestment(answers: InvestmentAnswers): MootqAnswers {
  const flat = flattenShared(answers);
  flat.investment_property_type = answers.investmentPropertyType;
  flat.investment_goal = answers.investmentGoal;
  flat.area_sqm = answers.areaSqm;
  flat.purchase_method = answers.purchaseMethod;
  flat.investment_timeline = answers.investmentTimeline;
  flat.investment_budget_usd = answers.investmentBudgetUsd;
  flat.prior_investment_experience = answers.priorInvestmentExperience;
  assignOptional(flat, 'investment_property_type_other', answers.investmentPropertyTypeOther);
  assignOptional(flat, 'prior_investment_experience_other', answers.priorInvestmentExperienceOther);
  assignLocationChoice(flat, answers.locationSeek);
  return flat;
}

function flattenMarketResearch(answers: MarketResearchAnswers): MootqAnswers {
  const flat = flattenShared(answers);
  flat.market_interests = answers.marketInterests;
  flat.research_goal = answers.researchGoal;
  flat.purchase_horizon = answers.purchaseHorizon;
  assignResearchLocation(flat, answers.researchLocation);
  return flat;
}

function assignResidence(target: MootqAnswers, residence: ResidencePlace): void {
  target.residence_scope = residence.scope;
  if (residence.scope === 'yerevan') {
    target.residence_district = residence.district;
    return;
  }
  if (residence.scope === 'marz') {
    target.residence_region = residence.region;
    return;
  }
  target.residence_country = residence.country;
}

function assignLocationChoice(target: MootqAnswers, locationSeek: LocationChoice): void {
  if (locationSeek.yerevanDistricts.length > 0) {
    target.location_seek_districts = locationSeek.yerevanDistricts;
  }
  if (locationSeek.marzRegions.length > 0) {
    target.location_seek_regions = locationSeek.marzRegions;
  }
  if (locationSeek.abroadCountries.length > 0) {
    target.location_seek_abroad_countries = locationSeek.abroadCountries;
  }
  assignOptional(target, 'location_seek_abroad_other', locationSeek.abroadCountriesOther);
}

function assignResearchLocation(target: MootqAnswers, location: ResearchLocation): void {
  if (location.undecided) {
    target.research_undecided = true;
    return;
  }

  if (location.yerevanDistricts.length > 0) {
    target.research_districts = location.yerevanDistricts;
  }
  if (location.marzRegions.length > 0) {
    target.research_regions = location.marzRegions;
  }
  assignOptional(target, 'research_abroad_country', location.abroadCountry);
}

function flattenSpyurkAnswers(answers: SpyurkQuestionnaireAnswers): MootqAnswers {
  const flat: MootqAnswers = {
    age_band: answers.ageBand,
    visit_purpose: answers.visitPurpose,
    newsletter: answers.newsletter,
    armenia_connection: answers.armeniaConnection,
    purchase_motives: answers.purchaseMotives,
  };
  assignSpyurkResidence(flat, answers.residence);
  assignOptional(flat, 'armenia_connection_other', answers.armeniaConnectionOther);
  assignOptional(flat, 'purchase_motives_other', answers.purchaseMotivesOther);

  switch (answers.visitPurpose) {
    case 'own_residence':
      return flattenSpyurkOwnResidence(flat, answers);
    case 'investment':
      return flattenSpyurkInvestment(flat, answers);
    case 'market_research':
      return flattenSpyurkMarketResearch(flat, answers);
    default: {
      const exhaustive: never = answers;
      return exhaustive;
    }
  }
}

function flattenSpyurkOwnResidence(
  flat: MootqAnswers,
  answers: SpyurkOwnResidenceAnswers,
): MootqAnswers {
  flat.interest_types = answers.interestTypes;
  flat.area_sqm = answers.areaSqm;
  flat.purchase_method = answers.purchaseMethod;
  flat.purchase_budget_usd = answers.purchaseBudgetUsd;
  flat.decision_stage = answers.decisionStage;
  flat.armenia_visit_timing = answers.armeniaVisitTiming;
  assignOptional(flat, 'interest_types_other', answers.interestTypesOther);
  assignSpyurkPropertyCountry(flat, answers.propertyCountry);
  return flat;
}

function flattenSpyurkInvestment(
  flat: MootqAnswers,
  answers: SpyurkInvestmentAnswers,
): MootqAnswers {
  flat.investment_property_types = answers.investmentPropertyTypes;
  flat.investment_goal = answers.investmentGoal;
  flat.purchase_method = answers.purchaseMethod;
  flat.investment_timeline = answers.investmentTimeline;
  flat.investment_budget_usd = answers.investmentBudgetUsd;
  flat.prior_investment_experience = answers.priorInvestmentExperience;
  flat.armenia_visit_timing = answers.armeniaVisitTiming;
  assignOptional(flat, 'investment_property_type_other', answers.investmentPropertyTypeOther);
  assignOptional(flat, 'area_sqm', answers.areaSqm);
  assignOptional(flat, 'prior_investment_experience_other', answers.priorInvestmentExperienceOther);
  assignSpyurkPropertyCountry(flat, answers.propertyCountry);
  return flat;
}

function flattenSpyurkMarketResearch(
  flat: MootqAnswers,
  answers: SpyurkMarketResearchAnswers,
): MootqAnswers {
  flat.market_interests = answers.marketInterests;
  flat.research_goal = answers.researchGoal;
  flat.purchase_horizon = answers.purchaseHorizon;
  flat.armenia_visit_timing = answers.armeniaVisitTiming;
  assignSpyurkPropertyCountry(flat, answers.propertyCountry);
  return flat;
}

function assignSpyurkResidence(target: MootqAnswers, residence: SpyurkResidence): void {
  target.residence_city = residence.city;
  target.residence_region = residence.region;
}

function assignSpyurkPropertyCountry(target: MootqAnswers, country: SpyurkPropertyCountry): void {
  target.property_country_scope = country.scope;
  if (country.scope === 'other') {
    target.property_country_other = country.country;
  }
}

function assignOptional(
  target: MootqAnswers,
  key: string,
  value: MootqAnswerValue | undefined,
): void {
  if (value !== undefined) {
    target[key] = value;
  }
}
