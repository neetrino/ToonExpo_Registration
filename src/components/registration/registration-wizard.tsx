'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import type { Locale } from '@/types/locale';
import { submitRegistration } from './submit-registration';
import { buildRegistrationPayload } from './wizard/build-payload';
import { clearWizardDraft, loadWizardDraft, saveWizardDraft } from './wizard/persist-draft';
import { getWizardSteps } from './wizard/steps';
import { FinishStep } from './wizard/step-finish';
import { IdentityStep, ProfileStep } from './wizard/step-identity-profile';
import {
  InvestmentBudgetStep,
  InvestmentGoalStep,
  InvestmentTypeStep,
} from './wizard/step-investment';
import { MarketResearchFocusStep, MarketResearchWhereStep } from './wizard/step-market-research';
import {
  OwnResidenceBudgetStep,
  OwnResidenceInterestStep,
  OwnResidenceLocationStep,
  OwnResidenceSizeStep,
} from './wizard/step-own-residence';
import {
  initialWizardState,
  type WizardFieldErrors,
  type WizardState,
  type WizardStepId,
} from './wizard/types';
import { isWizardStepValid, validateWizardStep } from './wizard/validation';
import { WizardProgress } from './wizard/wizard-progress';
import { WizardStepPanel } from './wizard/wizard-step-panel';

type RegistrationWizardProps = {
  locale: Locale;
};

function scrollWizardToTop(element: HTMLElement | null): void {
  if (!element) {
    return;
  }

  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function RegistrationWizard({ locale }: RegistrationWizardProps) {
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

  const [state, setState] = useState<WizardState>(initialWizardState);
  const [currentStep, setCurrentStep] = useState<WizardStepId>('identity');
  const [fieldErrors, setFieldErrors] = useState<WizardFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [draftReady, setDraftReady] = useState(false);

  useEffect(() => {
    const draft = loadWizardDraft();
    if (draft) {
      const draftSteps = getWizardSteps(draft.state.visitPurpose, draft.state.interestType);
      const restoredStep = draftSteps.includes(draft.currentStep)
        ? draft.currentStep
        : draftSteps.includes('own-residence-interest')
          ? 'own-residence-interest'
          : draftSteps.includes('profile')
            ? 'profile'
            : (draftSteps[0] ?? 'identity');
      // sessionStorage is client-only; restore after mount to avoid SSR mismatch.
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
    saveWizardDraft(state, currentStep);
  }, [state, currentStep, draftReady]);

  const steps = getWizardSteps(state.visitPurpose, state.interestType);
  const stepIndex = steps.indexOf(currentStep);
  const safeStep: WizardStepId =
    stepIndex >= 0
      ? currentStep
      : steps.includes('own-residence-interest')
        ? 'own-residence-interest'
        : steps.includes('profile')
          ? 'profile'
          : (steps[0] ?? 'identity');
  const safeStepIndex = steps.indexOf(safeStep);
  const isFirstStep = safeStepIndex <= 0;
  const isLastStep = safeStep === 'finish';
  const stepIsValid = isWizardStepValid(safeStep, state, errorTranslator);
  const showErrors = attemptedNext || isLastStep;

  const updateField = <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setState((current) => {
      const next = { ...current, [key]: value };

      if (key === 'visitPurpose' && value !== current.visitPurpose) {
        return {
          ...next,
          interestType: '',
          abroadCountries: [],
          abroadCountriesOther: '',
          locationSeekScope: '',
          yerevanDistricts: [],
          marzRegions: [],
          areaSqm: '',
          purchaseMethod: '',
          monthlyBudget: '',
          decisionStage: '',
          investmentPropertyType: '',
          investmentPropertyTypeOther: '',
          investmentMarket: '',
          investmentMarketOther: '',
          investmentGoal: '',
          investmentTimeline: '',
          investmentBudgetUsd: '',
          priorInvestmentExperience: '',
          marketInterests: [],
          researchGoal: '',
          interestedWhere: '',
          interestedWhereOther: '',
          purchaseHorizon: '',
          newsletter: null,
        };
      }

      return next;
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
    const errors = validateWizardStep(safeStep, state, errorTranslator);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      scrollWizardToTop(formTopRef.current);
      return;
    }

    setFieldErrors({});

    if (!isLastStep) {
      setAttemptedNext(false);
      setCurrentStep(steps[safeStepIndex + 1] ?? 'finish');
      scrollWizardToTop(formTopRef.current);
      return;
    }

    // Re-check identity on final submit — draft/old sessions can carry an invalid phone.
    const identityErrors = validateWizardStep('identity', state, errorTranslator);
    if (Object.keys(identityErrors).length > 0) {
      setFieldErrors(identityErrors);
      setCurrentStep('identity');
      setFormError(
        identityErrors.phone
          ? tErrors('invalidPhone')
          : identityErrors.email
            ? tErrors('invalidEmail')
            : tErrors('validation'),
      );
      scrollWizardToTop(formTopRef.current);
      return;
    }

    const payload = buildRegistrationPayload(state, locale);
    if (!payload) {
      setFormError(tErrors('validation'));
      return;
    }

    setIsSubmitting(true);
    const result = await submitRegistration(payload, locale, state.website);
    setIsSubmitting(false);

    if (result.ok) {
      clearWizardDraft();
      router.push('/success');
      return;
    }

    if (result.fieldErrors) {
      const localized: WizardFieldErrors = { ...result.fieldErrors };
      if (localized.phone) {
        localized.phone = tErrors('invalidPhone');
      }
      if (localized.email) {
        localized.email = tErrors('invalidEmail');
      }
      if (localized.privacyConsent) {
        localized.privacyConsent = tErrors('consentRequired');
      }
      setFieldErrors(localized);

      if (localized.phone || localized.email || localized.firstName || localized.lastName) {
        setCurrentStep('identity');
        setFormError(
          localized.phone
            ? tErrors('invalidPhone')
            : localized.email
              ? tErrors('invalidEmail')
              : tErrors('validation'),
        );
        scrollWizardToTop(formTopRef.current);
        return;
      }
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

    if (result.status === 0) {
      setFormError(tErrors('network'));
      return;
    }

    setFormError(tErrors('server'));
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
          {safeStep === 'identity' ? <IdentityStep {...stepProps} /> : null}
          {safeStep === 'profile' ? <ProfileStep {...stepProps} /> : null}
          {safeStep === 'own-residence-interest' ? (
            <OwnResidenceInterestStep {...stepProps} />
          ) : null}
          {safeStep === 'own-residence-location' ? (
            <OwnResidenceLocationStep {...stepProps} />
          ) : null}
          {safeStep === 'own-residence-size' ? <OwnResidenceSizeStep {...stepProps} /> : null}
          {safeStep === 'own-residence-budget' ? <OwnResidenceBudgetStep {...stepProps} /> : null}
          {safeStep === 'investment-type' ? <InvestmentTypeStep {...stepProps} /> : null}
          {safeStep === 'investment-goal' ? <InvestmentGoalStep {...stepProps} /> : null}
          {safeStep === 'investment-budget' ? <InvestmentBudgetStep {...stepProps} /> : null}
          {safeStep === 'market-research-focus' ? <MarketResearchFocusStep {...stepProps} /> : null}
          {safeStep === 'market-research-where' ? <MarketResearchWhereStep {...stepProps} /> : null}
          {safeStep === 'finish' ? <FinishStep {...stepProps} /> : null}
        </div>
      </WizardStepPanel>

      <div
        className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <input
          id="companyUrl"
          name="companyUrl"
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

      <div className="relative z-0 mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
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
