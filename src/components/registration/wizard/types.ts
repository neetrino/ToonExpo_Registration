import type { CountryCode } from 'libphonenumber-js';
import type {
  AbroadCountry,
  AgeBand,
  AreaSqmBand,
  DecisionStage,
  InterestType,
  InterestedWhere,
  InvestmentBudgetUsd,
  InvestmentGoal,
  InvestmentMarket,
  InvestmentPropertyType,
  InvestmentTimeline,
  LocationSeekScope,
  MarketInterest,
  MarzRegion,
  MonthlyBudget,
  PriorInvestmentExperience,
  PurchaseHorizon,
  PurchaseMethod,
  ResearchGoal,
  VisitPurpose,
  YerevanDistrict,
} from '@/lib/questionnaire/types';
import { DEFAULT_PHONE_COUNTRY } from '@/lib/validation/constants';

export type WizardStepId =
  | 'identity'
  | 'profile'
  | 'own-residence-interest'
  | 'own-residence-location'
  | 'own-residence-size'
  | 'own-residence-budget'
  | 'investment-type'
  | 'investment-goal'
  | 'investment-budget'
  | 'market-research-focus'
  | 'market-research-where'
  | 'finish';

export type WizardState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCountry: CountryCode;
  ageBand: AgeBand | '';
  visitPurpose: VisitPurpose | '';
  interestType: InterestType | '';
  abroadCountries: AbroadCountry[];
  abroadCountriesOther: string;
  locationSeekScope: LocationSeekScope | '';
  yerevanDistricts: YerevanDistrict[];
  marzRegions: MarzRegion[];
  areaSqm: AreaSqmBand | '';
  purchaseMethod: PurchaseMethod | '';
  monthlyBudget: MonthlyBudget | '';
  decisionStage: DecisionStage | '';
  investmentPropertyType: InvestmentPropertyType | '';
  investmentPropertyTypeOther: string;
  investmentMarket: InvestmentMarket | '';
  investmentMarketOther: string;
  investmentGoal: InvestmentGoal | '';
  investmentTimeline: InvestmentTimeline | '';
  investmentBudgetUsd: InvestmentBudgetUsd | '';
  priorInvestmentExperience: PriorInvestmentExperience | '';
  marketInterests: MarketInterest[];
  researchGoal: ResearchGoal | '';
  interestedWhere: InterestedWhere | '';
  interestedWhereOther: string;
  purchaseHorizon: PurchaseHorizon | '';
  newsletter: boolean | null;
  privacyConsent: boolean;
  website: string;
};

export type WizardFieldErrors = Partial<Record<string, string>>;

export const initialWizardState: WizardState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  phoneCountry: DEFAULT_PHONE_COUNTRY,
  ageBand: '',
  visitPurpose: '',
  interestType: '',
  abroadCountries: [],
  abroadCountriesOther: '',
  locationSeekScope: '',
  yerevanDistricts: [],
  marzRegions: [],
  areaSqm: '',
  purchaseMethod: '',
  monthlyBudget: '',
  decisionStage: '',
  investmentPropertyType: '',
  investmentPropertyTypeOther: '',
  investmentMarket: '',
  investmentMarketOther: '',
  investmentGoal: '',
  investmentTimeline: '',
  investmentBudgetUsd: '',
  priorInvestmentExperience: '',
  marketInterests: [],
  researchGoal: '',
  interestedWhere: '',
  interestedWhereOther: '',
  purchaseHorizon: '',
  newsletter: null,
  privacyConsent: false,
  website: '',
};
