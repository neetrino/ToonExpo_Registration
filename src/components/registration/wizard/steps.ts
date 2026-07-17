import type { VisitPurpose } from '@/lib/questionnaire/types';
import type { WizardStepId } from './types';

const BASE_STEPS: WizardStepId[] = ['identity', 'profile'];

const BRANCH_STEPS: Record<VisitPurpose, WizardStepId[]> = {
  own_residence: ['own-residence-interest', 'own-residence-size', 'own-residence-budget'],
  investment: ['investment'],
  market_research: ['market-research'],
};

/** Resolves wizard steps for the selected visit purpose. */
export function getWizardSteps(visitPurpose: VisitPurpose | ''): WizardStepId[] {
  if (!visitPurpose) {
    return [...BASE_STEPS, 'finish'];
  }

  return [...BASE_STEPS, ...BRANCH_STEPS[visitPurpose], 'finish'];
}

export function getStepIndex(steps: WizardStepId[], stepId: WizardStepId): number {
  return steps.indexOf(stepId);
}
