import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import { QuestionField } from './form-field';
import { getOptionLabel, getQuestionLabel } from './labels';
import { OptionRadioGroup } from './option-groups';

type Props = {
  purchaseMethod: string;
  value: boolean | '';
  error?: string;
  disabled: boolean;
  locale: QuestionnaireLocale;
  onChange: (value: boolean | '') => void;
};

export function IncomeTaxRefundField({
  purchaseMethod,
  value,
  error,
  disabled,
  locale,
  onChange,
}: Props) {
  if (purchaseMethod !== 'mortgage') return null;
  return (
    <QuestionField legend={getQuestionLabel('incomeTaxRefund', locale)} error={error}>
      <OptionRadioGroup
        name="incomeTaxRefund"
        value={value === '' ? '' : value ? 'yes' : 'no'}
        options={['yes', 'no'] as const}
        getLabel={(option) => getOptionLabel('incomeTaxRefund', option, locale)}
        onChange={(option) => onChange(option === '' ? '' : option === 'yes')}
        disabled={disabled}
        error={Boolean(error)}
      />
    </QuestionField>
  );
}
