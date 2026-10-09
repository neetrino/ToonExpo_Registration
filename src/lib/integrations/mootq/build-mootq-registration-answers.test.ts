import { describe, expect, it } from 'vitest';
import { buildMootqRegistrationAnswers } from '@/lib/integrations/mootq/build-mootq-registration-answers';
import { Q, mootqSchemaFixture } from '@/lib/integrations/mootq/registration-schema.fixture';
import { buildMootqPushPayload } from '@/lib/integrations/mootq/push-payload';
import { FORM_VERSION } from '@/lib/questionnaire/constants';
import {
  AGE_BANDS,
  MARKET_INTERESTS,
  PURCHASE_HORIZONS,
  RESEARCH_GOALS,
  YEREVAN_DISTRICTS,
} from '@/lib/questionnaire/options';
import { SPYURK_FORM_VERSION } from '@/lib/questionnaire/spyurk/constants';
import { toMootqOptionLabel } from '@/lib/integrations/mootq/build-mootq-partner-answers';

const identity = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+37499000001',
};

const baseMarketResearch = {
  ageBand: '25-34',
  residence: { scope: 'yerevan', district: 'kentron' },
  visitPurpose: 'market_research',
  marketInterests: ['new_apartments'],
  researchGoal: 'future_purchase',
  purchaseHorizon: 'up_to_3_months',
  researchLocation: {
    undecided: false,
    yerevanDistricts: ['kentron'],
    marzRegions: [],
  },
};

function mootqAnswers(answers: unknown, formVersion: string = FORM_VERSION) {
  return buildMootqRegistrationAnswers({ ...identity, formVersion, answers }, mootqSchemaFixture);
}

function expectFilled(value: string | string[] | undefined): void {
  expect(value).toBeDefined();
  if (Array.isArray(value)) {
    expect(value.length).toBeGreaterThan(0);
    expect(value.every((item) => item.trim().length > 0)).toBe(true);
    return;
  }
  expect(typeof value).toBe('string');
  expect(value?.trim().length).toBeGreaterThan(0);
}

