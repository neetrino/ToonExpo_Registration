import type {
  AgeBand,
  AreaSqmBand,
  DecisionStage,
  InvestmentBudgetUsd,
  InvestmentPropertyType,
  InvestmentTimeline,
  MarketInterest,
  PriorInvestmentExperience,
  PurchaseHorizon,
  PurchaseMethod,
  VisitPurpose,
} from '@/lib/questionnaire/types';
import type {
  ARMENIA_CONNECTIONS,
  ARMENIA_VISIT_TIMINGS,
  PROPERTY_COUNTRY_SCOPES,
  PURCHASE_BUDGETS_USD,
  PURCHASE_MOTIVES,
  SPYURK_INTEREST_TYPES,
  SPYURK_INVESTMENT_GOALS,
  SPYURK_RESEARCH_GOALS,
} from '@/lib/questionnaire/spyurk/options';

export type ArmeniaConnection = (typeof ARMENIA_CONNECTIONS)[number];
export type PurchaseMotive = (typeof PURCHASE_MOTIVES)[number];
export type SpyurkInterestType = (typeof SPYURK_INTEREST_TYPES)[number];
export type PropertyCountryScope = (typeof PROPERTY_COUNTRY_SCOPES)[number];
export type PurchaseBudgetUsd = (typeof PURCHASE_BUDGETS_USD)[number];
export type ArmeniaVisitTiming = (typeof ARMENIA_VISIT_TIMINGS)[number];
export type SpyurkInvestmentGoal = (typeof SPYURK_INVESTMENT_GOALS)[number];
export type SpyurkResearchGoal = (typeof SPYURK_RESEARCH_GOALS)[number];

export type SpyurkResidence = {
  city: string;
  region: string;
};

export type SpyurkPropertyCountry = { scope: 'armenia' } | { scope: 'other'; country: string };

type SpyurkSharedAnswers = {
  ageBand: AgeBand;
  residence: SpyurkResidence;
  armeniaConnection: ArmeniaConnection;
  armeniaConnectionOther?: string;
  purchaseMotives: PurchaseMotive[];
  purchaseMotivesOther?: string;
  newsletter: boolean;
};

export type SpyurkOwnResidenceAnswers = SpyurkSharedAnswers & {
  visitPurpose: 'own_residence';
  interestTypes: SpyurkInterestType[];
  interestTypesOther?: string;
  propertyCountry: SpyurkPropertyCountry;
  areaSqm: AreaSqmBand;
  purchaseMethod: PurchaseMethod;
  purchaseBudgetUsd: PurchaseBudgetUsd;
  decisionStage: DecisionStage;
  armeniaVisitTiming: ArmeniaVisitTiming;
};

export type SpyurkInvestmentAnswers = SpyurkSharedAnswers & {
  visitPurpose: 'investment';
  investmentPropertyTypes: InvestmentPropertyType[];
  investmentPropertyTypeOther?: string;
  propertyCountry: SpyurkPropertyCountry;
  investmentGoal: SpyurkInvestmentGoal;
  areaSqm?: AreaSqmBand;
  purchaseMethod: PurchaseMethod;
  investmentTimeline: InvestmentTimeline;
  investmentBudgetUsd: InvestmentBudgetUsd;
  priorInvestmentExperience: PriorInvestmentExperience;
  priorInvestmentExperienceOther?: string;
  armeniaVisitTiming: ArmeniaVisitTiming;
};

export type SpyurkMarketResearchAnswers = SpyurkSharedAnswers & {
  visitPurpose: 'market_research';
  marketInterests: MarketInterest[];
  researchGoal: SpyurkResearchGoal;
  propertyCountry: SpyurkPropertyCountry;
  purchaseHorizon: PurchaseHorizon;
  armeniaVisitTiming: ArmeniaVisitTiming;
};

export type SpyurkQuestionnaireAnswers =
  SpyurkOwnResidenceAnswers | SpyurkInvestmentAnswers | SpyurkMarketResearchAnswers;

export type { AgeBand, VisitPurpose };
