import type { CountryCode } from 'libphonenumber-js';
import type { MarzCityCode } from '@/lib/questionnaire/marz-cities';
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
import type { MarzCityDraft, MarzCityOtherDraft } from './marz-city-draft';

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
  residenceMarzCity: MarzCityCode | '';
  residenceMarzCityOther: string;
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
  marzCity: MarzCityDraft;
  marzCityOther: MarzCityOtherDraft;
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
  residenceMarzCity: '',
  residenceMarzCityOther: '',
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
  marzCity: { aragatsotn: '', ararat: '', kotayk: '' },
  marzCityOther: { aragatsotn: '', ararat: '', kotayk: '' },
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
