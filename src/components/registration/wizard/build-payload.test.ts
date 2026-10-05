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
  it('does not persist a newsletter answer', () => {
    const answers = buildQuestionnaireAnswers(ownResidenceState());

    expect(answers).not.toBeNull();
    expect(answers).not.toHaveProperty('newsletter');
  });
});
