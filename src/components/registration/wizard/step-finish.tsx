import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { WizardFieldErrors, WizardState } from './types';

type StepProps = {
  state: WizardState;
  errors: WizardFieldErrors;
  disabled: boolean;
  onUpdate: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
};

function ConsentDocumentLink({ href, children }: { href: '/privacy'; children: ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline text-secondary underline underline-offset-4 hover:text-primary"
    >
      {children}
    </Link>
  );
}

export function FinishStep({ state, errors, disabled, onUpdate }: StepProps) {
  const tForm = useTranslations('form');

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
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
        <p id="privacyConsentLabel" className="text-sm leading-snug text-muted-foreground">
          {tForm.rich('consent', {
            terms: (chunks) => <ConsentDocumentLink href="/privacy">{chunks}</ConsentDocumentLink>,
            privacy: (chunks) => (
              <ConsentDocumentLink href="/privacy">{chunks}</ConsentDocumentLink>
            ),
          })}
        </p>
      </div>
      {errors.privacyConsent ? (
        <p className="text-sm text-destructive" role="alert">
          {errors.privacyConsent}
        </p>
      ) : null}
    </div>
  );
}
