'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { rememberAnalyticsFormChannel } from '@/lib/analytics/form-channel-event';
import { useQuestionnaireStepTracking } from '@/lib/analytics/use-questionnaire-step-tracking';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import type { Locale } from '@/types/locale';
import { submitRegistration } from '@/components/registration/submit-registration';
import { clearRegistrationIdempotencyKey } from '@/components/registration/idempotency';
import { storeTicketHandoff } from '@/components/registration/ticket-handoff';
import {
  captureAndPersistUtmFromLocation,
  clearPersistedUtmAttribution,
} from '@/components/registration/utm-attribution';
import { IdentityStep } from '@/components/registration/wizard/step-identity-profile';
import { FinishStep } from '@/components/registration/wizard/step-finish';
import { WizardProgress } from '@/components/registration/wizard/wizard-progress';
import { WizardStepPanel } from '@/components/registration/wizard/wizard-step-panel';
import { buildSpyurkRegistrationPayload } from './build-payload';
import {
  clearSpyurkWizardDraft,
  loadSpyurkWizardDraft,
  saveSpyurkWizardDraft,
} from './persist-draft';
import {
  SpyurkInvestmentDetailsStep,
  SpyurkInvestmentFollowupStep,
  SpyurkInvestmentGoalStep,
  SpyurkInvestmentTypeStep,
  SpyurkOwnDetailsStep,
  SpyurkOwnFollowupStep,
  SpyurkOwnInterestStep,
  SpyurkResearchFocusStep,
  SpyurkResearchFollowupStep,
} from './step-branches';
import { SpyurkBackgroundStep, SpyurkProfileStep } from './step-fields';
import { getSpyurkWizardSteps } from './steps';
import {
  initialSpyurkWizardState,
  type SpyurkWizardFieldErrors,
  type SpyurkWizardState,
  type SpyurkWizardStepId,
} from './types';
import { isSpyurkWizardStepValid, validateSpyurkWizardStep } from './validation';

type SpyurkRegistrationWizardProps = {
  locale: Locale;
};

