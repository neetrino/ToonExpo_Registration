import { describe, expect, it } from 'vitest';
import { buildQuestionnaireAnswers } from './build-payload';
import { initialWizardState, type WizardState } from './types';

function ownResidenceState(overrides: Partial<WizardState> = {}): WizardState {
  return {
    ...initialWizardState,
    ageBand: '35-44',
    residenceScope: 'yerevan',
    residenceDistrict: 'kentron',
    visitPurpose: 'own_residence',
    interestType: 'apartment_new',
    yerevanDistricts: ['kentron'],
    areaSqm: '70-90',
    purchaseMethod: 'mortgage',
    monthlyBudget: '300k-500k',
    decisionStage: 'searching_6_months',
    ...overrides,
  };
}

describe('buildQuestionnaireAnswers', () => {
  it('persists newsletter as false after the opt-in question was removed', () => {
    const answers = buildQuestionnaireAnswers(ownResidenceState({ newsletter: true }));

    expect(answers?.newsletter).toBe(false);
  });

  it('builds answers when newsletter was never chosen', () => {
    const answers = buildQuestionnaireAnswers(ownResidenceState({ newsletter: null }));

    expect(answers).not.toBeNull();
    expect(answers?.newsletter).toBe(false);
  });
});
