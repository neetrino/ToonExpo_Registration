import { describe, expect, it } from 'vitest';
import { buildMootqRegistrationAnswers } from '@/lib/integrations/mootq/build-mootq-registration-answers';
import { Q, mootqSchemaFixture } from '@/lib/integrations/mootq/registration-schema.fixture';
import { SPYURK_FORM_VERSION } from '@/lib/questionnaire/spyurk/constants';
import {
  SPYURK_INVESTMENT_GOALS,
  SPYURK_INTEREST_TYPES,
  SPYURK_RESEARCH_GOALS,
} from '@/lib/questionnaire/spyurk/options';
import { spyurkQuestionnaireAnswersSchema } from '@/lib/questionnaire/spyurk/validate';

const identity = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+37499000001',
};

describe('Spyurk Mootq answers', () => {
  it('sends only identity for every valid Spyurk branch', () => {
    for (const researchGoal of SPYURK_RESEARCH_GOALS) {
      expectIdentityOnly(`goal ${researchGoal}`, {
        ageBand: '35-44',
        residence: { city: 'Moscow', region: 'Moscow Oblast' },
        armeniaConnection: 'family_from_armenia',
        purchaseMotives: ['own_stays'],
        visitPurpose: 'market_research',
        marketInterests: ['foreign_property'],
        researchGoal,
        propertyCountry: { scope: 'other', country: 'Georgia' },
        purchaseHorizon: 'no_plans',
        armeniaVisitTiming: 'not_planning',
      });
    }

    for (const interest of SPYURK_INTEREST_TYPES) {
      expectIdentityOnly(`home ${interest}`, {
        ageBand: '35-44',
        residence: { city: 'Sochi', region: 'Krasnodar' },
        armeniaConnection: 'other',
        armeniaConnectionOther: 'Ընկերներ',
        purchaseMotives: ['other'],
        purchaseMotivesOther: 'Աշխատանք',
        visitPurpose: 'own_residence',
        interestTypes: [interest],
        ...(interest === 'other' ? { interestTypesOther: 'Ավտոտնակ' } : {}),
        propertyCountry: { scope: 'armenia' },
        areaSqm: '70-90',
        purchaseMethod: 'cash',
        purchaseBudgetUsd: '150k-250k',
        decisionStage: 'just_researching',
        armeniaVisitTiming: 'within_3_months',
      });
    }

    for (const goal of SPYURK_INVESTMENT_GOALS) {
      expectIdentityOnly(`invest ${goal}`, {
        ageBand: '45-54',
        residence: { city: 'Lyon', region: 'Auvergne' },
        armeniaConnection: 'born_in_armenia',
        purchaseMotives: ['investment_income'],
        visitPurpose: 'investment',
        investmentPropertyTypes: ['land'],
        propertyCountry: { scope: 'armenia' },
        investmentGoal: goal,
        purchaseMethod: 'cash',
        investmentTimeline: '6-12_months',
        investmentBudgetUsd: '150k-300k',
        priorInvestmentExperience: 'yes_both',
        priorInvestmentExperienceOther: 'UAE',
        armeniaVisitTiming: 'within_1_year',
      });
    }
  });
});

function expectIdentityOnly(label: string, answers: Record<string, unknown>): void {
  expect(
    spyurkQuestionnaireAnswersSchema.safeParse(answers).success,
    `${label} fixture rejected`,
  ).toBe(true);
  const mapped = buildMootqRegistrationAnswers(
    { ...identity, formVersion: SPYURK_FORM_VERSION, answers },
    mootqSchemaFixture,
  );
  expect(mapped, label).toEqual({
    [Q.firstName]: identity.firstName,
    [Q.lastName]: identity.lastName,
    [Q.phone]: identity.phone,
    [Q.email]: identity.email,
  });
}
