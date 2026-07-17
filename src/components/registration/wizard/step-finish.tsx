import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Label } from '@/components/ui/label';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import { QuestionField } from './form-field';
import { getOptionLabel, getQuestionLabel } from './labels';
import { YesNoRadioGroup } from './option-groups';
import type { WizardFieldErrors, WizardState } from './types';

type StepProps = {
  state: WizardState;
  errors: WizardFieldErrors;
  disabled: boolean;
  locale: QuestionnaireLocale;
  onUpdate: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
};

export function FinishStep({ state, errors, disabled, locale, onUpdate }: StepProps) {
  const tForm = useTranslations('form');

  return (
    <div className="space-y-8">
      <QuestionField legend={getQuestionLabel('newsletter', locale)} error={errors.newsletter}>
        <YesNoRadioGroup
          name="newsletter"
          value={state.newsletter}
          yesLabel={getOptionLabel('newsletter', 'yes', locale)}
          noLabel={getOptionLabel('newsletter', 'no', locale)}
          onChange={(value) => onUpdate('newsletter', value)}
          disabled={disabled}
          error={Boolean(errors.newsletter)}
        />
      </QuestionField>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <input
            id="privacyConsent"
            name="privacyConsent"
            type="checkbox"
            checked={state.privacyConsent}
            disabled={disabled}
            aria-invalid={Boolean(errors.privacyConsent)}
            className="mt-1 size-4 shrink-0 rounded border border-input accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onChange={(event) => onUpdate('privacyConsent', event.target.checked)}
          />
          <Label htmlFor="privacyConsent" className="font-normal leading-snug text-muted-foreground">
            {tForm('consentPrefix')}{' '}
            <Link href="/privacy" className="text-secondary underline-offset-4 hover:underline">
              {tForm('consentLink')}
            </Link>
          </Label>
        </div>
        {errors.privacyConsent ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.privacyConsent}
          </p>
        ) : null}
      </div>
    </div>
  );
}
