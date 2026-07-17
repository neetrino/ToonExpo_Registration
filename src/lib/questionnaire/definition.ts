import { FORM_VERSION } from '@/lib/questionnaire/constants';
import {
  ABROAD_COUNTRIES,
  AGE_BANDS,
  AREA_SQM_BANDS,
  DECISION_STAGES,
  INTEREST_TYPES,
  INTERESTED_WHERE_OPTIONS,
  INVESTMENT_BUDGETS_USD,
  INVESTMENT_GOALS,
  INVESTMENT_MARKETS,
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
    visitPurpose: { options: VISIT_PURPOSES },
  },
  branches: {
    own_residence: {
      interestType: {
        options: INTEREST_TYPES,
        /** Q8 (locationSeek) opens only for these interest types. */
        locationSeekFor: ['house_townhouse', 'apartment_new'] as const,
      },
      abroadCountries: { options: ABROAD_COUNTRIES, multi: true },
      locationSeek: {
        scopes: LOCATION_SEEK_SCOPES,
        yerevanDistricts: YEREVAN_DISTRICTS,
        marzRegions: MARZ_REGIONS,
      },
      areaSqm: { options: AREA_SQM_BANDS },
      purchaseMethod: { options: PURCHASE_METHODS },
      monthlyBudget: { options: MONTHLY_BUDGETS },
      decisionStage: { options: DECISION_STAGES },
    },
    investment: {
      investmentPropertyType: { options: INVESTMENT_PROPERTY_TYPES },
      investmentMarket: { options: INVESTMENT_MARKETS },
      investmentGoal: { options: INVESTMENT_GOALS },
      investmentTimeline: { options: INVESTMENT_TIMELINES },
      investmentBudgetUsd: { options: INVESTMENT_BUDGETS_USD },
      priorInvestmentExperience: { options: PRIOR_INVESTMENT_EXPERIENCES },
    },
    market_research: {
      marketInterests: { options: MARKET_INTERESTS, max: 3 },
      researchGoal: { options: RESEARCH_GOALS },
      interestedWhere: { options: INTERESTED_WHERE_OPTIONS },
      purchaseHorizon: { options: PURCHASE_HORIZONS },
    },
  },
} as const;

export type QuestionnaireDefinition = typeof QUESTIONNAIRE_DEFINITION;
