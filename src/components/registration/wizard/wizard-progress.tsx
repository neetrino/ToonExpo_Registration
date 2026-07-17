import { useTranslations } from 'next-intl';
import type { WizardStepId } from './types';

type WizardProgressProps = {
  currentStep: WizardStepId;
  steps: WizardStepId[];
};

export function WizardProgress({ currentStep, steps }: WizardProgressProps) {
  const tWizard = useTranslations('wizard');
  const currentIndex = steps.indexOf(currentStep);
  const stepNumber = currentIndex >= 0 ? currentIndex + 1 : 1;
  const totalSteps = steps.length;
  const progressPercent = totalSteps > 0 ? (stepNumber / totalSteps) * 100 : 0;

  return (
    <div className="mb-8 space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {tWizard('progress', { current: stepNumber, total: totalSteps })}
        </p>
        <span className="text-xs font-medium tabular-nums text-accent">{stepNumber}</span>
      </div>
      <div
        className="relative h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={stepNumber}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={tWizard('progress', { current: stepNumber, total: totalSteps })}
      >
        <div
          className="wizard-progress-fill absolute inset-y-0 left-0 rounded-full bg-accent"
          style={{ width: `${progressPercent}%` }}
        />
        <div
          className="wizard-progress-fill absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-highlight"
          style={{ left: `calc(${progressPercent}% - 5px)` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
