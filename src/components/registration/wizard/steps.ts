import { QUESTIONNAIRE_DEFINITION } from '@/lib/questionnaire/definition';
import type { InterestType, VisitPurpose } from '@/lib/questionnaire/types';
import type { WizardStepId } from './types';

const BASE_STEPS: WizardStepId[] = ['identity', 'profile'];

const OWN_RESIDENCE_TAIL: WizardStepId[] = ['own-residence-size', 'own-residence-budget'];

const INVESTMENT_STEPS: WizardStepId[] = [
  'investment-type',
  'investment-goal',
  'investment-budget',
];

const MARKET_RESEARCH_STEPS: WizardStepId[] = ['market-research-focus', 'market-research-where'];

function needsOwnResidenceLocation(interestType: InterestType | ''): boolean {
  if (interestType !== 'house_townhouse' && interestType !== 'apartment_new') {
    return false;
  }

  return QUESTIONNAIRE_DEFINITION.branches.own_residence.interestType.locationSeekFor.includes(
    interestType,
  );
}

/** Resolves wizard steps for the selected visit purpose (and interest type when relevant). */
export function getWizardSteps(
  visitPurpose: VisitPurpose | '',
  interestType: InterestType | '' = '',
): WizardStepId[] {
  if (!visitPurpose) {
    return [...BASE_STEPS, 'finish'];
  }

  if (visitPurpose === 'own_residence') {
    const branch: WizardStepId[] = ['own-residence-interest'];
    if (needsOwnResidenceLocation(interestType)) {
      branch.push('own-residence-location');
    }
    return [...BASE_STEPS, ...branch, ...OWN_RESIDENCE_TAIL, 'finish'];
  }

  if (visitPurpose === 'investment') {
    return [...BASE_STEPS, ...INVESTMENT_STEPS, 'finish'];
  }

  return [...BASE_STEPS, ...MARKET_RESEARCH_STEPS, 'finish'];
}

export function getStepIndex(steps: WizardStepId[], stepId: WizardStepId): number {
  return steps.indexOf(stepId);
}
