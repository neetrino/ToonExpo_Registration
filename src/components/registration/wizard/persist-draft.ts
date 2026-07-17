import { resolvePhoneCountry } from '@/lib/validation/phone-countries';
import type { WizardState, WizardStepId } from './types';
import { initialWizardState } from './types';

const STORAGE_KEY = 'toon-expo-registration-wizard-v1';

type PersistedWizard = {
  state: WizardState;
  currentStep: WizardStepId;
};

const CURRENT_STEP_IDS: ReadonlySet<string> = new Set([
  'identity',
  'profile',
  'own-residence-interest',
  'own-residence-location',
  'own-residence-size',
  'own-residence-budget',
  'investment-type',
  'investment-goal',
  'investment-budget',
  'market-research-focus',
  'market-research-where',
  'finish',
]);

function isWizardStepId(value: unknown): value is WizardStepId {
  return typeof value === 'string' && CURRENT_STEP_IDS.has(value);
}

/** Maps legacy draft step ids after step splits. */
function migrateStepId(value: unknown): WizardStepId | null {
  if (value === 'own-residence-details') {
    return 'own-residence-size';
  }

  if (value === 'investment') {
    return 'investment-type';
  }

  if (value === 'market-research') {
    return 'market-research-focus';
  }

  return isWizardStepId(value) ? value : null;
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
    const currentStep = migrateStepId(draft.currentStep);
    if (!draft.state || typeof draft.state !== 'object' || !currentStep) {
      return null;
    }

    const mergedState = { ...initialWizardState, ...(draft.state as WizardState) };

    return {
      state: {
        ...mergedState,
        phoneCountry: resolvePhoneCountry(mergedState.phoneCountry),
      },
      currentStep,
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
