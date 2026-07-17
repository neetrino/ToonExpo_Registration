import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  input: ReactNode;
};

export function FormField({ id, label, hint, error, input }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {input}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type QuestionFieldProps = {
  legend: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function QuestionField({ legend, hint, error, children }: QuestionFieldProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium leading-snug text-foreground">{legend}</legend>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <div className="space-y-2">{children}</div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
