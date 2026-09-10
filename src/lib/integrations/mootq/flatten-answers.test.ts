import { describe, expect, it } from 'vitest';
import { FORM_VERSION } from '@/lib/questionnaire/constants';
import { SPYURK_FORM_VERSION } from '@/lib/questionnaire/spyurk/constants';
import { flattenQuestionnaireAnswers } from '@/lib/integrations/mootq/flatten-answers';

const residence = { scope: 'yerevan' as const, district: 'kentron' as const };

const ownResidence = {
  ageBand: '35-44',
  residence,
  visitPurpose: 'own_residence',
  interestType: 'apartment_new',
  locationSeek: {
    yerevanDistricts: ['kentron', 'arabkir'],
    marzRegions: [],
    abroadCountries: [],
  },
  areaSqm: '70-90',
  purchaseMethod: 'mortgage',
  monthlyBudget: '300k-500k',
  decisionStage: 'searching_6_months',
  newsletter: true,
};

const investment = {
  ageBand: '25-34',
  residence,
  visitPurpose: 'investment',
  investmentPropertyType: 'apartment',
  locationSeek: {
    yerevanDistricts: ['kentron'],
    marzRegions: [],
    abroadCountries: [],
  },
  investmentGoal: 'rental_income',
  areaSqm: '70-90',
  purchaseMethod: 'cash',
  investmentTimeline: '6-12_months',
  investmentBudgetUsd: '150k-300k',
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
      form_channel: 'GENERAL',
      age_band: '35-44',
      visit_purpose: 'own_residence',
      newsletter: true,
      residence_scope: 'yerevan',
      residence_district: 'kentron',
      interest_type: 'apartment_new',
      area_sqm: '70-90',
      purchase_method: 'mortgage',
      monthly_budget: '300k-500k',
      decision_stage: 'searching_6_months',
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
      form_channel: 'GENERAL',
      age_band: '25-34',
      visit_purpose: 'investment',
      newsletter: false,
      residence_scope: 'yerevan',
      residence_district: 'kentron',
      investment_property_type: 'apartment',
      investment_goal: 'rental_income',
      area_sqm: '70-90',
      purchase_method: 'cash',
      investment_timeline: '6-12_months',
      investment_budget_usd: '150k-300k',
      prior_investment_experience: 'no_first',
      location_seek_districts: ['kentron'],
    });
  });

  it('flattens Spyurk answers with form_channel and RF residence keys', () => {
    expect(
      flattenQuestionnaireAnswers({
        formVersion: SPYURK_FORM_VERSION,
        answers: {
          ageBand: '35-44',
          residence: { city: 'Moscow', region: 'Moscow Oblast' },
          armeniaConnection: 'family_from_armenia',
          purchaseMotives: ['own_stays', 'investment_income'],
          visitPurpose: 'own_residence',
          interestTypes: ['apartment_new', 'apartments'],
          propertyCountry: { scope: 'armenia' },
          areaSqm: '70-90',
          purchaseMethod: 'cash',
          purchaseBudgetUsd: '150k-250k',
          decisionStage: 'searching_6_months',
          armeniaVisitTiming: 'within_3_months',
          newsletter: true,
        },
      }),
    ).toEqual({
      form_version: SPYURK_FORM_VERSION,
      form_channel: 'SPYURK_RF',
      age_band: '35-44',
      visit_purpose: 'own_residence',
      newsletter: true,
      armenia_connection: 'family_from_armenia',
      purchase_motives: ['own_stays', 'investment_income'],
      residence_city: 'Moscow',
      residence_region: 'Moscow Oblast',
      interest_types: ['apartment_new', 'apartments'],
      area_sqm: '70-90',
      purchase_method: 'cash',
      purchase_budget_usd: '150k-250k',
      decision_stage: 'searching_6_months',
      armenia_visit_timing: 'within_3_months',
      property_country_scope: 'armenia',
    });
  });

  it('returns undefined when answers are missing or not a known payload', () => {
    expect(flattenQuestionnaireAnswers({ answers: null })).toBeUndefined();
    expect(flattenQuestionnaireAnswers({ answers: undefined })).toBeUndefined();
    expect(flattenQuestionnaireAnswers({ answers: { visitPurpose: 'unknown' } })).toBeUndefined();
  });
});
