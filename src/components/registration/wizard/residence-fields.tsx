import { Input } from '@/components/ui/input';
import { QUESTIONNAIRE_DEFINITION } from '@/lib/questionnaire';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import { FormField, QuestionField } from './form-field';
import { getOptionLabel, getQuestionLabel } from './labels';
import { OptionRadioGroup } from './option-groups';
import type { WizardFieldErrors, WizardState } from './types';

type ResidenceFieldsProps = {
  state: WizardState;
  errors: WizardFieldErrors;
  disabled: boolean;
  locale: QuestionnaireLocale;
  onUpdate: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
};

const { residence } = QUESTIONNAIRE_DEFINITION.shared;

export function ResidenceFields({
  state,
  errors,
  disabled,
  locale,
  onUpdate,
}: ResidenceFieldsProps) {
  return (
    <div className="space-y-8">
      <QuestionField legend={getQuestionLabel('residence', locale)} error={errors.residenceScope}>
        <OptionRadioGroup
          name="residenceScope"
          value={state.residenceScope}
          options={residence.scopes}
          getLabel={(value) => getOptionLabel('locationSeekScope', value, locale)}
          onChange={(value) => {
            onUpdate('residenceScope', value);
            onUpdate('residenceDistrict', '');
            onUpdate('residenceRegion', '');
            if (value !== 'abroad') {
              onUpdate('residenceCountry', '');
            }
          }}
          disabled={disabled}
          error={Boolean(errors.residenceScope)}
        />
      </QuestionField>

      {state.residenceScope === 'yerevan' ? (
        <QuestionField
          legend={getQuestionLabel('residenceDistrict', locale)}
          error={errors.residenceDistrict}
        >
          <OptionRadioGroup
            name="residenceDistrict"
            value={state.residenceDistrict}
            options={residence.yerevanDistricts}
            getLabel={(value) => getOptionLabel('yerevanDistricts', value, locale)}
            onChange={(value) => onUpdate('residenceDistrict', value)}
            disabled={disabled}
            error={Boolean(errors.residenceDistrict)}
          />
        </QuestionField>
      ) : null}

      {state.residenceScope === 'marz' ? (
        <QuestionField
          legend={getQuestionLabel('residenceRegion', locale)}
          error={errors.residenceRegion}
        >
          <OptionRadioGroup
            name="residenceRegion"
            value={state.residenceRegion}
            options={residence.marzRegions}
            getLabel={(value) => getOptionLabel('marzRegions', value, locale)}
            onChange={(value) => onUpdate('residenceRegion', value)}
            disabled={disabled}
            error={Boolean(errors.residenceRegion)}
          />
        </QuestionField>
      ) : null}

      {state.residenceScope === 'abroad' ? (
        <FormField
          id="residenceCountry"
          label={getQuestionLabel('residenceCountry', locale)}
          error={errors.residenceCountry}
          input={
            <Input
              id="residenceCountry"
              value={state.residenceCountry}
              disabled={disabled}
              aria-invalid={Boolean(errors.residenceCountry)}
              onChange={(event) => onUpdate('residenceCountry', event.target.value)}
            />
          }
        />
      ) : null}
    </div>
  );
}