function scrollWizardToTop(element: HTMLElement | null): void {
  if (!element) {
    return;
  }
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function emptyBranchState(): Partial<SpyurkWizardState> {
  return {
    interestTypes: [],
    interestTypesOther: '',
    propertyCountryScope: '',
    propertyCountryOther: '',
    areaSqm: '',
    purchaseMethod: '',
    purchaseBudgetUsd: '',
    decisionStage: '',
    armeniaVisitTiming: '',
    investmentPropertyTypes: [],
    investmentPropertyTypeOther: '',
    investmentGoal: '',
    investmentTimeline: '',
    investmentBudgetUsd: '',
    priorInvestmentExperience: '',
    priorInvestmentExperienceOther: '',
    marketInterests: [],
    researchGoal: '',
    purchaseHorizon: '',
    newsletter: null,
  };
}

export function SpyurkRegistrationWizard({ locale }: SpyurkRegistrationWizardProps) {
  const tWizard = useTranslations('wizard');
  const tForm = useTranslations('form');
  const tErrors = useTranslations('errors');
  const router = useRouter();
  const formTopRef = useRef<HTMLDivElement>(null);
  const questionnaireLocale = locale as QuestionnaireLocale;
  const errorTranslator = useMemo(
    () => ({
      required: tErrors('required'),
      invalidEmail: tErrors('invalidEmail'),
      invalidPhone: tErrors('invalidPhone'),
      consentRequired: tErrors('consentRequired'),
      validation: tErrors('validation'),
      maxSelections: (max: number) => tWizard('maxSelections', { max }),
    }),
    [tErrors, tWizard],
  );

  const [state, setState] = useState<SpyurkWizardState>(initialSpyurkWizardState);
  const [currentStep, setCurrentStep] = useState<SpyurkWizardStepId>('identity');
  const [fieldErrors, setFieldErrors] = useState<SpyurkWizardFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [draftReady, setDraftReady] = useState(false);

  useEffect(() => {
    captureAndPersistUtmFromLocation();
    const draft = loadSpyurkWizardDraft();
    if (draft) {
      const draftSteps = getSpyurkWizardSteps(draft.state.visitPurpose);
      const restoredStep = draftSteps.includes(draft.currentStep)
        ? draft.currentStep
        : (draftSteps[0] ?? 'identity');
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate draft from sessionStorage
      setState(draft.state);
      setCurrentStep(restoredStep);
    }
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady) {
      return;
    }
    saveSpyurkWizardDraft(state, currentStep);
  }, [state, currentStep, draftReady]);

  const steps = getSpyurkWizardSteps(state.visitPurpose);
  const stepIndex = steps.indexOf(currentStep);
  const safeStep: SpyurkWizardStepId = stepIndex >= 0 ? currentStep : (steps[0] ?? 'identity');
  const safeStepIndex = steps.indexOf(safeStep);
  if (currentStep !== safeStep) {
    setCurrentStep(safeStep);
  }

  const isFirstStep = safeStepIndex <= 0;
  const isLastStep = safeStep === 'finish';
  const stepIsValid = isSpyurkWizardStepValid(safeStep, state, errorTranslator);
  const showErrors = attemptedNext || isLastStep;
  const { trackQuestionComplete } = useQuestionnaireStepTracking({
    ready: draftReady,
    questionId: safeStep,
    questionIndex: safeStepIndex,
    questionTotal: steps.length,
    formChannel: 'spyurk_rf',
  });

  const updateField = <K extends keyof SpyurkWizardState>(key: K, value: SpyurkWizardState[K]) => {
    setState((current) => {
      if (key === 'visitPurpose' && value !== current.visitPurpose) {
        return { ...current, [key]: value, ...emptyBranchState() };
      }
      return { ...current, [key]: value };
    });
    if (key in fieldErrors) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[String(key)];
        return next;
      });
    }
    setFormError(null);
  };

  const goBack = () => {
    if (isFirstStep || safeStepIndex <= 0) {
      return;
    }
    setAttemptedNext(false);
    setFieldErrors({});
    setCurrentStep(steps[safeStepIndex - 1] ?? 'identity');
    scrollWizardToTop(formTopRef.current);
  };

  const goNext = async () => {
    setAttemptedNext(true);
    const errors = validateSpyurkWizardStep(safeStep, state, errorTranslator);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      scrollWizardToTop(formTopRef.current);
      return;
    }

    setFieldErrors({});
    trackQuestionComplete();

    if (!isLastStep) {
      setAttemptedNext(false);
      setCurrentStep(steps[safeStepIndex + 1] ?? 'finish');
      scrollWizardToTop(formTopRef.current);
      return;
    }

    const identityErrors = validateSpyurkWizardStep('identity', state, errorTranslator);
    if (Object.keys(identityErrors).length > 0) {
      setFieldErrors(identityErrors);
      setCurrentStep('identity');
      setFormError(identityErrors.phone ? tErrors('invalidPhone') : tErrors('validation'));
      scrollWizardToTop(formTopRef.current);
      return;
    }

    const payload = buildSpyurkRegistrationPayload(state);
    if (!payload) {
      setFormError(tErrors('validation'));
      return;
    }

    setIsSubmitting(true);
    const result = await submitRegistration(payload, locale, state.website);
    setIsSubmitting(false);

    if (result.ok) {
      clearSpyurkWizardDraft();
      clearRegistrationIdempotencyKey();
      clearPersistedUtmAttribution();
      rememberAnalyticsFormChannel('spyurk_rf');
      storeTicketHandoff({
        ticketCode: result.ticketCode,
        ticketViewToken: result.ticketViewToken,
      });
      router.push('/success');
      return;
    }

    if (result.status === 409 || result.code === 'DUPLICATE_EMAIL') {
      setFormError(tErrors('duplicate'));
      return;
    }
    if (result.status === 429 || result.code === 'RATE_LIMITED') {
      setFormError(tErrors('rateLimit'));
      return;
    }
    if (result.status === 400) {
      setFormError(tErrors('validation'));
      return;
    }
    setFormError(result.status === 0 ? tErrors('network') : tErrors('server'));
  };

  const stepProps = {
    state,
    errors: showErrors ? fieldErrors : {},
    disabled: isSubmitting,
    locale: questionnaireLocale,
    onUpdate: updateField,
  };

  return (
    <div ref={formTopRef} className="scroll-mt-6" aria-busy={isSubmitting}>
      <WizardProgress currentStep={safeStep} steps={steps} />
      <WizardStepPanel stepKey={safeStep}>
        <div className="space-y-6">
          {safeStep === 'identity' ? (
            <IdentityStep
              state={state}
              errors={stepProps.errors}
              disabled={stepProps.disabled}
              onUpdate={(key, value) => {
                updateField(key, value as never);
              }}
            />
          ) : null}
          {safeStep === 'profile' ? <SpyurkProfileStep {...stepProps} /> : null}
          {safeStep === 'background' ? <SpyurkBackgroundStep {...stepProps} /> : null}
          {safeStep === 'own-interest' ? <SpyurkOwnInterestStep {...stepProps} /> : null}
          {safeStep === 'own-details' ? <SpyurkOwnDetailsStep {...stepProps} /> : null}
          {safeStep === 'own-followup' ? <SpyurkOwnFollowupStep {...stepProps} /> : null}
          {safeStep === 'investment-type' ? <SpyurkInvestmentTypeStep {...stepProps} /> : null}
          {safeStep === 'investment-goal' ? <SpyurkInvestmentGoalStep {...stepProps} /> : null}
          {safeStep === 'investment-details' ? (
            <SpyurkInvestmentDetailsStep {...stepProps} />
          ) : null}
          {safeStep === 'investment-followup' ? (
            <SpyurkInvestmentFollowupStep {...stepProps} />
          ) : null}
          {safeStep === 'research-focus' ? <SpyurkResearchFocusStep {...stepProps} /> : null}
          {safeStep === 'research-followup' ? <SpyurkResearchFollowupStep {...stepProps} /> : null}
          {safeStep === 'finish' ? <FinishStep {...stepProps} /> : null}
        </div>
      </WizardStepPanel>
      <div
        className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <input
          id="hp_leave_blank"
          name="hp_leave_blank"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={state.website}
          onChange={(event) => updateField('website', event.target.value)}
        />
      </div>
      {formError ? (
        <p
          className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {formError}
        </p>
      ) : null}
      <div className="relative z-0 mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={isSubmitting || isFirstStep}
          className="w-full sm:w-auto"
        >
          {tWizard('back')}
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={() => void goNext()}
          disabled={isSubmitting || !stepIsValid}
          className="w-full sm:w-auto"
        >
          {isLastStep ? (isSubmitting ? tForm('submitting') : tForm('submit')) : tWizard('next')}
        </Button>
      </div>
    </div>
  );
}
