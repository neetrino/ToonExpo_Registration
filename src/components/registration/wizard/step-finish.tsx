import { useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { PRIVACY_POLICY_PANEL_ID, PrivacyPolicyPanel } from './privacy-policy-panel';
import type { WizardFieldErrors } from './types';

export type FinishStepFields = {
  privacyConsent: boolean;
};

type StepProps = {
  state: FinishStepFields;
  errors: WizardFieldErrors;
  disabled: boolean;
  onUpdate: (key: 'privacyConsent', value: boolean) => void;
};

function ConsentDocumentReference({
  children,
  expanded,
  onOpen,
}: {
  children: ReactNode;
  expanded: boolean;
  onOpen: () => void;
}) {
  return (
    <a
      href={`#${PRIVACY_POLICY_PANEL_ID}`}
      aria-controls={PRIVACY_POLICY_PANEL_ID}
      aria-expanded={expanded}
      className="inline font-medium text-secondary underline underline-offset-4 hover:text-primary"
      onClick={(event) => {
        event.preventDefault();
        onOpen();
      }}
    >
      {children}
    </a>
  );
}

/** Opens the policy panel and brings its top into view once it has rendered. */
function usePolicyPanel(): { open: boolean; toggle: () => void; reveal: () => void } {
  const [open, setOpen] = useState(false);
  const [revealRequest, setRevealRequest] = useState(0);

  useEffect(() => {
    if (revealRequest === 0) {
      return;
    }
    const panel = document.getElementById(PRIVACY_POLICY_PANEL_ID);
    panel?.scrollTo({ top: 0 });
    panel?.focus({ preventScroll: true });
    panel?.scrollIntoView({ block: 'nearest' });
  }, [revealRequest]);

  return {
    open,
    toggle: () => setOpen((current) => !current),
    reveal: () => {
      setOpen(true);
      setRevealRequest((current) => current + 1);
    },
  };
}

export function FinishStep({ state, errors, disabled, onUpdate }: StepProps) {
  const tForm = useTranslations('form');
  const policy = usePolicyPanel();

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'flex items-start gap-3 rounded-xl border px-3 py-3 transition-colors duration-200 motion-reduce:transition-none',
          errors.privacyConsent
            ? 'border-destructive bg-destructive/5'
            : state.privacyConsent
              ? 'border-accent/40 bg-accent/5'
              : 'border-transparent',
        )}
      >
        <input
          id="privacyConsent"
          name="privacyConsent"
          type="checkbox"
          checked={state.privacyConsent}
          disabled={disabled}
          aria-invalid={Boolean(errors.privacyConsent)}
          aria-describedby="privacyConsentLabel"
          className="mt-1 size-4 shrink-0 rounded border border-input accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onChange={(event) => onUpdate('privacyConsent', event.target.checked)}
        />
        <label
          id="privacyConsentLabel"
          htmlFor="privacyConsent"
          className="cursor-pointer text-sm leading-snug text-muted-foreground"
        >
          {tForm.rich('consent', {
            terms: (chunks) => (
              <ConsentDocumentReference expanded={policy.open} onOpen={policy.reveal}>
                {chunks}
              </ConsentDocumentReference>
            ),
            privacy: (chunks) => (
              <ConsentDocumentReference expanded={policy.open} onOpen={policy.reveal}>
                {chunks}
              </ConsentDocumentReference>
            ),
          })}
        </label>
      </div>
      {errors.privacyConsent ? (
        <p className="text-sm text-destructive" role="alert">
          {errors.privacyConsent}
        </p>
      ) : null}
      <PrivacyPolicyPanel open={policy.open} onToggle={policy.toggle} />
    </div>
  );
}
