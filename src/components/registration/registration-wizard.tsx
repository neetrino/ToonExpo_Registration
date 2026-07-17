'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import type { Locale } from '@/types/locale';
import { submitRegistration } from './submit-registration';
import { buildRegistrationPayload } from './wizard/build-payload';
import { getWizardSteps } from './wizard/steps';
import { FinishStep } from './wizard/step-finish';
import { IdentityStep, ProfileStep } from './wizard/step-identity-profile';
import { InvestmentStep } from './wizard/step-investment';
import { MarketResearchStep } from './wizard/step-market-research';
import {
  OwnResidenceDetailsStep,
  OwnResidenceInterestStep,
} from './wizard/step-own-residence';
import {
  initialWizardState,
  type WizardFieldErrors,
  type WizardState,
  type WizardStepId,
} from './wizard/types';
import { isWizardStepValid, validateWizardStep } from './wizard/validation';
import { WizardProgress } from './wizard/wizard-progress';

type RegistrationWizardProps = {
  locale: Locale;
};

export function RegistrationWizard({ locale }: RegistrationWizardProps) {
  const tWizard = useTranslations('wizard');
  const tForm = useTranslations('form');
  const tErrors = useTranslations('errors');
  const router = useRouter();

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

  const steps = getWizardSteps(state.visitPurpose);
  const stepIndex = steps.indexOf(currentStep);
  const isFirstStep = stepIndex <= 0;
  const isLastStep = currentStep === 'finish';
  const stepIsValid = isWizardStepValid(currentStep, state, errorTranslator);
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
    if (isFirstStep || stepIndex <= 0) {
      return;
    }

    setAttemptedNext(false);
    setFieldErrors({});
    setCurrentStep(steps[stepIndex - 1] ?? 'identity');
  };

  const goNext = async () => {
    setAttemptedNext(true);
    const errors = validateWizardStep(currentStep, state, errorTranslator);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    if (!isLastStep) {
      setAttemptedNext(false);
      setCurrentStep(steps[stepIndex + 1] ?? 'finish');
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
      router.push('/success');
      return;
    }

    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
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
    <div aria-busy={isSubmitting}>
      <WizardProgress currentStep={currentStep} steps={steps} />

      <div className="space-y-6">
        {currentStep === 'identity' ? <IdentityStep {...stepProps} /> : null}
        {currentStep === 'profile' ? <ProfileStep {...stepProps} /> : null}
        {currentStep === 'own-residence-interest' ? (
          <OwnResidenceInterestStep {...stepProps} />
        ) : null}
        {currentStep === 'own-residence-details' ? (
          <OwnResidenceDetailsStep {...stepProps} />
        ) : null}
        {currentStep === 'investment' ? <InvestmentStep {...stepProps} /> : null}
        {currentStep === 'market-research' ? <MarketResearchStep {...stepProps} /> : null}
        {currentStep === 'finish' ? <FinishStep {...stepProps} /> : null}
      </div>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
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

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
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
          {isLastStep
            ? isSubmitting
              ? tForm('submitting')
              : tForm('submit')
            : tWizard('next')}
        </Button>
      </div>
    </div>
  );
}
