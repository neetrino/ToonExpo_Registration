import { FORM_VERSION, LOCATION_CHOICE_MAX, MARKET_INTERESTS_MAX } from '@/lib/questionnaire/constants';
import {
  ABROAD_COUNTRIES,
  AGE_BANDS,
  AREA_SQM_BANDS,
  DECISION_STAGES,
  INTEREST_TYPES,
  INVESTMENT_BUDGETS_USD,
  INVESTMENT_GOALS,
  INVESTMENT_PROPERTY_TYPES,
  INVESTMENT_TIMELINES,
  LOCATION_SEEK_SCOPES,
  MARKET_INTERESTS,
  MARZ_REGIONS,
  MONTHLY_BUDGETS,
  PRIOR_INVESTMENT_EXPERIENCES,
  PURCHASE_HORIZONS,
  PURCHASE_METHODS,
  RESEARCH_GOALS,
  RESEARCH_LOCATION_SCOPES,
  VISIT_PURPOSES,
  YEREVAN_DISTRICTS,
} from '@/lib/questionnaire/options';

/**
 * Typed questionnaire definition for the active form version.
 * Labels live in i18n; this exports stable option value lists for UI/API consumers.
 */
export const QUESTIONNAIRE_DEFINITION = {
  formVersion: FORM_VERSION,
  shared: {
    ageBand: { options: AGE_BANDS },
    residence: {
      scopes: LOCATION_SEEK_SCOPES,
      yerevanDistricts: YEREVAN_DISTRICTS,
      marzRegions: MARZ_REGIONS,
    },
    visitPurpose: { options: VISIT_PURPOSES },
  },
  locationChoice: {
    max: LOCATION_CHOICE_MAX,
    scopes: LOCATION_SEEK_SCOPES,
    yerevanDistricts: YEREVAN_DISTRICTS,
    marzRegions: MARZ_REGIONS,
    abroadCountries: ABROAD_COUNTRIES,
  },
  branches: {
    own_residence: {
      interestType: { options: INTEREST_TYPES },
      abroadCountries: { options: ABROAD_COUNTRIES, multi: true },
      areaSqm: { options: AREA_SQM_BANDS },
      purchaseMethod: { options: PURCHASE_METHODS },
      monthlyBudget: { options: MONTHLY_BUDGETS },
      decisionStage: { options: DECISION_STAGES },
    },
    investment: {
      investmentPropertyType: { options: INVESTMENT_PROPERTY_TYPES },
      investmentGoal: { options: INVESTMENT_GOALS },
      areaSqm: { options: AREA_SQM_BANDS },
      purchaseMethod: { options: PURCHASE_METHODS },
      investmentTimeline: { options: INVESTMENT_TIMELINES },
      investmentBudgetUsd: { options: INVESTMENT_BUDGETS_USD },
      priorInvestmentExperience: { options: PRIOR_INVESTMENT_EXPERIENCES },
    },
    market_research: {
      marketInterests: { options: MARKET_INTERESTS, max: MARKET_INTERESTS_MAX },
      researchGoal: { options: RESEARCH_GOALS },
      researchLocation: { scopes: RESEARCH_LOCATION_SCOPES, max: LOCATION_CHOICE_MAX },
      purchaseHorizon: { options: PURCHASE_HORIZONS },
    },
  },
} as const;

export type QuestionnaireDefinition = typeof QUESTIONNAIRE_DEFINITION;
