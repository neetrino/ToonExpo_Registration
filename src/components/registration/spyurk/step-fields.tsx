import { Input } from '@/components/ui/input';
import { FormField, QuestionField } from '@/components/registration/wizard/form-field';
import {
  OptionCheckboxGroup,
  OptionRadioGroup,
  YesNoRadioGroup,
} from '@/components/registration/wizard/option-groups';
import { AGE_BANDS, VISIT_PURPOSES } from '@/lib/questionnaire/options';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import {
  ARMENIA_CONNECTIONS,
  ARMENIA_VISIT_TIMINGS,
  PROPERTY_COUNTRY_SCOPES,
  PURCHASE_MOTIVES,
} from '@/lib/questionnaire/spyurk/options';
import { SPYURK_MULTI_SELECT_MAX } from '@/lib/questionnaire/spyurk/constants';
import {
  getSpyurkOptionLabel,
  getSpyurkQuestionLabel,
} from '@/lib/questionnaire/spyurk/i18n';
import type { SpyurkWizardFieldErrors, SpyurkWizardState } from './types';

type StepProps = {
  state: SpyurkWizardState;
  errors: SpyurkWizardFieldErrors;
  disabled: boolean;
  locale: QuestionnaireLocale;
  onUpdate: <K extends keyof SpyurkWizardState>(key: K, value: SpyurkWizardState[K]) => void;
};

export function SpyurkProfileStep({ state, errors, disabled, locale, onUpdate }: StepProps) {
  return (
    <div className="space-y-8">
      <QuestionField legend={getSpyurkQuestionLabel('ageBand', locale)} error={errors.ageBand}>
        <OptionRadioGroup
          name="ageBand"
          value={state.ageBand}
          options={AGE_BANDS}
          getLabel={(value) => getSpyurkOptionLabel('ageBand', value, locale)}
          onChange={(value) => onUpdate('ageBand', value)}
          disabled={disabled}
          error={Boolean(errors.ageBand)}
        />
      </QuestionField>
      <FormField
        id="residenceCity"
        label={getSpyurkQuestionLabel('residenceCity', locale)}
        error={errors.residenceCity}
        input={
          <Input
            id="residenceCity"
            name="residenceCity"
            value={state.residenceCity}
            disabled={disabled}
            aria-invalid={Boolean(errors.residenceCity)}
            onChange={(event) => onUpdate('residenceCity', event.target.value)}
          />
        }
      />
      <FormField
        id="residenceRegion"
        label={getSpyurkQuestionLabel('residenceRegion', locale)}
        error={errors.residenceRegion}
        input={
          <Input
            id="residenceRegion"
            name="residenceRegion"
            value={state.residenceRegion}
            disabled={disabled}
            aria-invalid={Boolean(errors.residenceRegion)}
            onChange={(event) => onUpdate('residenceRegion', event.target.value)}
          />
        }
      />
    </div>
  );
}

