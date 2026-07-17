import { cn } from '@/lib/utils';

type OptionRadioGroupProps<T extends string> = {
  name: string;
  value: T | '';
  options: readonly T[];
  getLabel: (value: T) => string;
  onChange: (value: T) => void;
  disabled?: boolean;
  error?: boolean;
};

export function OptionRadioGroup<T extends string>({
  name,
  value,
  options,
  getLabel,
  onChange,
  disabled = false,
  error = false,
}: OptionRadioGroupProps<T>) {
  return (
    <div className="space-y-2" role="radiogroup" aria-invalid={error || undefined}>
      {options.map((option) => {
        const id = `${name}-${option}`;
        const checked = value === option;

        return (
          <label
            key={option}
            htmlFor={id}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 transition-colors',
              checked ? 'border-accent bg-accent/5' : 'border-input bg-background hover:bg-muted/50',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={option}
              checked={checked}
              disabled={disabled}
              className="mt-0.5 size-4 shrink-0 accent-accent"
              onChange={() => onChange(option)}
            />
            <span className="text-sm leading-snug text-foreground">{getLabel(option)}</span>
          </label>
        );
      })}
    </div>
  );
}

type OptionCheckboxGroupProps<T extends string> = {
  name: string;
  values: T[];
  options: readonly T[];
  max?: number;
  getLabel: (value: T) => string;
  onChange: (values: T[]) => void;
  disabled?: boolean;
  error?: boolean;
};

export function OptionCheckboxGroup<T extends string>({
  name,
  values,
  options,
  max,
  getLabel,
  onChange,
  disabled = false,
  error = false,
}: OptionCheckboxGroupProps<T>) {
  const toggle = (option: T) => {
    if (values.includes(option)) {
      onChange(values.filter((value) => value !== option));
      return;
    }

    if (max !== undefined && values.length >= max) {
      return;
    }

    onChange([...values, option]);
  };

  return (
    <div className="space-y-2" aria-invalid={error || undefined}>
      {options.map((option) => {
        const id = `${name}-${option}`;
        const checked = values.includes(option);
        const atMax = max !== undefined && values.length >= max && !checked;

        return (
          <label
            key={option}
            htmlFor={id}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 transition-colors',
              checked ? 'border-accent bg-accent/5' : 'border-input bg-background hover:bg-muted/50',
              (disabled || atMax) && 'cursor-not-allowed opacity-50',
            )}
          >
            <input
              id={id}
              type="checkbox"
              name={name}
              value={option}
              checked={checked}
              disabled={disabled || atMax}
              className="mt-0.5 size-4 shrink-0 rounded border border-input accent-accent"
              onChange={() => toggle(option)}
            />
            <span className="text-sm leading-snug text-foreground">{getLabel(option)}</span>
          </label>
        );
      })}
    </div>
  );
}

type YesNoRadioGroupProps = {
  name: string;
  value: boolean | null;
  yesLabel: string;
  noLabel: string;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  error?: boolean;
};

export function YesNoRadioGroup({
  name,
  value,
  yesLabel,
  noLabel,
  onChange,
  disabled = false,
  error = false,
}: YesNoRadioGroupProps) {
  return (
    <OptionRadioGroup
      name={name}
      value={value === null ? '' : value ? 'yes' : 'no'}
      options={['yes', 'no'] as const}
      getLabel={(option) => (option === 'yes' ? yesLabel : noLabel)}
      onChange={(option) => onChange(option === 'yes')}
      disabled={disabled}
      error={error}
    />
  );
}
