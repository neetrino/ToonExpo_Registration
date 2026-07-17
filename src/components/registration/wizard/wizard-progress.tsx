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

  return (
    <div className="mb-6 space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        {tWizard('progress', { current: stepNumber, total: totalSteps })}
      </p>
      <div className="flex gap-1.5" aria-hidden="true">
        {steps.map((step, index) => (
          <span
            key={step}
            className={`h-1.5 flex-1 rounded-full ${
              index <= currentIndex ? 'bg-accent' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
