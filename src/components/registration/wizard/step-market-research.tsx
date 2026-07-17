import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { QUESTIONNAIRE_DEFINITION } from '@/lib/questionnaire/definition';
import { MARKET_INTERESTS_MAX } from '@/lib/questionnaire/constants';
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

const { market_research: marketResearch } = QUESTIONNAIRE_DEFINITION.branches;

export function MarketResearchFocusStep({ state, errors, disabled, locale, onUpdate }: StepProps) {
  const tWizard = useTranslations('wizard');

  return (
    <div className="space-y-8">
      <QuestionField
        legend={getQuestionLabel('marketInterests', locale)}
        hint={tWizard('marketInterestsHint', { max: MARKET_INTERESTS_MAX })}
        error={errors.marketInterests}
      >
        <OptionCheckboxGroup
          name="marketInterests"
          values={state.marketInterests}
          options={marketResearch.marketInterests.options}
          max={MARKET_INTERESTS_MAX}
          getLabel={(value) => getOptionLabel('marketInterests', value, locale)}
          onChange={(values) => onUpdate('marketInterests', values)}
          disabled={disabled}
          error={Boolean(errors.marketInterests)}
        />
      </QuestionField>

      <QuestionField legend={getQuestionLabel('researchGoal', locale)} error={errors.researchGoal}>
        <OptionRadioGroup
          name="researchGoal"
          value={state.researchGoal}
          options={marketResearch.researchGoal.options}
          getLabel={(value) => getOptionLabel('researchGoal', value, locale)}
          onChange={(value) => onUpdate('researchGoal', value)}
          disabled={disabled}
          error={Boolean(errors.researchGoal)}
        />
      </QuestionField>
    </div>
  );
}

export function MarketResearchWhereStep({ state, errors, disabled, locale, onUpdate }: StepProps) {
  return (
    <div className="space-y-8">
      <QuestionField
        legend={getQuestionLabel('interestedWhere', locale)}
        error={errors.interestedWhere}
      >
        <OptionRadioGroup
          name="interestedWhere"
          value={state.interestedWhere}
          options={marketResearch.interestedWhere.options}
          getLabel={(value) => getOptionLabel('interestedWhere', value, locale)}
          onChange={(value) => {
            onUpdate('interestedWhere', value);
            if (value !== 'abroad') {
              onUpdate('interestedWhereOther', '');
            }
          }}
          disabled={disabled}
          error={Boolean(errors.interestedWhere)}
        />
      </QuestionField>

      {state.interestedWhere === 'abroad' ? (
        <FormField
          id="interestedWhereOther"
          label={getQuestionLabel('interestedWhereOther', locale)}
          error={errors.interestedWhereOther}
          input={
            <Input
              id="interestedWhereOther"
              value={state.interestedWhereOther}
              disabled={disabled}
              aria-invalid={Boolean(errors.interestedWhereOther)}
              onChange={(event) => onUpdate('interestedWhereOther', event.target.value)}
            />
          }
        />
      ) : null}

      <QuestionField
        legend={getQuestionLabel('purchaseHorizon', locale)}
        error={errors.purchaseHorizon}
      >
        <OptionRadioGroup
          name="purchaseHorizon"
          value={state.purchaseHorizon}
          options={marketResearch.purchaseHorizon.options}
          getLabel={(value) => getOptionLabel('purchaseHorizon', value, locale)}
          onChange={(value) => onUpdate('purchaseHorizon', value)}
          disabled={disabled}
          error={Boolean(errors.purchaseHorizon)}
        />
      </QuestionField>
    </div>
  );
}
