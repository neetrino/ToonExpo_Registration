import { describe, expect, it } from 'vitest';
import { buildMootqRegistrationAnswers } from '@/lib/integrations/mootq/build-mootq-registration-answers';
import { toMootqOptionLabel } from '@/lib/integrations/mootq/build-mootq-partner-answers';
import {
  Q,
  fixtureQuestion,
  mootqSchemaFixture,
} from '@/lib/integrations/mootq/registration-schema.fixture';
import { FORM_VERSION } from '@/lib/questionnaire/constants';
import { MARZ_CITY_OPTIONS, MARZ_CITY_REGIONS } from '@/lib/questionnaire/marz-cities';
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
  MARKET_INTERESTS,
  MARZ_REGIONS,
  MONTHLY_BUDGETS,
  PRIOR_INVESTMENT_EXPERIENCES,
  PURCHASE_HORIZONS,
  PURCHASE_METHODS,
  RESEARCH_GOALS,
  YEREVAN_DISTRICTS,
} from '@/lib/questionnaire/options';
import { SPYURK_FORM_VERSION } from '@/lib/questionnaire/spyurk/constants';
import { getSpyurkOptionLabel } from '@/lib/questionnaire/spyurk/i18n';
import {
  SPYURK_INVESTMENT_GOALS,
  SPYURK_INTEREST_TYPES,
  SPYURK_RESEARCH_GOALS,
} from '@/lib/questionnaire/spyurk/options';
import { spyurkQuestionnaireAnswersSchema } from '@/lib/questionnaire/spyurk/validate';
import { questionnaireAnswersSchema } from '@/lib/questionnaire/validate';

const identity = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+37499000001',
};

const marketBase = {
  ageBand: '25-34' as const,
  residence: { scope: 'yerevan' as const, district: 'kentron' as const },
  visitPurpose: 'market_research' as const,
  marketInterests: ['new_apartments'] as const,
  researchGoal: 'future_purchase' as const,
  purchaseHorizon: 'up_to_3_months' as const,
  researchLocation: {
    undecided: false,
    yerevanDistricts: ['kentron'] as const,
    marzRegions: [] as const,
  },
};

function isRawCode(value: string): boolean {
  return /^[a-z][a-z0-9_+-]*$/.test(value);
}

function assertAnswerValues(label: string, answers: unknown, formVersion: string): void {
  const parsed =
    formVersion === SPYURK_FORM_VERSION
      ? spyurkQuestionnaireAnswersSchema.safeParse(answers)
      : questionnaireAnswersSchema.safeParse(answers);
  expect(parsed.success, `${label} fixture rejected`).toBe(true);

  const mapped = mootqAnswers(answers, formVersion);
  expect(mapped[Q.firstName], label).toBe('John');
  expect(mapped[Q.email], label).toBe(identity.email);

  for (const [key, value] of Object.entries(mapped)) {
    const items = Array.isArray(value) ? value : [value];
    const question = mootqSchemaFixture.questions.find((item) => item.code === key);
    expect(question, `${label} ${key} is not a schema code`).toBeDefined();
    expect(items.length, `${label} ${key}`).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.trim().length, `${label} ${key}`).toBeGreaterThan(0);
      expect(isRawCode(item), `${label} ${key} sent raw code ${item}`).toBe(false);
      if (question && question.options.length > 0) {
        expect(question.options, `${label} ${key}`).toContain(item);
      }
    }
  }
}

