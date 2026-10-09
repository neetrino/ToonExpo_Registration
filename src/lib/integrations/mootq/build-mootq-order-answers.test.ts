import { describe, expect, it } from 'vitest';
import { buildMootqOrderPerUser } from '@/lib/integrations/mootq/build-mootq-order-answers';
import { MOOTQ_QUESTION } from '@/lib/integrations/mootq/mootq-order-ids';
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

function perUser(answers: unknown, formVersion: string = FORM_VERSION) {
  return buildMootqOrderPerUser({ ...identity, formVersion, answers });
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
    expect(perUser(baseMarketResearch)[MOOTQ_QUESTION.residenceDetail]).toBe('Կենտրոն');

    const marzCity = perUser({
      ...baseMarketResearch,
      residence: {
        scope: 'marz',
        region: 'kotayk',
        city: 'abovyan',
      },
    });
    expect(marzCity[MOOTQ_QUESTION.residenceScope]).toBe('Մարզ');
    expect(marzCity[MOOTQ_QUESTION.residenceDetail]).toBe('Կոտայքի մարզ — Աբովյան');

    const marzOther = perUser({
      ...baseMarketResearch,
      residence: {
        scope: 'marz',
        region: 'kotayk',
        city: 'other',
        cityOther: 'Գառնի',
      },
    });
    expect(marzOther[MOOTQ_QUESTION.residenceDetail]).toBe('Կոտայքի մարզ — Գառնի');

    const marzOnly = perUser({
      ...baseMarketResearch,
      residence: { scope: 'marz', region: 'shirak' },
    });
    expect(marzOnly[MOOTQ_QUESTION.residenceDetail]).toBe('Շիրակի մարզ');

    const abroad = perUser({
      ...baseMarketResearch,
      residence: { scope: 'abroad', country: 'Georgia' },
    });
    expect(abroad[MOOTQ_QUESTION.residenceScope]).toBe('Արտերկիր');
    expect(abroad[MOOTQ_QUESTION.residenceDetail]).toBe('Georgia');
  });

  it('maps market-research location follow-ups and omits details when undecided', () => {
    const districts = perUser({
      ...baseMarketResearch,
      marketInterests: ['new_apartments', 'price_trends'],
      researchLocation: {
        undecided: false,
        yerevanDistricts: ['kentron', 'arabkir'],
        marzRegions: [],
      },
    });
    expect(districts[MOOTQ_QUESTION.marketInterests]).toEqual([
      'Նորակառույց բնակարաններ',
      'Շուկայի գնային միտումներ',
    ]);
    expect(districts[MOOTQ_QUESTION.researchLocationScope]).toBe('Երևան');
    expect(districts[MOOTQ_QUESTION.researchLocationDetails]).toEqual(['Կենտրոն', 'Արաբկիր']);

    const marz = perUser({
      ...baseMarketResearch,
      researchLocation: {
        undecided: false,
        yerevanDistricts: [],
        marzRegions: ['kotayk'],
        marzCities: { kotayk: { city: 'other', other: 'Գառնի' } },
      },
    });
    expect(marz[MOOTQ_QUESTION.researchLocationScope]).toBe('Մարզ');
    expect(marz[MOOTQ_QUESTION.researchLocationDetails]).toEqual(['Կոտայքի մարզ — Գառնի']);

    const abroad = perUser({
      ...baseMarketResearch,
      researchLocation: {
        undecided: false,
        yerevanDistricts: [],
        marzRegions: [],
        abroadCountry: 'Georgia',
      },
    });
    expect(abroad[MOOTQ_QUESTION.researchLocationScope]).toBe('Արտերկիր');
    expect(abroad[MOOTQ_QUESTION.researchLocationDetails]).toEqual(['Georgia']);

    const undecided = perUser({
      ...baseMarketResearch,
      researchLocation: {
        undecided: true,
        yerevanDistricts: [],
        marzRegions: [],
      },
    });
    expect(undecided[MOOTQ_QUESTION.researchLocationScope]).toBe('Դեռ չեմ կողմնորոշվել');
    expect(undecided).not.toHaveProperty(MOOTQ_QUESTION.researchLocationDetails);
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
    const investment = perUser({
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

    expect(investment[MOOTQ_QUESTION.visitPurpose]).toBe('Հետաքրքրված եմ ներդրումներով');
    expect(investment[MOOTQ_QUESTION.residenceDetail]).toBe('Արաբկիր');
    expect(investment).not.toHaveProperty(MOOTQ_QUESTION.marketInterests);
    expect(investment).not.toHaveProperty(MOOTQ_QUESTION.researchLocationDetails);
    expectFilled(investment[MOOTQ_QUESTION.ageBand]);

    const ownResidence = perUser({
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

    expect(ownResidence[MOOTQ_QUESTION.visitPurpose]).toBe(
      'Անշարժ գույքի գնում սեփական բնակության համար',
    );
    expect(ownResidence[MOOTQ_QUESTION.residenceDetail]).toBe('UAE');
    expect(ownResidence).not.toHaveProperty(MOOTQ_QUESTION.marketInterests);
  });

  it('maps Spyurk market research without throwing and keeps branch questions apart', () => {
    const research = perUser(
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

    expect(research[MOOTQ_QUESTION.residenceScope]).toBe('Արտերկիր');
    expect(research[MOOTQ_QUESTION.residenceDetail]).toBe('Moscow, Moscow Oblast');
    expect(research[MOOTQ_QUESTION.researchGoal]).toBe(
      'Հնարավոր տեղափոխության համար դեպի Հայաստան',
    );
    expect(research[MOOTQ_QUESTION.newsletter]).toBe('Այո');
    expect(research).not.toHaveProperty(MOOTQ_QUESTION.researchLocationScope);

    const ownResidence = perUser(
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

    expect(ownResidence[MOOTQ_QUESTION.visitPurpose]).toBe(
      'Անշարժ գույքի գնում սեփական բնակության համար',
    );
    expect(ownResidence).not.toHaveProperty(MOOTQ_QUESTION.marketInterests);
    expectFilled(ownResidence[MOOTQ_QUESTION.residenceDetail]);
  });

  it('still builds an order when answers are missing or invalid', () => {
    expect(perUser(undefined)).toMatchObject({
      [MOOTQ_QUESTION.firstName]: 'John',
      [MOOTQ_QUESTION.email]: 'john.doe@example.com',
    });
    expect(perUser({ visitPurpose: 'investment' })).not.toHaveProperty(MOOTQ_QUESTION.visitPurpose);

    const payload = buildMootqPushPayload({
      ...identity,
      sourceRegistrationId: 'reg_case',
      ticketCode: 'TEABCDEFGHIJK',
      registeredAt: new Date('2026-10-09T07:00:00.000Z'),
      locale: 'ru',
      formVersion: FORM_VERSION,
      answers: baseMarketResearch,
    });
    expect(payload.event_id).toBe(21);
    expect(payload.items).toEqual([{ ticket_type_id: 56, quantity: 1 }]);
    expect(payload.external_order_ref).toBe('reg_case');
    for (const value of Object.values(payload.answers.per_user)) {
      expectFilled(value);
    }
  });
});
