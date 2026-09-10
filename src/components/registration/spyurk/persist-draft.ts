import { isPhoneCountry } from '@/lib/validation/phone-countries';
import { SPYURK_DEFAULT_PHONE_COUNTRY } from '@/lib/questionnaire/spyurk/constants';
import { initialSpyurkWizardState, type SpyurkWizardState, type SpyurkWizardStepId } from './types';
import { getSpyurkWizardSteps } from './steps';

const STORAGE_KEY = 'toon-expo-registration-wizard-spyurk-v1';

type PersistedWizard = {
  state: SpyurkWizardState;
  currentStep: SpyurkWizardStepId;
};

const STEP_IDS: ReadonlySet<string> = new Set([
  ...getSpyurkWizardSteps('own_residence'),
  ...getSpyurkWizardSteps('investment'),
  ...getSpyurkWizardSteps('market_research'),
]);

function isStepId(value: unknown): value is SpyurkWizardStepId {
  return typeof value === 'string' && STEP_IDS.has(value);
}

export function loadSpyurkWizardDraft(): PersistedWizard | null {
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
    if (!draft.state || typeof draft.state !== 'object' || !isStepId(draft.currentStep)) {
      return null;
    }

    const merged = { ...initialSpyurkWizardState, ...(draft.state as SpyurkWizardState) };

    return {
      state: {
        ...merged,
        website: '',
        phoneCountry: isPhoneCountry(merged.phoneCountry)
          ? merged.phoneCountry
          : SPYURK_DEFAULT_PHONE_COUNTRY,
      },
      currentStep: draft.currentStep,
    };
  } catch {
    return null;
  }
}

export function saveSpyurkWizardDraft(
  state: SpyurkWizardState,
  currentStep: SpyurkWizardStepId,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { ...state, website: '' }, currentStep } satisfies PersistedWizard),
    );
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function clearSpyurkWizardDraft(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