describe('every Mootq questionnaire case', () => {
  it('maps every age, district, interest, goal and horizon without raw codes', () => {
    for (const ageBand of AGE_BANDS) {
      const answers = perMarket({ ageBand });
      assertAnswerValues(`age ${ageBand}`, answers, FORM_VERSION);
      expect(mootqAnswers(answers)[Q.ageBand]).toBe(toMootqOptionLabel('ageBand', ageBand));
    }

    for (const district of YEREVAN_DISTRICTS) {
      const answers = perMarket({
        residence: { scope: 'yerevan', district },
        researchLocation: {
          undecided: false,
          yerevanDistricts: [district],
          marzRegions: [],
        },
      });
      assertAnswerValues(`district ${district}`, answers, FORM_VERSION);
      const mapped = mootqAnswers(answers);
      expect(mapped[Q.residenceYerevan]).toBe(toMootqOptionLabel('yerevanDistrict', district));
      expect(mapped[Q.researchYerevan]).toEqual([toMootqOptionLabel('yerevanDistrict', district)]);
    }

    for (const interest of MARKET_INTERESTS) {
      const answers = perMarket({ marketInterests: [interest] });
      assertAnswerValues(`interest ${interest}`, answers, FORM_VERSION);
      expect(mootqAnswers(answers)[Q.marketInterests]).toEqual([
        toMootqOptionLabel('marketInterest', interest),
      ]);
    }

    for (const researchGoal of RESEARCH_GOALS) {
      const answers = perMarket({ researchGoal });
      assertAnswerValues(`goal ${researchGoal}`, answers, FORM_VERSION);
      expect(mootqAnswers(answers)[Q.researchGoal]).toBe(
        toMootqOptionLabel('researchGoal', researchGoal),
      );
    }

    for (const purchaseHorizon of PURCHASE_HORIZONS) {
      const answers = perMarket({ purchaseHorizon });
      assertAnswerValues(`horizon ${purchaseHorizon}`, answers, FORM_VERSION);
      expect(mootqAnswers(answers)[Q.purchaseHorizon]).toBe(
        toMootqOptionLabel('purchaseHorizon', purchaseHorizon),
      );
    }
  });

  it('maps every marz region, city and free-text place', () => {
    for (const region of MARZ_REGIONS) {
      const cityRegion = MARZ_CITY_REGIONS.find((item) => item === region);
      if (!cityRegion) {
        const answers = perMarket({ residence: { scope: 'marz', region } });
        assertAnswerValues(`marz ${region}`, answers, FORM_VERSION);
        expect(mootqAnswers(answers)[Q.residenceMarz]).toBe(toMootqOptionLabel('marzRegion', region));
        continue;
      }

      for (const city of MARZ_CITY_OPTIONS[cityRegion]) {
        const residence =
          city === 'other'
            ? { scope: 'marz' as const, region, city, cityOther: 'Գառնի' }
            : { scope: 'marz' as const, region, city };
        const answers = perMarket({ residence });
        assertAnswerValues(`marz ${region}/${city}`, answers, FORM_VERSION);
        const detail = String(mootqAnswers(answers)[Q.residenceMarz]);
        expect(detail).toBe(toMootqOptionLabel('marzRegion', region));
      }
    }
  });

  it('maps research-location follow-ups for marz, abroad and three districts', () => {
    const threeDistricts = perMarket({
      researchLocation: {
        undecided: false,
        yerevanDistricts: ['kentron', 'arabkir', 'ajapnyak'],
        marzRegions: [],
      },
    });
    assertAnswerValues('three districts', threeDistricts, FORM_VERSION);
    expect(mootqAnswers(threeDistricts)[Q.researchYerevan]).toEqual(['Կենտրոն', 'Արաբկիր', 'Աջափնյակ']);

    const marz = perMarket({
      researchLocation: {
        undecided: false,
        yerevanDistricts: [],
        marzRegions: ['aragatsotn', 'tavush'],
        marzCities: {
          aragatsotn: { city: 'ashtarak' },
          tavush: { city: 'other', other: 'Բերդ' },
        },
      },
    });
    assertAnswerValues('two marzes', marz, FORM_VERSION);
    expect(mootqAnswers(marz)[Q.researchMarz]).toEqual(['Արագածոտնի մարզ', 'Տավուշի մարզ']);

    for (const country of ['Georgia', 'UAE', 'Հունաստան']) {
      const answers = perMarket({
        residence: { scope: 'abroad', country },
        researchLocation: {
          undecided: false,
          yerevanDistricts: [],
          marzRegions: [],
          abroadCountry: country,
        },
      });
      assertAnswerValues(`abroad ${country}`, answers, FORM_VERSION);
      expect(mootqAnswers(answers)[Q.residenceAbroad]).toBe(country);
      expect(mootqAnswers(answers)[Q.researchAbroad]).toBe(country);
    }
  });

  it('keeps investment and own-residence follow-ups from leaking into other questions', () => {
    for (const propertyType of INVESTMENT_PROPERTY_TYPES) {
      const answers = {
        ageBand: '25-34' as const,
        residence: { scope: 'yerevan' as const, district: 'kentron' as const },
        visitPurpose: 'investment' as const,
        investmentPropertyType: propertyType,
        ...(propertyType === 'other' ? { investmentPropertyTypeOther: 'Հյուրանոց' } : {}),
        locationSeek: {
          yerevanDistricts: [] as const,
          marzRegions: ['kotayk'] as const,
          marzCities: { kotayk: { city: 'abovyan' as const } },
          abroadCountries: [] as const,
        },
        investmentGoal: INVESTMENT_GOALS[0],
        areaSqm: AREA_SQM_BANDS[0],
        purchaseMethod: PURCHASE_METHODS[0],
        investmentTimeline: INVESTMENT_TIMELINES[0],
        investmentBudgetUsd: INVESTMENT_BUDGETS_USD[0],
        priorInvestmentExperience: PRIOR_INVESTMENT_EXPERIENCES[1],
        priorInvestmentExperienceOther: 'UAE',
      };
      assertAnswerValues(`investment ${propertyType}`, answers, FORM_VERSION);
      const mapped = mootqAnswers(answers);
      expect(mapped).not.toHaveProperty(Q.marketInterests);
      expect(mapped).not.toHaveProperty(Q.researchYerevan);
      expect(mapped[Q.residenceYerevan]).toBe('Կենտրոն');
      expect(mapped[Q.investmentKotaykCities]).toEqual(['Աբովյան']);
    }

    for (const interestType of INTEREST_TYPES) {
      const answers = {
        ageBand: '35-44' as const,
        residence: { scope: 'abroad' as const, country: 'Spain' },
        visitPurpose: 'own_residence' as const,
        interestType,
        ...(interestType === 'abroad'
          ? {
              abroadCountries: [ABROAD_COUNTRIES[0], 'other'] as const,
              abroadCountriesOther: 'Portugal',
            }
          : {}),
        locationSeek: {
          yerevanDistricts: ['shengavit'] as const,
          marzRegions: [] as const,
          abroadCountries: [] as const,
        },
        areaSqm: AREA_SQM_BANDS[2],
        purchaseMethod: PURCHASE_METHODS[1],
        monthlyBudget: MONTHLY_BUDGETS[0],
        decisionStage: DECISION_STAGES[0],
      };
      assertAnswerValues(`own residence ${interestType}`, answers, FORM_VERSION);
      expect(mootqAnswers(answers)[Q.residenceAbroad]).toBe('Spain');
      expect(mootqAnswers(answers)).not.toHaveProperty(Q.marketInterests);
    }
  });

  it('maps every Spyurk research goal and does not throw on the other branches', () => {
    for (const researchGoal of SPYURK_RESEARCH_GOALS) {
      const answers = {
        ageBand: '35-44' as const,
        residence: { city: 'Moscow', region: 'Moscow Oblast' },
        armeniaConnection: 'family_from_armenia' as const,
        purchaseMotives: ['own_stays'] as const,
        visitPurpose: 'market_research' as const,
        marketInterests: ['foreign_property'] as const,
        researchGoal,
        propertyCountry: { scope: 'other' as const, country: 'Georgia' },
        purchaseHorizon: 'no_plans' as const,
        armeniaVisitTiming: 'not_planning' as const,
      };
      assertAnswerValues(`spyurk goal ${researchGoal}`, answers, SPYURK_FORM_VERSION);
      const label = getSpyurkOptionLabel('researchGoal', researchGoal, 'hy');
      const mapped = mootqAnswers(answers, SPYURK_FORM_VERSION);
      if (fixtureQuestion(Q.researchGoal).options.includes(label)) {
        expect(mapped[Q.researchGoal]).toBe(label);
      } else {
        expect(mapped).not.toHaveProperty(Q.researchGoal);
      }
    }

    for (const interest of SPYURK_INTEREST_TYPES) {
      const answers = {
        ageBand: '35-44' as const,
        residence: { city: 'Sochi', region: 'Krasnodar' },
        armeniaConnection: 'other' as const,
        armeniaConnectionOther: 'Ընկերներ',
        purchaseMotives: ['other'] as const,
        purchaseMotivesOther: 'Աշխատանք',
        visitPurpose: 'own_residence' as const,
        interestTypes: [interest],
        ...(interest === 'other' ? { interestTypesOther: 'Ավտոտնակ' } : {}),
        propertyCountry: { scope: 'armenia' as const },
        areaSqm: '70-90' as const,
        purchaseMethod: 'cash' as const,
        purchaseBudgetUsd: '150k-250k' as const,
        decisionStage: 'just_researching' as const,
        armeniaVisitTiming: 'within_3_months' as const,
      };
      assertAnswerValues(`spyurk home ${interest}`, answers, SPYURK_FORM_VERSION);
    }

    for (const goal of SPYURK_INVESTMENT_GOALS) {
      const answers = {
        ageBand: '45-54' as const,
        residence: { city: 'Lyon', region: 'Auvergne' },
        armeniaConnection: 'born_in_armenia' as const,
        purchaseMotives: ['investment_income'] as const,
        visitPurpose: 'investment' as const,
        investmentPropertyTypes: ['land'] as const,
        propertyCountry: { scope: 'armenia' as const },
        investmentGoal: goal,
        purchaseMethod: 'cash' as const,
        investmentTimeline: '6-12_months' as const,
        investmentBudgetUsd: '150k-300k' as const,
        priorInvestmentExperience: 'yes_both' as const,
        priorInvestmentExperienceOther: 'UAE',
        armeniaVisitTiming: 'within_1_year' as const,
      };
      assertAnswerValues(`spyurk invest ${goal}`, answers, SPYURK_FORM_VERSION);
      expect(mootqAnswers(answers, SPYURK_FORM_VERSION)).not.toHaveProperty(Q.marketInterests);
    }
  });
});

function perMarket(patch: Record<string, unknown>) {
  return { ...marketBase, ...patch };
}

function mootqAnswers(answers: unknown, formVersion: string = FORM_VERSION) {
  return buildMootqRegistrationAnswers({ ...identity, formVersion, answers }, mootqSchemaFixture);
}
