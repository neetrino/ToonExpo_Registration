import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { LOCATION_CHOICE_MAX, QUESTIONNAIRE_DEFINITION } from '@/lib/questionnaire';
import type { AbroadCountry, LocationSeekScope } from '@/lib/questionnaire/types';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import { FormField, QuestionField } from './form-field';
import { getOptionLabel, getQuestionLabel } from './labels';
import { OptionCheckboxGroup, OptionRadioGroup } from './option-groups';
import type { WizardFieldErrors, WizardState } from './types';

type LocationChoiceFieldsProps = {
  questionKey: 'locationSeek' | 'investmentLocation';
  state: WizardState;
  errors: WizardFieldErrors;
  disabled: boolean;
  locale: QuestionnaireLocale;
  onUpdate: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
};

const { locationChoice } = QUESTIONNAIRE_DEFINITION;

function applyLocationSeekScope(
  onUpdate: LocationChoiceFieldsProps['onUpdate'],
  scope: LocationSeekScope,
): void {
  onUpdate('locationSeekScopes', [scope]);
  if (scope !== 'yerevan') {
    onUpdate('yerevanDistricts', []);
  }
  if (scope !== 'marz') {
    onUpdate('marzRegions', []);
  }
  if (scope !== 'abroad') {
    onUpdate('locationSeekAbroadCountries', []);
    onUpdate('locationSeekAbroadOther', '');
  }
}

export function LocationChoiceFields({
  questionKey,
  state,
  errors,
  disabled,
  locale,
  onUpdate,
}: LocationChoiceFieldsProps) {
  const tWizard = useTranslations('wizard');
  const selectedScope = state.locationSeekScopes[0];
  const leafHint = tWizard('locationChoiceHint', { max: LOCATION_CHOICE_MAX });

  return (
    <div className="space-y-8">
      <QuestionField
        legend={getQuestionLabel(questionKey, locale)}
        error={errors.locationSeekScopes}
      >
        <OptionRadioGroup
          name="locationSeekScopes"
          value={selectedScope ?? ''}
          options={locationChoice.scopes}
          getLabel={(value) => getOptionLabel('locationSeekScope', value, locale)}
          onChange={(scope) => applyLocationSeekScope(onUpdate, scope)}
          disabled={disabled}
          error={Boolean(errors.locationSeekScopes)}
        />
      </QuestionField>

      {selectedScope === 'yerevan' ? (
        <QuestionField
          legend={getQuestionLabel('yerevanDistricts', locale)}
          hint={leafHint}
          error={errors.yerevanDistricts}
        >
          <OptionCheckboxGroup
            name="yerevanDistricts"
            values={state.yerevanDistricts}
            options={locationChoice.yerevanDistricts}
            max={LOCATION_CHOICE_MAX}
            getLabel={(value) => getOptionLabel('yerevanDistricts', value, locale)}
            onChange={(values) => onUpdate('yerevanDistricts', values)}
            disabled={disabled}
            error={Boolean(errors.yerevanDistricts)}
          />
        </QuestionField>
      ) : null}

      {selectedScope === 'marz' ? (
        <QuestionField
          legend={getQuestionLabel('marzRegions', locale)}
          hint={leafHint}
          error={errors.marzRegions}
        >
          <OptionCheckboxGroup
            name="marzRegions"
            values={state.marzRegions}
            options={locationChoice.marzRegions}
            max={LOCATION_CHOICE_MAX}
            getLabel={(value) => getOptionLabel('marzRegions', value, locale)}
            onChange={(values) => onUpdate('marzRegions', values)}
            disabled={disabled}
            error={Boolean(errors.marzRegions)}
          />
        </QuestionField>
      ) : null}

      {selectedScope === 'abroad' ? (
        <>
          <QuestionField
            legend={getQuestionLabel('abroadCountries', locale)}
            hint={leafHint}
            error={errors.locationSeekAbroadCountries}
          >
            <OptionCheckboxGroup
              name="locationSeekAbroadCountries"
              values={state.locationSeekAbroadCountries}
              options={locationChoice.abroadCountries}
              max={LOCATION_CHOICE_MAX}
              getLabel={(value) => getOptionLabel('abroadCountries', value, locale)}
              onChange={(values) => onUpdate('locationSeekAbroadCountries', values)}
              disabled={disabled}
              error={Boolean(errors.locationSeekAbroadCountries)}
            />
          </QuestionField>

          {state.locationSeekAbroadCountries.includes('other' as AbroadCountry) ? (
            <FormField
              id="locationSeekAbroadOther"
              label={getQuestionLabel('locationSeekOther', locale)}
              error={errors.locationSeekAbroadOther}
              input={
                <Input
                  id="locationSeekAbroadOther"
                  value={state.locationSeekAbroadOther}
                  disabled={disabled}
                  aria-invalid={Boolean(errors.locationSeekAbroadOther)}
                  onChange={(event) => onUpdate('locationSeekAbroadOther', event.target.value)}
                />
              }
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
