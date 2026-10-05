import { Input } from '@/components/ui/input';
import { isMarzCityRegion, MARZ_CITY_OPTIONS } from '@/lib/questionnaire/marz-cities';
import type { MarzCityRegion } from '@/lib/questionnaire/marz-cities';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import { getTextFieldPlaceholder } from '@/lib/questionnaire/placeholders';
import { FormField } from './form-field';
import { getOptionLabel, getQuestionLabel } from './labels';
import type { MarzCityDraft, MarzCityOtherDraft } from './marz-city-draft';
import { OptionRadioGroup } from './option-groups';

type MarzCityFollowUpProps = {
  region: string;
  namePrefix: string;
  city: MarzCityDraft;
  other: MarzCityOtherDraft;
  errors: Partial<Record<string, string>>;
  disabled: boolean;
  locale: QuestionnaireLocale;
  cityErrorKey: (region: MarzCityRegion) => string;
  otherErrorKey: (region: MarzCityRegion) => string;
  onCityChange: (region: MarzCityRegion, city: string) => void;
  onOtherChange: (region: MarzCityRegion, value: string) => void;
};

/** City radios shown directly under a selected region that has a city choice. */
export function MarzCityFollowUp({
  region,
  namePrefix,
  city,
  other,
  errors,
  disabled,
  locale,
  cityErrorKey,
  otherErrorKey,
  onCityChange,
  onOtherChange,
}: MarzCityFollowUpProps) {
  if (!isMarzCityRegion(region)) {
    return null;
  }

  const selected = city[region];
  const cityError = errors[cityErrorKey(region)];
  const otherError = errors[otherErrorKey(region)];

  return (
    <div className="space-y-3">
      <OptionRadioGroup
        name={`${namePrefix}-${region}`}
        value={selected}
        options={MARZ_CITY_OPTIONS[region]}
        getLabel={(value) => getOptionLabel('marzCity', value, locale)}
        onChange={(value) => onCityChange(region, value)}
        disabled={disabled}
        error={Boolean(cityError)}
      />
      {cityError ? (
        <p className="text-sm text-destructive" role="alert">
          {cityError}
        </p>
      ) : null}
      {selected === 'other' ? (
        <FormField
          id={`${namePrefix}-${region}-other`}
          label={getQuestionLabel('marzCityOther', locale)}
          error={otherError}
          input={
            <Input
              id={`${namePrefix}-${region}-other`}
              placeholder={getTextFieldPlaceholder('marzCity', locale)}
              value={other[region]}
              disabled={disabled}
              aria-invalid={Boolean(otherError)}
              onChange={(event) => onOtherChange(region, event.target.value)}
            />
          }
        />
      ) : null}
    </div>
  );
}
