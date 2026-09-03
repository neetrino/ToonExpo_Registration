import type {
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

export type AgeBand = (typeof AGE_BANDS)[number];
export type VisitPurpose = (typeof VISIT_PURPOSES)[number];
export type InterestType = (typeof INTEREST_TYPES)[number];
export type AbroadCountry = (typeof ABROAD_COUNTRIES)[number];
export type YerevanDistrict = (typeof YEREVAN_DISTRICTS)[number];
export type MarzRegion = (typeof MARZ_REGIONS)[number];
export type LocationSeekScope = (typeof LOCATION_SEEK_SCOPES)[number];
export type ResearchLocationScope = (typeof RESEARCH_LOCATION_SCOPES)[number];
export type AreaSqmBand = (typeof AREA_SQM_BANDS)[number];
export type PurchaseMethod = (typeof PURCHASE_METHODS)[number];
export type MonthlyBudget = (typeof MONTHLY_BUDGETS)[number];
export type DecisionStage = (typeof DECISION_STAGES)[number];
export type InvestmentPropertyType = (typeof INVESTMENT_PROPERTY_TYPES)[number];
export type InvestmentGoal = (typeof INVESTMENT_GOALS)[number];
export type InvestmentTimeline = (typeof INVESTMENT_TIMELINES)[number];
export type InvestmentBudgetUsd = (typeof INVESTMENT_BUDGETS_USD)[number];
export type PriorInvestmentExperience = (typeof PRIOR_INVESTMENT_EXPERIENCES)[number];
export type MarketInterest = (typeof MARKET_INTERESTS)[number];
export type ResearchGoal = (typeof RESEARCH_GOALS)[number];
export type PurchaseHorizon = (typeof PURCHASE_HORIZONS)[number];

export type ResidencePlace =
  | { scope: 'yerevan'; district: YerevanDistrict }
  | { scope: 'marz'; region: MarzRegion }
  | { scope: 'abroad'; country: string };

export type LocationChoice = {
  yerevanDistricts: YerevanDistrict[];
  marzRegions: MarzRegion[];
  abroadCountries: AbroadCountry[];
  abroadCountriesOther?: string;
};

export type ResearchLocation = {
  undecided: boolean;
  yerevanDistricts: YerevanDistrict[];
  marzRegions: MarzRegion[];
  abroadCountry?: string;
};

type SharedAnswers = {
  ageBand: AgeBand;
  residence: ResidencePlace;
  newsletter: boolean;
};

export type OwnResidenceAnswers = SharedAnswers & {
  visitPurpose: 'own_residence';
  interestType: InterestType;
  abroadCountries?: AbroadCountry[];
  abroadCountriesOther?: string;
  locationSeek: LocationChoice;
  areaSqm: AreaSqmBand;
  purchaseMethod: PurchaseMethod;
  monthlyBudget: MonthlyBudget;
  decisionStage: DecisionStage;
};

export type InvestmentAnswers = SharedAnswers & {
  visitPurpose: 'investment';
  investmentPropertyType: InvestmentPropertyType;
  investmentPropertyTypeOther?: string;
  locationSeek: LocationChoice;
  investmentGoal: InvestmentGoal;
  areaSqm: AreaSqmBand;
  purchaseMethod: PurchaseMethod;
  investmentTimeline: InvestmentTimeline;
  investmentBudgetUsd: InvestmentBudgetUsd;
  priorInvestmentExperience: PriorInvestmentExperience;
  priorInvestmentExperienceOther?: string;
};

export type MarketResearchAnswers = SharedAnswers & {
  visitPurpose: 'market_research';
  marketInterests: MarketInterest[];
  researchGoal: ResearchGoal;
  researchLocation: ResearchLocation;
  purchaseHorizon: PurchaseHorizon;
};

export type QuestionnaireAnswers = OwnResidenceAnswers | InvestmentAnswers | MarketResearchAnswers;
