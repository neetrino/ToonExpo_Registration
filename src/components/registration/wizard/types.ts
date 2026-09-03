import type { CountryCode } from 'libphonenumber-js';
import type {
  AbroadCountry,
  AgeBand,
  AreaSqmBand,
  DecisionStage,
  InterestType,
  InvestmentBudgetUsd,
  InvestmentGoal,
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
  ResearchLocationScope,
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
  | 'investment-location'
  | 'investment-goal'
  | 'investment-size'
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
  residenceScope: LocationSeekScope | '';
  residenceDistrict: YerevanDistrict | '';
  residenceRegion: MarzRegion | '';
  residenceCountry: string;
  visitPurpose: VisitPurpose | '';
  interestType: InterestType | '';
  abroadCountries: AbroadCountry[];
  abroadCountriesOther: string;
  locationSeekScopes: LocationSeekScope[];
  locationSeekAbroadCountries: AbroadCountry[];
  locationSeekAbroadOther: string;
  yerevanDistricts: YerevanDistrict[];
  marzRegions: MarzRegion[];
  areaSqm: AreaSqmBand | '';
  purchaseMethod: PurchaseMethod | '';
  monthlyBudget: MonthlyBudget | '';
  decisionStage: DecisionStage | '';
  investmentPropertyType: InvestmentPropertyType | '';
  investmentPropertyTypeOther: string;
  investmentGoal: InvestmentGoal | '';
  investmentTimeline: InvestmentTimeline | '';
  investmentBudgetUsd: InvestmentBudgetUsd | '';
  priorInvestmentExperience: PriorInvestmentExperience | '';
  priorInvestmentExperienceOther: string;
  marketInterests: MarketInterest[];
  researchGoal: ResearchGoal | '';
  researchScopes: ResearchLocationScope[];
  researchAbroadCountry: string;
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
  residenceScope: '',
  residenceDistrict: '',
  residenceRegion: '',
  residenceCountry: '',
  visitPurpose: '',
  interestType: '',
  abroadCountries: [],
  abroadCountriesOther: '',
  locationSeekScopes: [],
  locationSeekAbroadCountries: [],
  locationSeekAbroadOther: '',
  yerevanDistricts: [],
  marzRegions: [],
  areaSqm: '',
  purchaseMethod: '',
  monthlyBudget: '',
  decisionStage: '',
  investmentPropertyType: '',
  investmentPropertyTypeOther: '',
  investmentGoal: '',
  investmentTimeline: '',
  investmentBudgetUsd: '',
  priorInvestmentExperience: '',
  priorInvestmentExperienceOther: '',
  marketInterests: [],
  researchGoal: '',
  researchScopes: [],
  researchAbroadCountry: '',
  purchaseHorizon: '',
  newsletter: null,
  privacyConsent: false,
  website: '',
};
