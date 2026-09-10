import { describe, expect, it } from 'vitest';
import { SPYURK_FORM_VERSION } from '@/lib/questionnaire/spyurk/constants';
import { buildSpyurkQuestionnaireAnswers, buildSpyurkRegistrationPayload } from './build-payload';
import { initialSpyurkWizardState, type SpyurkWizardState } from './types';

function ownResidenceState(overrides: Partial<SpyurkWizardState> = {}): SpyurkWizardState {
  return {
    ...initialSpyurkWizardState,
    firstName: 'Anna',
    lastName: 'Ivanova',
    email: 'anna@example.com',
    phone: '9123456789',
    ageBand: '35-44',
    residenceCity: 'Moscow',
    residenceRegion: 'Moscow Oblast',
    armeniaConnection: 'family_from_armenia',
    purchaseMotives: ['own_stays'],
    visitPurpose: 'own_residence',
    interestTypes: ['apartment_new'],
    propertyCountryScope: 'armenia',
    areaSqm: '70-90',
    purchaseMethod: 'cash',
    purchaseBudgetUsd: '150k-250k',
    decisionStage: 'searching_6_months',
    armeniaVisitTiming: 'within_3_months',
    newsletter: true,
    privacyConsent: true,
    ...overrides,
  };
}

describe('buildSpyurkQuestionnaireAnswers', () => {
  it('builds own_residence answers from wizard state', () => {
    const answers = buildSpyurkQuestionnaireAnswers(ownResidenceState());

    expect(answers).toMatchObject({
      visitPurpose: 'own_residence',
      residence: { city: 'Moscow', region: 'Moscow Oblast' },
      purchaseBudgetUsd: '150k-250k',
      newsletter: true,
    });
  });

  it('returns null when required branch fields are missing', () => {
    expect(buildSpyurkQuestionnaireAnswers(ownResidenceState({ interestTypes: [] }))).toBeNull();
  });
});

describe('buildSpyurkRegistrationPayload', () => {
  it('uses the Spyurk form version and does not send formChannel', () => {
    const payload = buildSpyurkRegistrationPayload(ownResidenceState());

    expect(payload?.formVersion).toBe(SPYURK_FORM_VERSION);
    expect(payload).not.toHaveProperty('formChannel');
  });
});
