import type { CountryCode } from 'libphonenumber-js';
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
  ArmeniaConnection,
  ArmeniaVisitTiming,
  PropertyCountryScope,
  PurchaseBudgetUsd,
  PurchaseMotive,
  SpyurkInterestType,
  SpyurkInvestmentGoal,
  SpyurkResearchGoal,
} from '@/lib/questionnaire/spyurk/types';
import { SPYURK_DEFAULT_PHONE_COUNTRY } from '@/lib/questionnaire/spyurk/constants';

export type SpyurkWizardStepId =
  | 'identity'
  | 'profile'
  | 'background'
  | 'own-interest'
  | 'own-details'
  | 'own-followup'
  | 'investment-type'
  | 'investment-goal'
  | 'investment-details'
  | 'investment-followup'
  | 'research-focus'
  | 'research-followup'
  | 'finish';

export type SpyurkWizardState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCountry: CountryCode;
  ageBand: AgeBand | '';
  residenceCity: string;
  residenceRegion: string;
  armeniaConnection: ArmeniaConnection | '';
  armeniaConnectionOther: string;
  purchaseMotives: PurchaseMotive[];
  purchaseMotivesOther: string;
  visitPurpose: VisitPurpose | '';
  interestTypes: SpyurkInterestType[];
  interestTypesOther: string;
  propertyCountryScope: PropertyCountryScope | '';
  propertyCountryOther: string;
  areaSqm: AreaSqmBand | '';
  purchaseMethod: PurchaseMethod | '';
  purchaseBudgetUsd: PurchaseBudgetUsd | '';
  decisionStage: DecisionStage | '';
  armeniaVisitTiming: ArmeniaVisitTiming | '';
  investmentPropertyTypes: InvestmentPropertyType[];
  investmentPropertyTypeOther: string;
  investmentGoal: SpyurkInvestmentGoal | '';
  investmentTimeline: InvestmentTimeline | '';
  investmentBudgetUsd: InvestmentBudgetUsd | '';
  priorInvestmentExperience: PriorInvestmentExperience | '';
  priorInvestmentExperienceOther: string;
  marketInterests: MarketInterest[];
  researchGoal: SpyurkResearchGoal | '';
  purchaseHorizon: PurchaseHorizon | '';
  newsletter: boolean | null;
  privacyConsent: boolean;
  website: string;
};

export type SpyurkWizardFieldErrors = Partial<Record<string, string>>;

export const initialSpyurkWizardState: SpyurkWizardState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  phoneCountry: SPYURK_DEFAULT_PHONE_COUNTRY,
  ageBand: '',
  residenceCity: '',
  residenceRegion: '',
  armeniaConnection: '',
  armeniaConnectionOther: '',
  purchaseMotives: [],
  purchaseMotivesOther: '',
  visitPurpose: '',
  interestTypes: [],
  interestTypesOther: '',
  propertyCountryScope: '',
  propertyCountryOther: '',
  areaSqm: '',
  purchaseMethod: '',
  purchaseBudgetUsd: '',
  decisionStage: '',
  armeniaVisitTiming: '',
  investmentPropertyTypes: [],
  investmentPropertyTypeOther: '',
  investmentGoal: '',
  investmentTimeline: '',
  investmentBudgetUsd: '',
  priorInvestmentExperience: '',
  priorInvestmentExperienceOther: '',
  marketInterests: [],
  researchGoal: '',
  purchaseHorizon: '',
  newsletter: null,
  privacyConsent: false,
  website: '',
};
