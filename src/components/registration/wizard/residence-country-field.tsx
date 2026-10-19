import { useId, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  filterResidenceCountries,
  listResidenceCountries,
} from '@/lib/questionnaire/residence-countries';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';
import { getTextFieldPlaceholder } from '@/lib/questionnaire/placeholders';

type Props = {
  value: string;
  locale: QuestionnaireLocale;
  disabled: boolean;
  invalid: boolean;
  onChange: (value: string) => void;
};

export function ResidenceCountryField({ value, locale, disabled, invalid, onChange }: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const countries = useMemo(() => listResidenceCountries(locale), [locale]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const filtered = filterResidenceCountries(countries, query);
  const active = filtered[activeIndex];

  const select = (name: string) => {
    onChange(name);
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <Input
        id="residenceCountry"
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active ? `${listId}-${active.code}` : undefined}
        value={value}
        disabled={disabled}
        aria-invalid={invalid}
        autoComplete="off"
        placeholder={getTextFieldPlaceholder('residenceAbroad', locale)}
        onFocus={() => {
          setOpen(true);
          setQuery('');
          setActiveIndex(0);
        }}
        onChange={(event) => {
          onChange(event.target.value);
          setQuery(event.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            const next = Math.max(
              0,
              Math.min(filtered.length - 1, activeIndex + (event.key === 'ArrowDown' ? 1 : -1)),
            );
            setActiveIndex(next);
            document
              .getElementById(`${listId}-${filtered[next]?.code}`)
              ?.scrollIntoView({ block: 'nearest' });
          }
          if (event.key === 'Enter' && open && active) {
            event.preventDefault();
            select(active.name);
          }
        }}
      />
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby="residenceCountry"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-input bg-background py-1 shadow-lg"
        >
          {filtered.map((country, index) => (
            <li key={country.code} role="presentation">
              <button
                id={`${listId}-${country.code}`}
                type="button"
                role="option"
                aria-selected={value === country.name}
                tabIndex={-1}
                disabled={disabled}
                className={`w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted ${index === activeIndex ? 'bg-muted' : ''}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(country.name)}
              >
                {country.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
