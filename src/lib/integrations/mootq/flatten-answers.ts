import { FORM_VERSION } from '@/lib/questionnaire/constants';
import type {
  InvestmentAnswers,
  LocationSeek,
  MarketResearchAnswers,
  OwnResidenceAnswers,
  QuestionnaireAnswers,
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

  const parsed = questionnaireAnswersSchema.safeParse(input.answers);
  if (!parsed.success) {
    return undefined;
  }

  const flattened = flattenParsedAnswers(parsed.data);
  flattened.form_version = input.formVersion ?? FORM_VERSION;
  return flattened;
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

function flattenOwnResidence(answers: OwnResidenceAnswers): MootqAnswers {
  const flat: MootqAnswers = {
    age_band: answers.ageBand,
    visit_purpose: answers.visitPurpose,
    newsletter: answers.newsletter,
    interest_type: answers.interestType,
    area_sqm: answers.areaSqm,
    purchase_method: answers.purchaseMethod,
    monthly_budget: answers.monthlyBudget,
    decision_stage: answers.decisionStage,
  };

  assignOptional(flat, 'abroad_countries', answers.abroadCountries);
  assignOptional(flat, 'abroad_countries_other', answers.abroadCountriesOther);
  assignLocationSeek(flat, answers.locationSeek);
  return flat;
}

function flattenInvestment(answers: InvestmentAnswers): MootqAnswers {
  const flat: MootqAnswers = {
    age_band: answers.ageBand,
    visit_purpose: answers.visitPurpose,
    newsletter: answers.newsletter,
    investment_property_type: answers.investmentPropertyType,
    investment_market: answers.investmentMarket,
    investment_goal: answers.investmentGoal,
    investment_timeline: answers.investmentTimeline,
    investment_budget_usd: answers.investmentBudgetUsd,
    prior_investment_experience: answers.priorInvestmentExperience,
  };

  assignOptional(flat, 'investment_property_type_other', answers.investmentPropertyTypeOther);
  assignOptional(flat, 'investment_market_other', answers.investmentMarketOther);
  return flat;
}

function flattenMarketResearch(answers: MarketResearchAnswers): MootqAnswers {
  const flat: MootqAnswers = {
    age_band: answers.ageBand,
    visit_purpose: answers.visitPurpose,
    newsletter: answers.newsletter,
    market_interests: answers.marketInterests,
    research_goal: answers.researchGoal,
    interested_where: answers.interestedWhere,
    purchase_horizon: answers.purchaseHorizon,
  };

  assignOptional(flat, 'interested_where_other', answers.interestedWhereOther);
  return flat;
}

function assignLocationSeek(target: MootqAnswers, locationSeek: LocationSeek | undefined): void {
  if (!locationSeek) {
    return;
  }

  target.location_seek_scope = locationSeek.scope;
  if (locationSeek.scope === 'yerevan') {
    target.location_seek_districts = locationSeek.districts;
    return;
  }
  if (locationSeek.scope === 'marz') {
    target.location_seek_regions = locationSeek.regions;
    return;
  }
  target.location_seek_abroad_other = locationSeek.other;
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