export function SpyurkBackgroundStep({ state, errors, disabled, locale, onUpdate }: StepProps) {
  return (
    <div className="space-y-8">
      <QuestionField
        legend={getSpyurkQuestionLabel('armeniaConnection', locale)}
        error={errors.armeniaConnection}
      >
        <OptionRadioGroup
          name="armeniaConnection"
          value={state.armeniaConnection}
          options={ARMENIA_CONNECTIONS}
          getLabel={(value) => getSpyurkOptionLabel('armeniaConnection', value, locale)}
          onChange={(value) => onUpdate('armeniaConnection', value)}
          disabled={disabled}
          error={Boolean(errors.armeniaConnection)}
        />
      </QuestionField>
      {state.armeniaConnection === 'other' ? (
        <FormField
          id="armeniaConnectionOther"
          label={getSpyurkQuestionLabel('armeniaConnectionOther', locale)}
          error={errors.armeniaConnectionOther}
          input={
            <Input
              id="armeniaConnectionOther"
              name="armeniaConnectionOther"
              value={state.armeniaConnectionOther}
              disabled={disabled}
              onChange={(event) => onUpdate('armeniaConnectionOther', event.target.value)}
            />
          }
        />
      ) : null}
      <QuestionField
        legend={getSpyurkQuestionLabel('purchaseMotives', locale)}
        hint={`≤ ${SPYURK_MULTI_SELECT_MAX}`}
        error={errors.purchaseMotives}
      >
        <OptionCheckboxGroup
          name="purchaseMotives"
          values={state.purchaseMotives}
          options={PURCHASE_MOTIVES}
          max={SPYURK_MULTI_SELECT_MAX}
          getLabel={(value) => getSpyurkOptionLabel('purchaseMotive', value, locale)}
          onChange={(values) => onUpdate('purchaseMotives', values)}
          disabled={disabled}
          error={Boolean(errors.purchaseMotives)}
        />
      </QuestionField>
      {state.purchaseMotives.includes('other') ? (
        <FormField
          id="purchaseMotivesOther"
          label={getSpyurkQuestionLabel('purchaseMotivesOther', locale)}
          error={errors.purchaseMotivesOther}
          input={
            <Input
              id="purchaseMotivesOther"
              name="purchaseMotivesOther"
              value={state.purchaseMotivesOther}
              disabled={disabled}
              onChange={(event) => onUpdate('purchaseMotivesOther', event.target.value)}
            />
          }
        />
      ) : null}
      <QuestionField
        legend={getSpyurkQuestionLabel('visitPurpose', locale)}
        error={errors.visitPurpose}
      >
        <OptionRadioGroup
          name="visitPurpose"
          value={state.visitPurpose}
          options={VISIT_PURPOSES}
          getLabel={(value) => getSpyurkOptionLabel('visitPurpose', value, locale)}
          onChange={(value) => onUpdate('visitPurpose', value)}
          disabled={disabled}
          error={Boolean(errors.visitPurpose)}
        />
      </QuestionField>
    </div>
  );
}

export function SpyurkPropertyCountryFields({
  state,
  errors,
  disabled,
  locale,
  onUpdate,
}: StepProps) {
  return (
    <>
      <QuestionField
        legend={getSpyurkQuestionLabel('propertyCountry', locale)}
        error={errors.propertyCountryScope}
      >
        <OptionRadioGroup
          name="propertyCountryScope"
          value={state.propertyCountryScope}
          options={PROPERTY_COUNTRY_SCOPES}
          getLabel={(value) => getSpyurkOptionLabel('propertyCountry', value, locale)}
          onChange={(value) => onUpdate('propertyCountryScope', value)}
          disabled={disabled}
          error={Boolean(errors.propertyCountryScope)}
        />
      </QuestionField>
      {state.propertyCountryScope === 'other' ? (
        <FormField
          id="propertyCountryOther"
          label={getSpyurkQuestionLabel('propertyCountryOther', locale)}
          error={errors.propertyCountryOther}
          input={
            <Input
              id="propertyCountryOther"
              name="propertyCountryOther"
              value={state.propertyCountryOther}
              disabled={disabled}
              onChange={(event) => onUpdate('propertyCountryOther', event.target.value)}
            />
          }
        />
      ) : null}
    </>
  );
}

export function SpyurkVisitAndNewsletterFields({
  state,
  errors,
  disabled,
  locale,
  onUpdate,
}: StepProps) {
  return (
    <>
      <QuestionField
        legend={getSpyurkQuestionLabel('armeniaVisitTiming', locale)}
        error={errors.armeniaVisitTiming}
      >
        <OptionRadioGroup
          name="armeniaVisitTiming"
          value={state.armeniaVisitTiming}
          options={ARMENIA_VISIT_TIMINGS}
          getLabel={(value) => getSpyurkOptionLabel('armeniaVisitTiming', value, locale)}
          onChange={(value) => onUpdate('armeniaVisitTiming', value)}
          disabled={disabled}
          error={Boolean(errors.armeniaVisitTiming)}
        />
      </QuestionField>
      <QuestionField legend={getSpyurkQuestionLabel('newsletter', locale)} error={errors.newsletter}>
        <YesNoRadioGroup
          name="newsletter"
          value={state.newsletter}
          yesLabel={getSpyurkOptionLabel('newsletter', 'yes', locale)}
          noLabel={getSpyurkOptionLabel('newsletter', 'no', locale)}
          onChange={(value) => onUpdate('newsletter', value)}
          disabled={disabled}
          error={Boolean(errors.newsletter)}
        />
      </QuestionField>
    </>
  );
}
