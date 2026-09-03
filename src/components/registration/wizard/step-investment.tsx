import { Input } from '@/components/ui/input';
import { QUESTIONNAIRE_DEFINITION } from '@/lib/questionnaire/definition';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import { FormField, QuestionField } from './form-field';
import { getOptionLabel, getQuestionLabel } from './labels';
import { LocationChoiceFields } from './location-choice-fields';
import { OptionRadioGroup } from './option-groups';
import type { WizardFieldErrors, WizardState } from './types';

type StepProps = {
  state: WizardState;
  errors: WizardFieldErrors;
  disabled: boolean;
  locale: QuestionnaireLocale;
  onUpdate: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
};

const { investment } = QUESTIONNAIRE_DEFINITION.branches;

export function InvestmentTypeStep({ state, errors, disabled, locale, onUpdate }: StepProps) {
  return (
    <div className="space-y-8">
      <QuestionField
        legend={getQuestionLabel('investmentPropertyType', locale)}
        error={errors.investmentPropertyType}
      >
        <OptionRadioGroup
          name="investmentPropertyType"
          value={state.investmentPropertyType}
          options={investment.investmentPropertyType.options}
          getLabel={(value) => getOptionLabel('investmentPropertyType', value, locale)}
          onChange={(value) => {
            onUpdate('investmentPropertyType', value);
            if (value !== 'other') {
              onUpdate('investmentPropertyTypeOther', '');
            }
          }}
          disabled={disabled}
          error={Boolean(errors.investmentPropertyType)}
        />
      </QuestionField>

      {state.investmentPropertyType === 'other' ? (
        <FormField
          id="investmentPropertyTypeOther"
          label={getQuestionLabel('investmentPropertyTypeOther', locale)}
          error={errors.investmentPropertyTypeOther}
          input={
            <Input
              id="investmentPropertyTypeOther"
              value={state.investmentPropertyTypeOther}
              disabled={disabled}
              aria-invalid={Boolean(errors.investmentPropertyTypeOther)}
              onChange={(event) => onUpdate('investmentPropertyTypeOther', event.target.value)}
            />
          }
        />
      ) : null}
    </div>
  );
}

export function InvestmentLocationStep({ state, errors, disabled, locale, onUpdate }: StepProps) {
  return (
    <LocationChoiceFields
      questionKey="investmentLocation"
      state={state}
      errors={errors}
      disabled={disabled}
      locale={locale}
      onUpdate={onUpdate}
    />
  );
}

export function InvestmentGoalStep({ state, errors, disabled, locale, onUpdate }: StepProps) {
  return (
    <div className="space-y-8">
      <QuestionField
        legend={getQuestionLabel('investmentGoal', locale)}
        error={errors.investmentGoal}
      >
        <OptionRadioGroup
          name="investmentGoal"
          value={state.investmentGoal}
          options={investment.investmentGoal.options}
          getLabel={(value) => getOptionLabel('investmentGoal', value, locale)}
          onChange={(value) => onUpdate('investmentGoal', value)}
          disabled={disabled}
          error={Boolean(errors.investmentGoal)}
        />
      </QuestionField>

      <QuestionField
        legend={getQuestionLabel('investmentTimeline', locale)}
        error={errors.investmentTimeline}
      >
        <OptionRadioGroup
          name="investmentTimeline"
          value={state.investmentTimeline}
          options={investment.investmentTimeline.options}
          getLabel={(value) => getOptionLabel('investmentTimeline', value, locale)}
          onChange={(value) => onUpdate('investmentTimeline', value)}
          disabled={disabled}
          error={Boolean(errors.investmentTimeline)}
        />
      </QuestionField>
    </div>
  );
}

export function InvestmentSizeStep({ state, errors, disabled, locale, onUpdate }: StepProps) {
  return (
    <div className="space-y-8">
      <QuestionField legend={getQuestionLabel('areaSqm', locale)} error={errors.areaSqm}>
        <OptionRadioGroup
          name="investmentAreaSqm"
          value={state.areaSqm}
          options={investment.areaSqm.options}
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
          name="investmentPurchaseMethod"
          value={state.purchaseMethod}
          options={investment.purchaseMethod.options}
          getLabel={(value) => getOptionLabel('purchaseMethod', value, locale)}
          onChange={(value) => onUpdate('purchaseMethod', value)}
          disabled={disabled}
          error={Boolean(errors.purchaseMethod)}
        />
      </QuestionField>
    </div>
  );
}

export function InvestmentBudgetStep({ state, errors, disabled, locale, onUpdate }: StepProps) {
  return (
    <div className="space-y-8">
      <QuestionField
        legend={getQuestionLabel('investmentBudgetUsd', locale)}
        error={errors.investmentBudgetUsd}
      >
        <OptionRadioGroup
          name="investmentBudgetUsd"
          value={state.investmentBudgetUsd}
          options={investment.investmentBudgetUsd.options}
          getLabel={(value) => getOptionLabel('investmentBudgetUsd', value, locale)}
          onChange={(value) => onUpdate('investmentBudgetUsd', value)}
          disabled={disabled}
          error={Boolean(errors.investmentBudgetUsd)}
        />
      </QuestionField>

      <QuestionField
        legend={getQuestionLabel('priorInvestmentExperience', locale)}
        error={errors.priorInvestmentExperience}
      >
        <OptionRadioGroup
          name="priorInvestmentExperience"
          value={state.priorInvestmentExperience}
          options={investment.priorInvestmentExperience.options}
          getLabel={(value) => getOptionLabel('priorInvestmentExperience', value, locale)}
          onChange={(value) => {
            onUpdate('priorInvestmentExperience', value);
            if (value !== 'yes_abroad') {
              onUpdate('priorInvestmentExperienceOther', '');
            }
          }}
          disabled={disabled}
          error={Boolean(errors.priorInvestmentExperience)}
        />
      </QuestionField>

      {state.priorInvestmentExperience === 'yes_abroad' ? (
        <FormField
          id="priorInvestmentExperienceOther"
          label={getQuestionLabel('priorInvestmentExperienceOther', locale)}
          error={errors.priorInvestmentExperienceOther}
          input={
            <Input
              id="priorInvestmentExperienceOther"
              value={state.priorInvestmentExperienceOther}
              disabled={disabled}
              aria-invalid={Boolean(errors.priorInvestmentExperienceOther)}
              onChange={(event) => onUpdate('priorInvestmentExperienceOther', event.target.value)}
            />
          }
        />
      ) : null}
    </div>
  );
}
