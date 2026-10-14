import { describe, expect, it } from 'vitest';
import { applyMootqRegistrationSchema } from '@/lib/integrations/mootq/apply-registration-schema';
import { buildMootqCodedAnswers } from '@/lib/integrations/mootq/build-mootq-coded-answers';
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
  registeredAt: new Date('2026-10-14T10:00:00.000Z'),
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+37499000001',
  locale: 'hy' as const,
};

const identityAnswers = {
  [CODE.firstName]: 'John',
  [CODE.lastName]: 'Doe',
  [CODE.phone]: '+37499000001',
  [CODE.email]: 'john.doe@example.com',
};

const location = { yerevanDistricts: ['kentron'], marzRegions: [], abroadCountries: [] };
const generalShared = { ageBand: '25-34', residence: { scope: 'yerevan', district: 'kentron' } };

const generalBranches: Record<string, Record<string, unknown>> = {
  market_research: {
    ...generalShared,
    visitPurpose: 'market_research',
    marketInterests: ['new_apartments'],
    researchGoal: 'future_purchase',
    researchLocation: { undecided: false, yerevanDistricts: ['kentron'], marzRegions: [] },
    purchaseHorizon: 'up_to_3_months',
  },
  own_residence: {
    ...generalShared,
    visitPurpose: 'own_residence',
    interestType: 'apartment_new',
    locationSeek: location,
    areaSqm: '70-90',
    purchaseMethod: 'mortgage',
    monthlyBudget: '300k-500k',
    decisionStage: 'searching_6_months',
  },
  investment: {
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
};

const spyurkShared = {
  ageBand: '35-44',
  residence: { city: 'Moscow', region: 'Moscow Oblast' },
  armeniaConnection: 'born_in_armenia',
  purchaseMotives: ['own_stays'],
  armeniaVisitTiming: 'within_3_months',
};

const spyurkBranches: Record<string, Record<string, unknown>> = {
  market_research: {
    ...spyurkShared,
    visitPurpose: 'market_research',
    marketInterests: ['new_apartments'],
    researchGoal: 'future_purchase_armenia',
    propertyCountry: { scope: 'armenia' },
    purchaseHorizon: 'up_to_3_months',
  },
  own_residence: {
    ...spyurkShared,
    visitPurpose: 'own_residence',
    interestTypes: ['apartment_new'],
    propertyCountry: { scope: 'armenia' },
    areaSqm: '70-90',
    purchaseMethod: 'mortgage',
    purchaseBudgetUsd: '150k-250k',
    decisionStage: 'searching_6_months',
  },
  investment: {
    ...spyurkShared,
    visitPurpose: 'investment',
    investmentPropertyTypes: ['apartment'],
    propertyCountry: { scope: 'other', country: 'UAE' },
    investmentGoal: 'rental_income',
    areaSqm: '50-70',
    purchaseMethod: 'cash',
    investmentTimeline: '6-12_months',
    investmentBudgetUsd: '150k-300k',
    priorInvestmentExperience: 'no_first',
  },
};

function generalPayload(answers: Record<string, unknown>) {
  expect(questionnaireAnswersSchema.safeParse(answers).success).toBe(true);
  return buildMootqPushPayload(
    { ...identity, formVersion: FORM_VERSION, answers },
    mootqSchemaFixture,
  );
}

describe('Mootq required question coverage (requireAllAnswers 0)', () => {
  it.each(Object.entries(generalBranches))(
    'general %s: sends every answer and nothing required is missing',
    (_branch, answers) => {
      const { payload, missingRequired } = generalPayload(answers);
      expect(payload.requireAllAnswers).toBe(0);
      expect(missingRequired).toEqual([]);
      expect(payload.answers).toMatchObject(identityAnswers);
      expect(payload.answers[CODE.ageBand]).toBe('25-34 տարեկան');
      expect(payload.answers[CODE.visitPurpose]).toBeDefined();
    },
  );

  it.each(Object.entries(spyurkBranches))('Spyurk %s: sends identity only', (_branch, answers) => {
    expect(spyurkQuestionnaireAnswersSchema.safeParse(answers).success).toBe(true);
    const { payload, missingRequired } = buildMootqPushPayload(
      { ...identity, formVersion: SPYURK_FORM_VERSION, answers },
      mootqSchemaFixture,
    );
    expect(payload.requireAllAnswers).toBe(0);
    expect(payload.answers).toEqual(identityAnswers);
    expect(missingRequired).toEqual([]);
    expect(payload.ticketCode).toBe('TEABCDEFGHIJK');
  });

  it('documents the strict-mode gap: only the newsletter would be missing for the general form', () => {
    for (const answers of Object.values(generalBranches)) {
      const coded = buildMootqCodedAnswers({ ...identity, formVersion: FORM_VERSION, answers });
      const strict = applyMootqRegistrationSchema(mootqSchemaFixture, coded, 1);
      expect(strict.missingRequired).toEqual([CODE.newsletter]);
    }
  });
});
