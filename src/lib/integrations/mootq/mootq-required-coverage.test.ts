import { describe, expect, it } from 'vitest';
import { MOOTQ_QUESTION_CODE as CODE } from '@/lib/integrations/mootq/mootq-question-codes';
import { buildMootqPushPayload } from '@/lib/integrations/mootq/push-payload';
import { mootqSchemaFixture } from '@/lib/integrations/mootq/registration-schema.fixture';
import { FORM_VERSION } from '@/lib/questionnaire/constants';
import { SPYURK_FORM_VERSION } from '@/lib/questionnaire/spyurk/constants';
import { spyurkQuestionnaireAnswersSchema } from '@/lib/questionnaire/spyurk/validate';
import { questionnaireAnswersSchema } from '@/lib/questionnaire/validate';

const identity = {
  sourceRegistrationId: 'reg_cover',
  ticketCode: 'TEABCDEFGHIJK',
  registeredAt: new Date('2026-10-09T10:00:00.000Z'),
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+37499000001',
  locale: 'hy' as const,
};

const spyurkShared = {
  ageBand: '35-44',
  residence: { city: 'Moscow', region: 'Moscow Oblast' },
  armeniaConnection: 'born_in_armenia',
  purchaseMotives: ['own_stays'],
  armeniaVisitTiming: 'within_3_months',
};

const spyurkOwn = {
  ...spyurkShared,
  visitPurpose: 'own_residence',
  interestTypes: ['apartment_new'],
  propertyCountry: { scope: 'armenia' },
  areaSqm: '70-90',
  purchaseMethod: 'mortgage',
  purchaseBudgetUsd: '150k-250k',
  decisionStage: 'searching_6_months',
};

const spyurkInvestment = {
  ...spyurkShared,
  visitPurpose: 'investment',
  investmentPropertyTypes: ['apartment'],
  propertyCountry: { scope: 'armenia' },
  investmentGoal: 'rental_income',
  areaSqm: '50-70',
  purchaseMethod: 'cash',
  investmentTimeline: '6-12_months',
  investmentBudgetUsd: '150k-300k',
  priorInvestmentExperience: 'yes_abroad',
  priorInvestmentExperienceOther: 'Spain',
};

function generalCase(answers: Record<string, unknown>) {
  const parsed = questionnaireAnswersSchema.safeParse(answers);
  expect(parsed.success).toBe(true);
  return buildMootqPushPayload(
    { ...identity, formVersion: FORM_VERSION, answers: parsed.success ? parsed.data : answers },
    mootqSchemaFixture,
  );
}

function spyurkCase(answers: Record<string, unknown>) {
  const parsed = spyurkQuestionnaireAnswersSchema.safeParse(answers);
  expect(parsed.success).toBe(true);
  return buildMootqPushPayload(
    { ...identity, formVersion: SPYURK_FORM_VERSION, answers },
    mootqSchemaFixture,
  );
}

const location = { yerevanDistricts: ['kentron'], marzRegions: [], abroadCountries: [] };
const generalShared = {
  ageBand: '25-34',
  residence: { scope: 'yerevan', district: 'kentron' },
};

/**
 * Required questions our forms do not collect. Mootq is asked to make them optional;
 * refresh the schema fixture when they do, and this list must shrink.
 */
