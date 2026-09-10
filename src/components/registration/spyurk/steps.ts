import type { VisitPurpose } from '@/lib/questionnaire/types';
import type { SpyurkWizardStepId } from './types';

const BASE_STEPS: SpyurkWizardStepId[] = ['identity', 'profile', 'background'];

const OWN_RESIDENCE_STEPS: SpyurkWizardStepId[] = ['own-interest', 'own-details', 'own-followup'];

const INVESTMENT_STEPS: SpyurkWizardStepId[] = [
  'investment-type',
  'investment-goal',
  'investment-details',
  'investment-followup',
];

const RESEARCH_STEPS: SpyurkWizardStepId[] = ['research-focus', 'research-followup'];

/** Resolves Spyurk wizard steps for the selected visit purpose. */
export function getSpyurkWizardSteps(visitPurpose: VisitPurpose | ''): SpyurkWizardStepId[] {
  if (!visitPurpose) {
    return [...BASE_STEPS, 'finish'];
  }

  if (visitPurpose === 'own_residence') {
    return [...BASE_STEPS, ...OWN_RESIDENCE_STEPS, 'finish'];
  }

  if (visitPurpose === 'investment') {
    return [...BASE_STEPS, ...INVESTMENT_STEPS, 'finish'];
  }

  return [...BASE_STEPS, ...RESEARCH_STEPS, 'finish'];
}
