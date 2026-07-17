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

      <QuestionField
        legend={getQuestionLabel('investmentMarket', locale)}
        error={errors.investmentMarket}
      >
        <OptionRadioGroup
          name="investmentMarket"
          value={state.investmentMarket}
          options={investment.investmentMarket.options}
          getLabel={(value) => getOptionLabel('investmentMarket', value, locale)}
          onChange={(value) => {
            onUpdate('investmentMarket', value);
            if (value !== 'other') {
              onUpdate('investmentMarketOther', '');
            }
          }}
          disabled={disabled}
          error={Boolean(errors.investmentMarket)}
        />
      </QuestionField>

      {state.investmentMarket === 'other' ? (
        <FormField
          id="investmentMarketOther"
          label={getQuestionLabel('investmentMarketOther', locale)}
          error={errors.investmentMarketOther}
          input={
            <Input
              id="investmentMarketOther"
              value={state.investmentMarketOther}
              disabled={disabled}
              aria-invalid={Boolean(errors.investmentMarketOther)}
              onChange={(event) => onUpdate('investmentMarketOther', event.target.value)}
            />
          }
        />
      ) : null}
    </div>
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
          onChange={(value) => onUpdate('priorInvestmentExperience', value)}
          disabled={disabled}
          error={Boolean(errors.priorInvestmentExperience)}
        />
      </QuestionField>
    </div>
  );
}
