import type { WizardState, WizardStepId } from './types';
import { initialWizardState } from './types';

const STORAGE_KEY = 'toon-expo-registration-wizard-v1';

type PersistedWizard = {
  state: WizardState;
  currentStep: WizardStepId;
};

function isWizardStepId(value: unknown): value is WizardStepId {
  return (
    value === 'identity' ||
    value === 'profile' ||
    value === 'own-residence-interest' ||
    value === 'own-residence-details' ||
    value === 'investment' ||
    value === 'market-research' ||
    value === 'finish'
  );
}

/**
 * Restore wizard draft from sessionStorage (same-tab navigation / refresh).
 */
export function loadWizardDraft(): PersistedWizard | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const draft = parsed as { state?: unknown; currentStep?: unknown };
    if (!draft.state || typeof draft.state !== 'object' || !isWizardStepId(draft.currentStep)) {
      return null;
    }

    return {
      state: { ...initialWizardState, ...(draft.state as WizardState) },
      currentStep: draft.currentStep,
    };
  } catch {
    return null;
  }
}

export function saveWizardDraft(state: WizardState, currentStep: WizardStepId): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const payload: PersistedWizard = { state, currentStep };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function clearWizardDraft(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
