import type { VisitPurpose } from '@/lib/questionnaire/types';
import type { WizardStepId } from './types';

const BASE_STEPS: WizardStepId[] = ['identity', 'profile'];

const OWN_RESIDENCE_STEPS: WizardStepId[] = [
  'own-residence-interest',
  'own-residence-location',
  'own-residence-size',
  'own-residence-budget',
];

const INVESTMENT_STEPS: WizardStepId[] = [
  'investment-type',
  'investment-location',
  'investment-goal',
  'investment-size',
  'investment-budget',
];

const MARKET_RESEARCH_STEPS: WizardStepId[] = ['market-research-focus', 'market-research-where'];

/** Resolves wizard steps for the selected visit purpose. */
export function getWizardSteps(visitPurpose: VisitPurpose | ''): WizardStepId[] {
  if (!visitPurpose) {
    return [...BASE_STEPS, 'finish'];
  }

  if (visitPurpose === 'own_residence') {
    return [...BASE_STEPS, ...OWN_RESIDENCE_STEPS, 'finish'];
  }

  if (visitPurpose === 'investment') {
    return [...BASE_STEPS, ...INVESTMENT_STEPS, 'finish'];
  }

  return [...BASE_STEPS, ...MARKET_RESEARCH_STEPS, 'finish'];
}

export function getStepIndex(steps: WizardStepId[], stepId: WizardStepId): number {
  return steps.indexOf(stepId);
}
