'use client';

import type { ReactNode } from 'react';

type WizardStepPanelProps = {
  stepKey: string;
  children: ReactNode;
};

export function WizardStepPanel({ stepKey, children }: WizardStepPanelProps) {
  return (
    <div key={stepKey} className="wizard-step-panel relative z-10">
      {children}
    </div>
  );
}
