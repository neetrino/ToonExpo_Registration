import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { QUESTIONNAIRE_DEFINITION } from '@/lib/questionnaire/definition';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import { FormField, QuestionField } from './form-field';
import { getOptionLabel, getQuestionLabel } from './labels';
import { OptionRadioGroup } from './option-groups';
import type { WizardFieldErrors, WizardState } from './types';

type StepProps = {
  state: WizardState;
  errors: WizardFieldErrors;
  disabled: boolean;
  onUpdate: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
};

export function IdentityStep({ state, errors, disabled, onUpdate }: StepProps) {
  const tForm = useTranslations('form');

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="firstName"
          label={tForm('firstName')}
          error={errors.firstName}
          input={
            <Input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              value={state.firstName}
              disabled={disabled}
              aria-invalid={Boolean(errors.firstName)}
              onChange={(event) => onUpdate('firstName', event.target.value)}
            />
          }
        />
        <FormField
          id="lastName"
          label={tForm('lastName')}
          error={errors.lastName}
          input={
            <Input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              value={state.lastName}
              disabled={disabled}
              aria-invalid={Boolean(errors.lastName)}
              onChange={(event) => onUpdate('lastName', event.target.value)}
            />
          }
        />
      </div>

      <FormField
        id="email"
        label={tForm('email')}
        error={errors.email}
        input={
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={state.email}
            disabled={disabled}
            aria-invalid={Boolean(errors.email)}
            onChange={(event) => onUpdate('email', event.target.value)}
          />
        }
      />

      <FormField
        id="phone"
        label={tForm('phone')}
        hint={tForm('phoneHint')}
        error={errors.phone}
        input={
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder={tForm('phonePlaceholder')}
            value={state.phone}
            disabled={disabled}
            aria-invalid={Boolean(errors.phone)}
            onChange={(event) => onUpdate('phone', event.target.value)}
          />
        }
      />
    </div>
  );
}

export function ProfileStep({
  state,
  errors,
  disabled,
  locale,
  onUpdate,
}: StepProps & { locale: QuestionnaireLocale }) {
  return (
    <div className="space-y-8">
      <QuestionField legend={getQuestionLabel('ageBand', locale)} error={errors.ageBand}>
        <OptionRadioGroup
          name="ageBand"
          value={state.ageBand}
          options={QUESTIONNAIRE_DEFINITION.shared.ageBand.options}
          getLabel={(value) => getOptionLabel('ageBand', value, locale)}
          onChange={(value) => onUpdate('ageBand', value)}
          disabled={disabled}
          error={Boolean(errors.ageBand)}
        />
      </QuestionField>

      <QuestionField
        legend={getQuestionLabel('visitPurpose', locale)}
        error={errors.visitPurpose}
      >
        <OptionRadioGroup
          name="visitPurpose"
          value={state.visitPurpose}
          options={QUESTIONNAIRE_DEFINITION.shared.visitPurpose.options}
          getLabel={(value) => getOptionLabel('visitPurpose', value, locale)}
          onChange={(value) => onUpdate('visitPurpose', value)}
          disabled={disabled}
          error={Boolean(errors.visitPurpose)}
        />
      </QuestionField>
    </div>
  );
}
