import { Input } from '@/components/ui/input';
import { FormField, QuestionField } from '@/components/registration/wizard/form-field';
import { OptionCheckboxGroup, OptionRadioGroup } from '@/components/registration/wizard/option-groups';
import {
  AREA_SQM_BANDS,
  DECISION_STAGES,
  INVESTMENT_BUDGETS_USD,
  INVESTMENT_PROPERTY_TYPES,
  INVESTMENT_TIMELINES,
  MARKET_INTERESTS,
  PRIOR_INVESTMENT_EXPERIENCES,
  PURCHASE_HORIZONS,
  PURCHASE_METHODS,
} from '@/lib/questionnaire/options';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import { MARKET_INTERESTS_MAX } from '@/lib/questionnaire/constants';
import { SPYURK_MULTI_SELECT_MAX } from '@/lib/questionnaire/spyurk/constants';
import {
  INVESTMENT_TYPES_REQUIRING_AREA,
  PURCHASE_BUDGETS_USD,
  SPYURK_INTEREST_TYPES,
  SPYURK_INVESTMENT_GOALS,
  SPYURK_RESEARCH_GOALS,
} from '@/lib/questionnaire/spyurk/options';
import {
  getSpyurkOptionLabel,
  getSpyurkQuestionLabel,
} from '@/lib/questionnaire/spyurk/i18n';
import {
  SpyurkPropertyCountryFields,
  SpyurkVisitAndNewsletterFields,
} from './step-fields';
import type { SpyurkWizardFieldErrors, SpyurkWizardState } from './types';

type StepProps = {
  state: SpyurkWizardState;
  errors: SpyurkWizardFieldErrors;
  disabled: boolean;
  locale: QuestionnaireLocale;
  onUpdate: <K extends keyof SpyurkWizardState>(key: K, value: SpyurkWizardState[K]) => void;
};

function needsInvestmentArea(state: SpyurkWizardState): boolean {
  return state.investmentPropertyTypes.some((type) =>
    (INVESTMENT_TYPES_REQUIRING_AREA as readonly string[]).includes(type),
  );
}

export function SpyurkOwnInterestStep(props: StepProps) {
  const { state, errors, disabled, locale, onUpdate } = props;
  return (
    <div className="space-y-8">
      <QuestionField
        legend={getSpyurkQuestionLabel('interestTypes', locale)}
        error={errors.interestTypes}
      >
        <OptionCheckboxGroup
          name="interestTypes"
          values={state.interestTypes}
          options={SPYURK_INTEREST_TYPES}
          max={SPYURK_MULTI_SELECT_MAX}
          getLabel={(value) => getSpyurkOptionLabel('interestType', value, locale)}
          onChange={(values) => onUpdate('interestTypes', values)}
          disabled={disabled}
          error={Boolean(errors.interestTypes)}
        />
      </QuestionField>
      {state.interestTypes.includes('other') ? (
        <FormField
          id="interestTypesOther"
          label={getSpyurkQuestionLabel('interestTypesOther', locale)}
          error={errors.interestTypesOther}
          input={
            <Input
              id="interestTypesOther"
              value={state.interestTypesOther}
              disabled={disabled}
              onChange={(event) => onUpdate('interestTypesOther', event.target.value)}
            />
          }
        />
      ) : null}
      <SpyurkPropertyCountryFields {...props} />
    </div>
  );
}

export function SpyurkOwnDetailsStep({ state, errors, disabled, locale, onUpdate }: StepProps) {
  return (
    <div className="space-y-8">
      <QuestionField legend={getSpyurkQuestionLabel('areaSqm', locale)} error={errors.areaSqm}>
        <OptionRadioGroup
          name="areaSqm"
          value={state.areaSqm}
          options={AREA_SQM_BANDS}
          getLabel={(value) => getSpyurkOptionLabel('areaSqm', value, locale)}
          onChange={(value) => onUpdate('areaSqm', value)}
          disabled={disabled}
          error={Boolean(errors.areaSqm)}
        />
      </QuestionField>
      <QuestionField
        legend={getSpyurkQuestionLabel('purchaseMethod', locale)}
        error={errors.purchaseMethod}
      >
        <OptionRadioGroup
          name="purchaseMethod"
          value={state.purchaseMethod}
          options={PURCHASE_METHODS}
          getLabel={(value) => getSpyurkOptionLabel('purchaseMethod', value, locale)}
          onChange={(value) => onUpdate('purchaseMethod', value)}
          disabled={disabled}
          error={Boolean(errors.purchaseMethod)}
        />
      </QuestionField>
      <QuestionField
        legend={getSpyurkQuestionLabel('purchaseBudgetUsd', locale)}
        error={errors.purchaseBudgetUsd}
      >
        <OptionRadioGroup
          name="purchaseBudgetUsd"
          value={state.purchaseBudgetUsd}
          options={PURCHASE_BUDGETS_USD}
          getLabel={(value) => getSpyurkOptionLabel('purchaseBudgetUsd', value, locale)}
          onChange={(value) => onUpdate('purchaseBudgetUsd', value)}
          disabled={disabled}
          error={Boolean(errors.purchaseBudgetUsd)}
        />
      </QuestionField>
      <QuestionField
        legend={getSpyurkQuestionLabel('decisionStage', locale)}
        error={errors.decisionStage}
      >
        <OptionRadioGroup
          name="decisionStage"
          value={state.decisionStage}
          options={DECISION_STAGES}
          getLabel={(value) => getSpyurkOptionLabel('decisionStage', value, locale)}
          onChange={(value) => onUpdate('decisionStage', value)}
          disabled={disabled}
          error={Boolean(errors.decisionStage)}
        />
      </QuestionField>
    </div>
  );
}

