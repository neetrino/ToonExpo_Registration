import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { LOCATION_CHOICE_MAX, QUESTIONNAIRE_DEFINITION } from '@/lib/questionnaire';
import { countLocationChoiceLeaves } from '@/lib/questionnaire/location-choice';
import type { AbroadCountry } from '@/lib/questionnaire/types';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import { FormField, QuestionField } from './form-field';
import { getOptionLabel, getQuestionLabel } from './labels';
import { OptionCheckboxGroup } from './option-groups';
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

function remainingLeaves(state: WizardState, currentCount: number): number {
  return LOCATION_CHOICE_MAX - (countLocationChoiceLeaves({
    yerevanDistricts: state.yerevanDistricts,
    marzRegions: state.marzRegions,
    abroadCountries: state.locationSeekAbroadCountries,
  }) - currentCount);
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

  return (
    <div className="space-y-8">
      <QuestionField
        legend={getQuestionLabel(questionKey, locale)}
        hint={tWizard('locationChoiceHint', { max: LOCATION_CHOICE_MAX })}
        error={errors.locationSeekScopes}
      >
        <OptionCheckboxGroup
          name="locationSeekScopes"
          values={state.locationSeekScopes}
          options={locationChoice.scopes}
          getLabel={(value) => getOptionLabel('locationSeekScope', value, locale)}
          onChange={(values) => {
            const removed = state.locationSeekScopes.filter((scope) => !values.includes(scope));
            onUpdate('locationSeekScopes', values);
            if (removed.includes('yerevan')) {
              onUpdate('yerevanDistricts', []);
            }
            if (removed.includes('marz')) {
              onUpdate('marzRegions', []);
            }
            if (removed.includes('abroad')) {
              onUpdate('locationSeekAbroadCountries', []);
              onUpdate('locationSeekAbroadOther', '');
            }
          }}
          disabled={disabled}
          error={Boolean(errors.locationSeekScopes)}
        />
      </QuestionField>

      {state.locationSeekScopes.includes('yerevan') ? (
        <QuestionField
          legend={getQuestionLabel('yerevanDistricts', locale)}
          error={errors.yerevanDistricts}
        >
          <OptionCheckboxGroup
            name="yerevanDistricts"
            values={state.yerevanDistricts}
            options={locationChoice.yerevanDistricts}
            max={state.yerevanDistricts.length + remainingLeaves(state, state.yerevanDistricts.length)}
            getLabel={(value) => getOptionLabel('yerevanDistricts', value, locale)}
            onChange={(values) => onUpdate('yerevanDistricts', values)}
            disabled={disabled}
            error={Boolean(errors.yerevanDistricts)}
          />
        </QuestionField>
      ) : null}

      {state.locationSeekScopes.includes('marz') ? (
        <QuestionField legend={getQuestionLabel('marzRegions', locale)} error={errors.marzRegions}>
          <OptionCheckboxGroup
            name="marzRegions"
            values={state.marzRegions}
            options={locationChoice.marzRegions}
            max={state.marzRegions.length + remainingLeaves(state, state.marzRegions.length)}
            getLabel={(value) => getOptionLabel('marzRegions', value, locale)}
            onChange={(values) => onUpdate('marzRegions', values)}
            disabled={disabled}
            error={Boolean(errors.marzRegions)}
          />
        </QuestionField>
      ) : null}

      {state.locationSeekScopes.includes('abroad') ? (
        <>
          <QuestionField
            legend={getQuestionLabel('abroadCountries', locale)}
            error={errors.locationSeekAbroadCountries}
          >
            <OptionCheckboxGroup
              name="locationSeekAbroadCountries"
              values={state.locationSeekAbroadCountries}
              options={locationChoice.abroadCountries}
              max={
                state.locationSeekAbroadCountries.length +
                remainingLeaves(state, state.locationSeekAbroadCountries.length)
              }
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