describe('Mootq required question coverage', () => {
  it('general form leaves only the newsletter unanswered in every branch', () => {
    const branches = [
      {
        ...generalShared,
        visitPurpose: 'market_research',
        marketInterests: ['new_apartments'],
        researchGoal: 'future_purchase',
        researchLocation: { undecided: false, yerevanDistricts: ['kentron'], marzRegions: [] },
        purchaseHorizon: 'up_to_3_months',
      },
      {
        ...generalShared,
        visitPurpose: 'own_residence',
        interestType: 'apartment_new',
        locationSeek: location,
        areaSqm: '70-90',
        purchaseMethod: 'mortgage',
        monthlyBudget: '300k-500k',
        decisionStage: 'searching_6_months',
      },
      {
        ...generalShared,
        visitPurpose: 'investment',
        investmentPropertyType: 'apartment',
        locationSeek: location,
        investmentGoal: 'rental_income',
        areaSqm: '70-90',
        purchaseMethod: 'cash',
        investmentTimeline: '6-12_months',
        investmentBudgetUsd: '150k-300k',
        priorInvestmentExperience: 'no_first',
      },
    ];
    for (const answers of branches) {
      expect(generalCase(answers).missingRequired).toEqual([CODE.newsletter]);
    }
  });

  it('Spyurk own residence in Armenia: location scope and monthly AMD budget are not collected', () => {
    const { payload, missingRequired } = spyurkCase(spyurkOwn);
    expect(missingRequired).toEqual([CODE.ownLocationScope, CODE.monthlyBudget, CODE.newsletter]);
    expect(payload.answers).toMatchObject({
      [CODE.interestType]: 'Բնակարան կառուցապատողից (նորակառույց)',
      [CODE.ownArea]: '70 - 90 քմ',
      [CODE.ownPurchaseMethod]: 'Բնակարանային հիփոթեք',
    });
    expect(payload.answers[CODE.decisionStage]).toBeDefined();
  });

  it('Spyurk own residence abroad sends the country as property abroad', () => {
    const { payload, missingRequired } = spyurkCase({
      ...spyurkOwn,
      propertyCountry: { scope: 'other', country: 'Грузия' },
    });
    expect(missingRequired).toEqual([CODE.monthlyBudget, CODE.newsletter]);
    expect(payload.answers).toMatchObject({
      [CODE.interestType]: 'Գույք արտերկրում',
      [CODE.ownAbroadCountries]: ['Այլ'],
      [CODE.ownAbroadCountryOther]: 'Грузия',
      [CODE.ownLocationScope]: 'Արտերկիր',
      [CODE.ownAbroadSeek]: ['Այլ'],
      [CODE.ownAbroadSeekOther]: 'Грузия',
    });
  });

  it('Spyurk own residence leaves the property type unanswered when it has no Mootq match', () => {
    const { missingRequired } = spyurkCase({ ...spyurkOwn, interestTypes: ['apartments', 'land_for_house'] });
    expect(missingRequired).toContain(CODE.interestType);
  });

  it('Spyurk investment in Armenia: only the location scope is not collected', () => {
    const { payload, missingRequired } = spyurkCase(spyurkInvestment);
    expect(missingRequired).toEqual([CODE.investmentLocationScope, CODE.newsletter]);
    expect(payload.answers).toMatchObject({
      [CODE.investmentPropertyType]: 'Բնակարան',
      [CODE.investmentGoal]: 'Վարձակալությունից պասիվ եկամուտ ստանալու համար',
      [CODE.investmentArea]: '50 - 70 քմ',
      [CODE.investmentPurchaseMethod]: 'Կանխիկ',
      [CODE.investmentBudget]: '150․000 - 300․000 ԱՄՆ դոլար',
      [CODE.priorExperience]: 'Այո. արտերկրում',
      [CODE.priorExperienceCountry]: 'Spain',
    });
  });

  it('Spyurk investment with several types sends «Այլ» with every type spelled out', () => {
    const { payload, missingRequired } = spyurkCase({
      ...spyurkInvestment,
      investmentPropertyTypes: ['land', 'other'],
      investmentPropertyTypeOther: 'Ավտոտնակ',
      areaSqm: undefined,
      propertyCountry: { scope: 'other', country: 'UAE' },
    });
    expect(payload.answers).toMatchObject({
      [CODE.investmentPropertyType]: 'Այլ',
      [CODE.investmentPropertyOther]: 'Հողատարածք, Ավտոտնակ',
      [CODE.investmentLocationScope]: 'Արտերկիր',
      [CODE.investmentAbroad]: ['Այլ'],
      [CODE.investmentAbroadOther]: 'UAE',
    });
    expect(missingRequired).toEqual([CODE.investmentArea, CODE.newsletter]);
  });
});
