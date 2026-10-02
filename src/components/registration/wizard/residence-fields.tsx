import { Input } from '@/components/ui/input';
import { QUESTIONNAIRE_DEFINITION } from '@/lib/questionnaire';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import { getTextFieldPlaceholder } from '@/lib/questionnaire/placeholders';
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

function clearAragatsotnFields(onUpdate: ResidenceFieldsProps['onUpdate']): void {
  onUpdate('residenceAragatsotnLocality', '');
  onUpdate('residenceAragatsotnOther', '');
}

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
            clearAragatsotnFields(onUpdate);
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
          error={errors.residenceRegion ?? errors.residenceAragatsotnLocality}
        >
          <OptionRadioGroup
            name="residenceRegion"
            value={state.residenceRegion}
            options={residence.marzRegions}
            getLabel={(value) => getOptionLabel('marzRegions', value, locale)}
            onChange={(value) => {
              onUpdate('residenceRegion', value);
              if (value !== 'aragatsotn') {
                clearAragatsotnFields(onUpdate);
              }
            }}
            disabled={disabled}
            error={Boolean(errors.residenceRegion)}
            renderAfterOption={(option, checked) => {
              if (option !== 'aragatsotn' || !checked) {
                return null;
              }

              return (
                <div className="ml-2 space-y-2.5 rounded-xl border border-dashed border-accent/35 bg-muted/30 p-3 pl-3.5">
                  <OptionRadioGroup
                    name="residenceAragatsotnLocality"
                    value={state.residenceAragatsotnLocality}
                    options={residence.aragatsotnLocalities}
                    variant="nested"
                    getLabel={(value) =>
                      getOptionLabel('residenceAragatsotnLocality', value, locale)
                    }
                    onChange={(value) => {
                      onUpdate('residenceAragatsotnLocality', value);
                      if (value !== 'other') {
                        onUpdate('residenceAragatsotnOther', '');
                      }
                    }}
                    disabled={disabled}
                    error={Boolean(errors.residenceAragatsotnLocality)}
                  />

                  {state.residenceAragatsotnLocality === 'other' ? (
                    <FormField
                      id="residenceAragatsotnOther"
                      label={getQuestionLabel('residenceAragatsotnOther', locale)}
                      error={errors.residenceAragatsotnOther}
                      input={
                        <Input
                          id="residenceAragatsotnOther"
                          placeholder={getTextFieldPlaceholder('aragatsotnLocalityOther', locale)}
                          value={state.residenceAragatsotnOther}
                          disabled={disabled}
                          aria-invalid={Boolean(errors.residenceAragatsotnOther)}
                          onChange={(event) =>
                            onUpdate('residenceAragatsotnOther', event.target.value)
                          }
                        />
                      }
                    />
                  ) : null}
                </div>
              );
            }}
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
              placeholder={getTextFieldPlaceholder('residenceAbroad', locale)}
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
