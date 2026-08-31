import { describe, expect, it } from 'vitest';
import { FORM_VERSION } from '@/lib/questionnaire/constants';
import { flattenQuestionnaireAnswers } from '@/lib/integrations/mootq/flatten-answers';

const ownResidence = {
  ageBand: '35-44',
  visitPurpose: 'own_residence',
  interestType: 'apartment_new',
  locationSeek: {
    scope: 'yerevan',
    districts: ['kentron', 'arabkir'],
  },
  areaSqm: '70-90',
  purchaseMethod: 'mortgage',
  monthlyBudget: '300k-500k',
  decisionStage: 'searching_6_months',
  newsletter: true,
};

const investment = {
  ageBand: '25-34',
  visitPurpose: 'investment',
  investmentPropertyType: 'apartment',
  investmentMarket: 'armenia',
  investmentGoal: 'rental_income',
  investmentTimeline: '6_months',
  investmentBudgetUsd: '100k-250k',
  priorInvestmentExperience: 'no_first',
  newsletter: false,
};

describe('flattenQuestionnaireAnswers', () => {
  it('flattens own_residence locationSeek into snake_case keys', () => {
    expect(
      flattenQuestionnaireAnswers({
        formVersion: FORM_VERSION,
        answers: ownResidence,
      }),
    ).toEqual({
      form_version: FORM_VERSION,
      age_band: '35-44',
      visit_purpose: 'own_residence',
      newsletter: true,
      interest_type: 'apartment_new',
      area_sqm: '70-90',
      purchase_method: 'mortgage',
      monthly_budget: '300k-500k',
      decision_stage: 'searching_6_months',
      location_seek_scope: 'yerevan',
      location_seek_districts: ['kentron', 'arabkir'],
    });
  });

  it('flattens investment answers without nested objects', () => {
    expect(
      flattenQuestionnaireAnswers({
        formVersion: FORM_VERSION,
        answers: investment,
      }),
    ).toEqual({
      form_version: FORM_VERSION,
      age_band: '25-34',
      visit_purpose: 'investment',
      newsletter: false,
      investment_property_type: 'apartment',
      investment_market: 'armenia',
      investment_goal: 'rental_income',
      investment_timeline: '6_months',
      investment_budget_usd: '100k-250k',
      prior_investment_experience: 'no_first',
    });
  });

  it('returns undefined when answers are missing or not a known payload', () => {
    expect(flattenQuestionnaireAnswers({ answers: null })).toBeUndefined();
    expect(flattenQuestionnaireAnswers({ answers: undefined })).toBeUndefined();
    expect(flattenQuestionnaireAnswers({ answers: { visitPurpose: 'unknown' } })).toBeUndefined();
  });
});
