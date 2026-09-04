import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { QUESTIONNAIRE_DEFINITION } from '@/lib/questionnaire/definition';
import { LOCATION_CHOICE_MAX, MARKET_INTERESTS_MAX } from '@/lib/questionnaire/constants';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import type { ResearchLocationScope } from '@/lib/questionnaire/types';
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
const { locationChoice } = QUESTIONNAIRE_DEFINITION;

function applyResearchScope(onUpdate: StepProps['onUpdate'], scope: ResearchLocationScope): void {
  onUpdate('researchScopes', [scope]);
  if (scope !== 'yerevan') {
    onUpdate('yerevanDistricts', []);
  }
  if (scope !== 'marz') {
    onUpdate('marzRegions', []);
  }
  if (scope !== 'abroad') {
    onUpdate('researchAbroadCountry', '');
  }
}

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
  const tWizard = useTranslations('wizard');
  const selectedScope = state.researchScopes[0];
  const leafHint = tWizard('locationChoiceHint', { max: LOCATION_CHOICE_MAX });

  return (
    <div className="space-y-8">
      <QuestionField
        legend={getQuestionLabel('interestedWhere', locale)}
        error={errors.researchScopes}
      >
        <OptionRadioGroup
          name="researchScopes"
          value={selectedScope ?? ''}
          options={marketResearch.researchLocation.scopes}
          getLabel={(value) => getOptionLabel('researchScopes', value, locale)}
          onChange={(scope) => applyResearchScope(onUpdate, scope)}
          disabled={disabled}
          error={Boolean(errors.researchScopes)}
        />
      </QuestionField>

      {selectedScope === 'yerevan' ? (
        <QuestionField
          legend={getQuestionLabel('yerevanDistricts', locale)}
          hint={leafHint}
          error={errors.yerevanDistricts}
        >
          <OptionCheckboxGroup
            name="researchYerevanDistricts"
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
            name="researchMarzRegions"
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
        <FormField
          id="researchAbroadCountry"
          label={getQuestionLabel('interestedWhereOther', locale)}
          error={errors.researchAbroadCountry}
          input={
            <Input
              id="researchAbroadCountry"
              value={state.researchAbroadCountry}
              disabled={disabled}
              aria-invalid={Boolean(errors.researchAbroadCountry)}
              onChange={(event) => onUpdate('researchAbroadCountry', event.target.value)}
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
