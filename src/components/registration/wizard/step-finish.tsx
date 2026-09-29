import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
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
      <div
        className={cn(
          'flex items-start gap-3 rounded-xl border px-3 py-3',
          errors.privacyConsent ? 'border-destructive bg-destructive/5' : 'border-transparent',
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
