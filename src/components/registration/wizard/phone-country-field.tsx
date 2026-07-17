'use client';

import type { CountryCode } from 'libphonenumber-js';
import { useLocale, useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { listPhoneCountries, resolvePhoneCountry } from '@/lib/validation/phone-countries';

type PhoneCountryFieldProps = {
  id: string;
  phone: string;
  phoneCountry: CountryCode;
  disabled: boolean;
  invalid: boolean;
  onPhoneChange: (value: string) => void;
  onCountryChange: (value: CountryCode) => void;
};

const selectClassName = cn(
  'h-10 shrink-0 rounded-md border border-input bg-background px-2 text-sm text-foreground',
  'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'max-w-[48%] sm:max-w-[14rem]',
);

/**
 * Phone number field with an explicit country (calling-code) selector for international visitors.
 */
export function PhoneCountryField({
  id,
  phone,
  phoneCountry,
  disabled,
  invalid,
  onPhoneChange,
  onCountryChange,
}: PhoneCountryFieldProps) {
  const tForm = useTranslations('form');
  const locale = useLocale();
  const countries = listPhoneCountries(locale);
  const selectedCountry = resolvePhoneCountry(phoneCountry);

  return (
    <div className="flex gap-2">
      <label className="sr-only" htmlFor={`${id}-country`}>
        {tForm('phoneCountry')}
      </label>
      <select
        id={`${id}-country`}
        name="phoneCountry"
        className={selectClassName}
        value={selectedCountry}
        disabled={disabled}
        aria-invalid={invalid}
        onChange={(event) => onCountryChange(resolvePhoneCountry(event.target.value))}
      >
        {countries.map((option) => (
          <option key={option.code} value={option.code}>
            {option.flag} {option.name} (+{option.callingCode})
          </option>
        ))}
      </select>

      <Input
        id={id}
        name="phone"
        type="tel"
        autoComplete="tel-national"
        inputMode="tel"
        className="min-w-0 flex-1"
        placeholder={tForm('phonePlaceholder')}
        value={phone}
        disabled={disabled}
        aria-invalid={invalid}
        onChange={(event) => onPhoneChange(event.target.value)}
      />
    </div>
  );
}
