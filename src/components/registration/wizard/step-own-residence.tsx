import { Input } from '@/components/ui/input';
import { QUESTIONNAIRE_DEFINITION } from '@/lib/questionnaire/definition';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import { FormField, QuestionField } from './form-field';
import { getOptionLabel, getQuestionLabel } from './labels';
import { OptionCheckboxGroup, OptionRadioGroup } from './option-groups';
import type { WizardFieldErrors, WizardState } from './types';

type StepProps = {
  state: WizardState;
  errors: WizardFieldErrors;
  disabled: boolean;
  locale: QuestionnaireLocale;
  onUpdate: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
};

const { own_residence: ownResidence } = QUESTIONNAIRE_DEFINITION.branches;

function needsLocationSeek(state: WizardState): boolean {
  if (state.interestType !== 'house_townhouse' && state.interestType !== 'apartment_new') {
    return false;
  }

  return ownResidence.interestType.locationSeekFor.includes(state.interestType);
}

export function OwnResidenceInterestStep({ state, errors, disabled, locale, onUpdate }: StepProps) {
  return (
    <div className="space-y-8">
      <QuestionField legend={getQuestionLabel('interestType', locale)} error={errors.interestType}>
        <OptionRadioGroup
          name="interestType"
          value={state.interestType}
          options={ownResidence.interestType.options}
          getLabel={(value) => getOptionLabel('interestType', value, locale)}
          onChange={(value) => {
            onUpdate('interestType', value);
            if (value === 'abroad') {
              onUpdate('locationSeekScope', '');
              onUpdate('yerevanDistricts', []);
              onUpdate('marzRegions', []);
            } else {
              onUpdate('abroadCountries', []);
              onUpdate('abroadCountriesOther', '');
            }
          }}
          disabled={disabled}
          error={Boolean(errors.interestType)}
        />
      </QuestionField>

      {state.interestType === 'abroad' ? (
        <>
          <QuestionField
            legend={getQuestionLabel('abroadCountries', locale)}
            error={errors.abroadCountries}
          >
            <OptionCheckboxGroup
              name="abroadCountries"
              values={state.abroadCountries}
              options={ownResidence.abroadCountries.options}
              getLabel={(value) => getOptionLabel('abroadCountries', value, locale)}
              onChange={(values) => onUpdate('abroadCountries', values)}
              disabled={disabled}
              error={Boolean(errors.abroadCountries)}
            />
          </QuestionField>

          {state.abroadCountries.includes('other') ? (
            <FormField
              id="abroadCountriesOther"
              label={getQuestionLabel('abroadCountriesOther', locale)}
              error={errors.abroadCountriesOther}
              input={
                <Input
                  id="abroadCountriesOther"
                  value={state.abroadCountriesOther}
                  disabled={disabled}
                  aria-invalid={Boolean(errors.abroadCountriesOther)}
                  onChange={(event) => onUpdate('abroadCountriesOther', event.target.value)}
                />
              }
            />
          ) : null}
        </>
      ) : null}

      {needsLocationSeek(state) ? (
        <>
          <QuestionField
            legend={getQuestionLabel('locationSeek', locale)}
            error={errors.locationSeekScope}
          >
            <OptionRadioGroup
              name="locationSeekScope"
              value={state.locationSeekScope}
              options={ownResidence.locationSeek.scopes}
              getLabel={(value) => getOptionLabel('locationSeekScope', value, locale)}
              onChange={(value) => {
                onUpdate('locationSeekScope', value);
                onUpdate('yerevanDistricts', []);
                onUpdate('marzRegions', []);
              }}
              disabled={disabled}
              error={Boolean(errors.locationSeekScope)}
            />
          </QuestionField>

          {state.locationSeekScope === 'yerevan' ? (
            <QuestionField
              legend={getQuestionLabel('yerevanDistricts', locale)}
              error={errors.yerevanDistricts}
            >
              <OptionCheckboxGroup
                name="yerevanDistricts"
                values={state.yerevanDistricts}
                options={ownResidence.locationSeek.yerevanDistricts}
                getLabel={(value) => getOptionLabel('yerevanDistricts', value, locale)}
                onChange={(values) => onUpdate('yerevanDistricts', values)}
                disabled={disabled}
                error={Boolean(errors.yerevanDistricts)}
              />
            </QuestionField>
          ) : null}

          {state.locationSeekScope === 'marz' ? (
            <QuestionField
              legend={getQuestionLabel('marzRegions', locale)}
              error={errors.marzRegions}
            >
              <OptionCheckboxGroup
                name="marzRegions"
                values={state.marzRegions}
                options={ownResidence.locationSeek.marzRegions}
                getLabel={(value) => getOptionLabel('marzRegions', value, locale)}
                onChange={(values) => onUpdate('marzRegions', values)}
                disabled={disabled}
                error={Boolean(errors.marzRegions)}
              />
            </QuestionField>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export function OwnResidenceDetailsStep({ state, errors, disabled, locale, onUpdate }: StepProps) {
  return (
    <div className="space-y-8">
      <QuestionField legend={getQuestionLabel('areaSqm', locale)} error={errors.areaSqm}>
        <OptionRadioGroup
          name="areaSqm"
          value={state.areaSqm}
          options={ownResidence.areaSqm.options}
          getLabel={(value) => getOptionLabel('areaSqm', value, locale)}
          onChange={(value) => onUpdate('areaSqm', value)}
          disabled={disabled}
          error={Boolean(errors.areaSqm)}
        />
      </QuestionField>

      <QuestionField
        legend={getQuestionLabel('purchaseMethod', locale)}
        error={errors.purchaseMethod}
      >
        <OptionRadioGroup
          name="purchaseMethod"
          value={state.purchaseMethod}
          options={ownResidence.purchaseMethod.options}
          getLabel={(value) => getOptionLabel('purchaseMethod', value, locale)}
          onChange={(value) => onUpdate('purchaseMethod', value)}
          disabled={disabled}
          error={Boolean(errors.purchaseMethod)}
        />
      </QuestionField>

      <QuestionField
        legend={getQuestionLabel('monthlyBudget', locale)}
        error={errors.monthlyBudget}
      >
        <OptionRadioGroup
          name="monthlyBudget"
          value={state.monthlyBudget}
          options={ownResidence.monthlyBudget.options}
          getLabel={(value) => getOptionLabel('monthlyBudget', value, locale)}
          onChange={(value) => onUpdate('monthlyBudget', value)}
          disabled={disabled}
          error={Boolean(errors.monthlyBudget)}
        />
      </QuestionField>

      <QuestionField
        legend={getQuestionLabel('decisionStage', locale)}
        error={errors.decisionStage}
      >
        <OptionRadioGroup
          name="decisionStage"
          value={state.decisionStage}
          options={ownResidence.decisionStage.options}
          getLabel={(value) => getOptionLabel('decisionStage', value, locale)}
          onChange={(value) => onUpdate('decisionStage', value)}
          disabled={disabled}
          error={Boolean(errors.decisionStage)}
        />
      </QuestionField>
    </div>
  );
}