export function SpyurkOwnFollowupStep(props: StepProps) {
  return (
    <div className="space-y-8">
      <SpyurkVisitAndNewsletterFields {...props} />
    </div>
  );
}

export function SpyurkInvestmentTypeStep(props: StepProps) {
  const { state, errors, disabled, locale, onUpdate } = props;
  return (
    <div className="space-y-8">
      <QuestionField
        legend={getSpyurkQuestionLabel('investmentPropertyTypes', locale)}
        error={errors.investmentPropertyTypes}
      >
        <OptionCheckboxGroup
          name="investmentPropertyTypes"
          values={state.investmentPropertyTypes}
          options={INVESTMENT_PROPERTY_TYPES}
          max={SPYURK_MULTI_SELECT_MAX}
          getLabel={(value) => getSpyurkOptionLabel('investmentPropertyType', value, locale)}
          onChange={(values) => onUpdate('investmentPropertyTypes', values)}
          disabled={disabled}
          error={Boolean(errors.investmentPropertyTypes)}
        />
      </QuestionField>
      {state.investmentPropertyTypes.includes('other') ? (
        <FormField
          id="investmentPropertyTypeOther"
          label={getSpyurkQuestionLabel('investmentPropertyTypeOther', locale)}
          error={errors.investmentPropertyTypeOther}
          input={
            <Input
              id="investmentPropertyTypeOther"
              value={state.investmentPropertyTypeOther}
              disabled={disabled}
              onChange={(event) => onUpdate('investmentPropertyTypeOther', event.target.value)}
            />
          }
        />
      ) : null}
      <SpyurkPropertyCountryFields {...props} />
    </div>
  );
}

export function SpyurkInvestmentGoalStep({ state, errors, disabled, locale, onUpdate }: StepProps) {
  return (
    <QuestionField
      legend={getSpyurkQuestionLabel('investmentGoal', locale)}
      error={errors.investmentGoal}
    >
      <OptionRadioGroup
        name="investmentGoal"
        value={state.investmentGoal}
        options={SPYURK_INVESTMENT_GOALS}
        getLabel={(value) => getSpyurkOptionLabel('investmentGoal', value, locale)}
        onChange={(value) => onUpdate('investmentGoal', value)}
        disabled={disabled}
        error={Boolean(errors.investmentGoal)}
      />
    </QuestionField>
  );
}

export function SpyurkInvestmentDetailsStep({
  state,
  errors,
  disabled,
  locale,
  onUpdate,
}: StepProps) {
  return (
    <div className="space-y-8">
      {needsInvestmentArea(state) ? (
        <QuestionField legend={getSpyurkQuestionLabel('areaSqm', locale)} error={errors.areaSqm}>
          <OptionRadioGroup
            name="areaSqm"
            value={state.areaSqm}
            options={AREA_SQM_BANDS}
            getLabel={(value) => getSpyurkOptionLabel('areaSqm', value, locale)}
            onChange={(value) => onUpdate('areaSqm', value)}
            disabled={disabled}
            error={Boolean(errors.areaSqm)}
          />
        </QuestionField>
      ) : null}
      <QuestionField
        legend={getSpyurkQuestionLabel('purchaseMethod', locale)}
        error={errors.purchaseMethod}
      >
        <OptionRadioGroup
          name="purchaseMethod"
          value={state.purchaseMethod}
          options={PURCHASE_METHODS}
          getLabel={(value) => getSpyurkOptionLabel('purchaseMethod', value, locale)}
          onChange={(value) => onUpdate('purchaseMethod', value)}
          disabled={disabled}
          error={Boolean(errors.purchaseMethod)}
        />
      </QuestionField>
      <QuestionField
        legend={getSpyurkQuestionLabel('investmentTimeline', locale)}
        error={errors.investmentTimeline}
      >
        <OptionRadioGroup
          name="investmentTimeline"
          value={state.investmentTimeline}
          options={INVESTMENT_TIMELINES}
          getLabel={(value) => getSpyurkOptionLabel('investmentTimeline', value, locale)}
          onChange={(value) => onUpdate('investmentTimeline', value)}
          disabled={disabled}
          error={Boolean(errors.investmentTimeline)}
        />
      </QuestionField>
      <QuestionField
        legend={getSpyurkQuestionLabel('investmentBudgetUsd', locale)}
        error={errors.investmentBudgetUsd}
      >
        <OptionRadioGroup
          name="investmentBudgetUsd"
          value={state.investmentBudgetUsd}
          options={INVESTMENT_BUDGETS_USD}
          getLabel={(value) => getSpyurkOptionLabel('investmentBudgetUsd', value, locale)}
          onChange={(value) => onUpdate('investmentBudgetUsd', value)}
          disabled={disabled}
          error={Boolean(errors.investmentBudgetUsd)}
        />
      </QuestionField>
    </div>
  );
}

