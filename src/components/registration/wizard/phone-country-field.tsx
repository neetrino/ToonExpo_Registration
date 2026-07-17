'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { getCountryCallingCode, type CountryCode } from 'libphonenumber-js';
import { useLocale, useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  filterPhoneCountries,
  listPhoneCountries,
  resolvePhoneCountry,
} from '@/lib/validation/phone-countries';

type PhoneCountryFieldProps = {
  id: string;
  phone: string;
  phoneCountry: CountryCode;
  disabled: boolean;
  invalid: boolean;
  onPhoneChange: (value: string) => void;
  onCountryChange: (value: CountryCode) => void;
};

const triggerClassName = cn(
  'flex h-10 shrink-0 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-sm text-foreground',
  'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'min-w-[7.5rem] max-w-[48%] sm:max-w-[11rem]',
);

function countryFlagEmoji(code: CountryCode): string {
  return [...code].map((char) => String.fromCodePoint(127397 + char.charCodeAt(0))).join('');
}

/**
 * Phone number field with a searchable country (calling-code) combobox.
 * The options panel mounts only after open to avoid Intl ICU hydration mismatches.
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
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selectedCountry = resolvePhoneCountry(phoneCountry);
  const selectedCallingCode = getCountryCallingCode(selectedCountry);
  const selectedFlag = countryFlagEmoji(selectedCountry);
  const filtered = open
    ? filterPhoneCountries(listPhoneCountries(locale), query)
    : [];

  useEffect(() => {
    if (!open) {
      return;
    }

    searchRef.current?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const selectCountry = (code: CountryCode) => {
    onCountryChange(code);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="flex gap-2">
      <div ref={rootRef} className="relative min-w-0 shrink-0">
        <label className="sr-only" htmlFor={`${id}-country`}>
          {tForm('phoneCountry')}
        </label>
        <button
          id={`${id}-country`}
          type="button"
          className={triggerClassName}
          disabled={disabled}
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="listbox"
          onClick={() => {
            setOpen((current) => !current);
            setQuery('');
          }}
        >
          <span aria-hidden="true">{selectedFlag}</span>
          <span className="truncate font-medium">+{selectedCallingCode}</span>
        </button>

        <input type="hidden" name="phoneCountry" value={selectedCountry} />

        {open ? (
          <div
            className="absolute left-0 z-50 mt-1 w-[min(100vw-2rem,20rem)] overflow-hidden rounded-md border border-input bg-background shadow-lg"
            role="presentation"
          >
            <div className="border-b border-input p-2">
              <Input
                ref={searchRef}
                type="search"
                value={query}
                disabled={disabled}
                placeholder={tForm('phoneCountrySearch')}
                aria-autocomplete="list"
                aria-controls={listId}
                autoComplete="off"
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <ul
              id={listId}
              role="listbox"
              aria-label={tForm('phoneCountry')}
              className="max-h-60 overflow-y-auto py-1"
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  {tForm('phoneCountryEmpty')}
                </li>
              ) : (
                filtered.map((option) => {
                  const isSelected = option.code === selectedCountry;
                  return (
                    <li key={option.code} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={cn(
                          'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground',
                          'hover:bg-muted focus-visible:bg-muted focus-visible:outline-none',
                          isSelected && 'bg-muted',
                        )}
                        onClick={() => selectCountry(option.code)}
                      >
                        <span aria-hidden="true">{option.flag}</span>
                        <span className="min-w-0 flex-1 truncate">{option.name}</span>
                        <span className="shrink-0 text-muted-foreground">
                          {option.code} +{option.callingCode}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        ) : null}
      </div>

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