describe('Mootq order sub-questions', () => {
  it('maps every residence follow-up into the confirmed detail question', () => {
    expect(mootqAnswers(baseMarketResearch)[Q.residenceYerevan]).toBe('Կենտրոն');

    const marzCity = mootqAnswers({
      ...baseMarketResearch,
      residence: {
        scope: 'marz',
        region: 'kotayk',
        city: 'abovyan',
      },
    });
    expect(marzCity[Q.residenceScope]).toBe('Մարզ');
    expect(marzCity[Q.residenceMarz]).toBe('Կոտայքի մարզ');
    expect(marzCity).not.toHaveProperty(Q.residenceYerevan);

    const marzOther = mootqAnswers({
      ...baseMarketResearch,
      residence: {
        scope: 'marz',
        region: 'kotayk',
        city: 'other',
        cityOther: 'Գառնի',
      },
    });
    expect(marzOther[Q.residenceMarz]).toBe('Կոտայքի մարզ');

    const marzOnly = mootqAnswers({
      ...baseMarketResearch,
      residence: { scope: 'marz', region: 'shirak' },
    });
    expect(marzOnly[Q.residenceMarz]).toBe('Շիրակի մարզ');

    const abroad = mootqAnswers({
      ...baseMarketResearch,
      residence: { scope: 'abroad', country: 'Georgia' },
    });
    expect(abroad[Q.residenceScope]).toBe('Արտերկիր');
    expect(abroad[Q.residenceAbroad]).toBe('Georgia');
  });

  it('maps market-research location follow-ups and omits details when undecided', () => {
    const districts = mootqAnswers({
      ...baseMarketResearch,
      marketInterests: ['new_apartments', 'price_trends'],
      researchLocation: {
        undecided: false,
        yerevanDistricts: ['kentron', 'arabkir'],
        marzRegions: [],
      },
    });
    expect(districts[Q.marketInterests]).toEqual([
      'Նորակառույց բնակարաններ',
      'Շուկայի գնային միտումներ',
    ]);
    expect(districts[Q.researchLocationScope]).toBe('Երևան');
    expect(districts[Q.researchYerevan]).toEqual(['Կենտրոն', 'Արաբկիր']);

    const marz = mootqAnswers({
      ...baseMarketResearch,
      researchLocation: {
        undecided: false,
        yerevanDistricts: [],
        marzRegions: ['kotayk'],
        marzCities: { kotayk: { city: 'other', other: 'Գառնի' } },
      },
    });
    expect(marz[Q.researchLocationScope]).toBe('Մարզ');
    expect(marz[Q.researchMarz]).toEqual(['Կոտայքի մարզ']);
    expect(marz).not.toHaveProperty(Q.researchYerevan);

    const abroad = mootqAnswers({
      ...baseMarketResearch,
      researchLocation: {
        undecided: false,
        yerevanDistricts: [],
        marzRegions: [],
        abroadCountry: 'Georgia',
      },
    });
    expect(abroad[Q.researchLocationScope]).toBe('Արտերկիր');
    expect(abroad[Q.researchAbroad]).toBe('Georgia');

    const undecided = mootqAnswers({
      ...baseMarketResearch,
      researchLocation: {
        undecided: true,
        yerevanDistricts: [],
        marzRegions: [],
      },
    });
    expect(undecided[Q.researchLocationScope]).toBe('Դեռ չեմ կողմնորոշվել');
    expect(undecided).not.toHaveProperty(Q.researchYerevan);
    expect(undecided).not.toHaveProperty(Q.researchMarz);
    expect(undecided).not.toHaveProperty(Q.researchAbroad);
  });

  it('uses an Armenian label for every mapped option code', () => {
    for (const code of AGE_BANDS) {
      expect(toMootqOptionLabel('ageBand', code)).not.toBe(code);
    }
    for (const code of MARKET_INTERESTS) {
      expect(toMootqOptionLabel('marketInterest', code)).not.toBe(code);
    }
    for (const code of RESEARCH_GOALS) {
      expect(toMootqOptionLabel('researchGoal', code)).not.toBe(code);
    }
    for (const code of PURCHASE_HORIZONS) {
      expect(toMootqOptionLabel('purchaseHorizon', code)).not.toBe(code);
    }
    for (const code of YEREVAN_DISTRICTS) {
      expect(toMootqOptionLabel('yerevanDistrict', code)).not.toBe(code);
    }
  });

  it('keeps other visit purposes off the market-research question ids', () => {
    const investment = mootqAnswers({
      ageBand: '25-34',
      residence: { scope: 'yerevan', district: 'arabkir' },
      visitPurpose: 'investment',
      investmentPropertyType: 'other',
      investmentPropertyTypeOther: 'Հյուրանոց',
      locationSeek: {
        yerevanDistricts: [],
        marzRegions: [],
        abroadCountries: ['other'],
        abroadCountriesOther: 'Portugal',
      },
      investmentGoal: 'rental_income',
      areaSqm: '50-70',
      purchaseMethod: 'cash',
      investmentTimeline: 'up_to_3_months',
      investmentBudgetUsd: 'up_to_150k',
      priorInvestmentExperience: 'no_first',
    });

    expect(investment[Q.visitPurpose]).toBe('Հետաքրքրված եմ ներդրումներով');
    expect(investment[Q.residenceYerevan]).toBe('Արաբկիր');
    expect(investment).not.toHaveProperty(Q.marketInterests);
    expect(investment).not.toHaveProperty(Q.researchYerevan);
    expectFilled(investment[Q.ageBand]);

    const ownResidence = mootqAnswers({
      ageBand: '35-44',
      residence: { scope: 'abroad', country: 'UAE' },
      visitPurpose: 'own_residence',
      interestType: 'abroad',
      abroadCountries: ['uae', 'other'],
      abroadCountriesOther: 'Portugal',
      locationSeek: {
        yerevanDistricts: ['kentron'],
        marzRegions: [],
        abroadCountries: [],
      },
      areaSqm: '70-90',
      purchaseMethod: 'mortgage',
      monthlyBudget: '300k-500k',
      decisionStage: 'searching_6_months',
    });

    expect(ownResidence[Q.visitPurpose]).toBe('Անշարժ գույքի գնում սեփական բնակության համար');
    expect(ownResidence[Q.residenceAbroad]).toBe('UAE');
    expect(ownResidence).not.toHaveProperty(Q.marketInterests);
  });

  it('maps Spyurk market research without throwing and keeps branch questions apart', () => {
    const research = mootqAnswers(
      {
        ageBand: '35-44',
        residence: { city: 'Moscow', region: 'Moscow Oblast' },
        armeniaConnection: 'family_from_armenia',
        purchaseMotives: ['own_stays'],
        visitPurpose: 'market_research',
        marketInterests: ['new_apartments'],
        researchGoal: 'possible_relocation',
        propertyCountry: { scope: 'other', country: 'Georgia' },
        purchaseHorizon: 'no_plans',
        armeniaVisitTiming: 'not_planning',
        newsletter: true,
      },
      SPYURK_FORM_VERSION,
    );

    expect(research[Q.residenceScope]).toBe('Արտերկիր');
    expect(research[Q.residenceAbroad]).toBe('Moscow, Moscow Oblast');
    expect(research).not.toHaveProperty(Q.researchGoal);
    expect(research[Q.newsletter]).toBe('Այո');
    expect(research).not.toHaveProperty(Q.researchLocationScope);

    const ownResidence = mootqAnswers(
      {
        ageBand: '35-44',
        residence: { city: 'Moscow', region: 'Moscow Oblast' },
        armeniaConnection: 'other',
        armeniaConnectionOther: 'Ընկերներ',
        purchaseMotives: ['other'],
        purchaseMotivesOther: 'Աշխատանք',
        visitPurpose: 'own_residence',
        interestTypes: ['apartment_new', 'other'],
        interestTypesOther: 'Ավտոտնակ',
        propertyCountry: { scope: 'armenia' },
        areaSqm: '70-90',
        purchaseMethod: 'cash',
        purchaseBudgetUsd: '150k-250k',
        decisionStage: 'searching_6_months',
        armeniaVisitTiming: 'within_3_months',
      },
      SPYURK_FORM_VERSION,
    );

    expect(ownResidence[Q.visitPurpose]).toBe('Անշարժ գույքի գնում սեփական բնակության համար');
    expect(ownResidence).not.toHaveProperty(Q.marketInterests);
    expectFilled(ownResidence[Q.residenceAbroad]);
  });

  it('still builds a registration when answers are missing or invalid', () => {
    expect(mootqAnswers(undefined)).toMatchObject({
      [Q.firstName]: 'John',
      [Q.email]: 'john.doe@example.com',
    });
    expect(mootqAnswers({ visitPurpose: 'investment' })).not.toHaveProperty(Q.visitPurpose);

    const { payload } = buildMootqPushPayload(
      {
        ...identity,
        sourceRegistrationId: 'reg_case',
        ticketCode: 'TEABCDEFGHIJK',
        registeredAt: new Date('2026-10-09T07:00:00.000Z'),
        locale: 'ru',
        formVersion: FORM_VERSION,
        answers: baseMarketResearch,
      },
      mootqSchemaFixture,
    );
    expect(payload.eventKey).toBe('toon-expo-2026');
    expect(payload.sourceRegistrationId).toBe('reg_case');
    expect(payload.locale).toBe('ru');
    for (const value of Object.values(payload.answers)) {
      expectFilled(value);
    }
  });
});