export function SpyurkInvestmentFollowupStep(props: StepProps) {
  const { state, errors, disabled, locale, onUpdate } = props;
  const needsCountry =
    state.priorInvestmentExperience === 'yes_abroad' ||
    state.priorInvestmentExperience === 'yes_both';

  return (
    <div className="space-y-8">
      <QuestionField
        legend={getSpyurkQuestionLabel('priorInvestmentExperience', locale)}
        error={errors.priorInvestmentExperience}
      >
        <OptionRadioGroup
          name="priorInvestmentExperience"
          value={state.priorInvestmentExperience}
          options={PRIOR_INVESTMENT_EXPERIENCES}
          getLabel={(value) => getSpyurkOptionLabel('priorInvestmentExperience', value, locale)}
          onChange={(value) => onUpdate('priorInvestmentExperience', value)}
          disabled={disabled}
          error={Boolean(errors.priorInvestmentExperience)}
        />
      </QuestionField>
      {needsCountry ? (
        <FormField
          id="priorInvestmentExperienceOther"
          label={getSpyurkQuestionLabel('priorInvestmentExperienceOther', locale)}
          error={errors.priorInvestmentExperienceOther}
          input={
            <Input
              id="priorInvestmentExperienceOther"
              value={state.priorInvestmentExperienceOther}
              disabled={disabled}
              onChange={(event) => onUpdate('priorInvestmentExperienceOther', event.target.value)}
            />
          }
        />
      ) : null}
      <SpyurkVisitAndNewsletterFields {...props} />
    </div>
  );
}

export function SpyurkResearchFocusStep({ state, errors, disabled, locale, onUpdate }: StepProps) {
  return (
    <div className="space-y-8">
      <QuestionField
        legend={getSpyurkQuestionLabel('marketInterests', locale)}
        error={errors.marketInterests}
      >
        <OptionCheckboxGroup
          name="marketInterests"
          values={state.marketInterests}
          options={MARKET_INTERESTS}
          max={MARKET_INTERESTS_MAX}
          getLabel={(value) => getSpyurkOptionLabel('marketInterest', value, locale)}
          onChange={(values) => onUpdate('marketInterests', values)}
          disabled={disabled}
          error={Boolean(errors.marketInterests)}
        />
      </QuestionField>
      <QuestionField
        legend={getSpyurkQuestionLabel('researchGoal', locale)}
        error={errors.researchGoal}
      >
        <OptionRadioGroup
          name="researchGoal"
          value={state.researchGoal}
          options={SPYURK_RESEARCH_GOALS}
          getLabel={(value) => getSpyurkOptionLabel('researchGoal', value, locale)}
          onChange={(value) => onUpdate('researchGoal', value)}
          disabled={disabled}
          error={Boolean(errors.researchGoal)}
        />
      </QuestionField>
    </div>
  );
}

export function SpyurkResearchFollowupStep(props: StepProps) {
  const { state, errors, disabled, locale, onUpdate } = props;
  return (
    <div className="space-y-8">
      <SpyurkPropertyCountryFields {...props} />
      <QuestionField
        legend={getSpyurkQuestionLabel('purchaseHorizon', locale)}
        error={errors.purchaseHorizon}
      >
        <OptionRadioGroup
          name="purchaseHorizon"
          value={state.purchaseHorizon}
          options={PURCHASE_HORIZONS}
          getLabel={(value) => getSpyurkOptionLabel('purchaseHorizon', value, locale)}
          onChange={(value) => onUpdate('purchaseHorizon', value)}
          disabled={disabled}
          error={Boolean(errors.purchaseHorizon)}
        />
      </QuestionField>
      <SpyurkVisitAndNewsletterFields {...props} />
    </div>
  );
}
