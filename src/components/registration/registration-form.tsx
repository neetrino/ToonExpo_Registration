'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Locale } from '@/types/locale';
import type { ZodIssue } from 'zod';
import {
  registrationFormFieldKeys,
  registrationFormSchema,
  type RegistrationFormFieldKey,
} from './registration-schema';
import { submitRegistration } from './submit-registration';
import type { RegistrationFieldErrors } from './types';

type RegistrationFormProps = {
  locale: Locale;
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  privacyConsent: boolean;
  website: string;
};

const initialFormState: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  privacyConsent: false,
  website: '',
};

function resolveClientFieldError(
  tErrors: ReturnType<typeof useTranslations<'errors'>>,
  issue: ZodIssue,
): string {
  if (issue.path[0] === 'privacyConsent') {
    return tErrors('consentRequired');
  }

  if (
    issue.code === 'invalid_string' &&
    'validation' in issue &&
    issue.validation === 'email'
  ) {
    return tErrors('invalidEmail');
  }

  if (issue.code === 'too_small' || issue.code === 'invalid_type') {
    return tErrors('required');
  }

  return tErrors('validation');
}

export function RegistrationForm({ locale }: RegistrationFormProps) {
  const tForm = useTranslations('form');
  const tErrors = useTranslations('errors');
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<RegistrationFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (key in fieldErrors) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[key as RegistrationFormFieldKey];
        return next;
      });
    }
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = registrationFormSchema.safeParse({
      ...form,
      privacyConsent: form.privacyConsent ? true : undefined,
    });

    if (!parsed.success) {
      const nextErrors: RegistrationFieldErrors = {};

      for (const issue of parsed.error.issues) {
        const field = issue.path[0];

        if (
          typeof field === 'string' &&
          registrationFormFieldKeys.includes(field as RegistrationFormFieldKey)
        ) {
          nextErrors[field as RegistrationFormFieldKey] = resolveClientFieldError(
            tErrors,
            issue,
          );
        }
      }

      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    const result = await submitRegistration(parsed.data, locale, form.website);

    setIsSubmitting(false);

    if (result.ok) {
      router.push('/success');
      return;
    }

    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
    }

    if (result.status === 409 || result.code === 'DUPLICATE_EMAIL') {
      setFormError(tErrors('duplicate'));
      return;
    }

    if (result.status === 429 || result.code === 'RATE_LIMITED') {
      setFormError(tErrors('rateLimit'));
      return;
    }

    if (result.status === 400) {
      setFormError(tErrors('validation'));
      return;
    }

    if (result.status === 0) {
      setFormError(tErrors('network'));
      return;
    }

    setFormError(tErrors('server'));
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="space-y-5"
      aria-busy={isSubmitting}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="firstName"
          label={tForm('firstName')}
          error={fieldErrors.firstName}
          input={
            <Input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              value={form.firstName}
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.firstName)}
              aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined}
              onChange={(event) => updateField('firstName', event.target.value)}
            />
          }
        />
        <FormField
          id="lastName"
          label={tForm('lastName')}
          error={fieldErrors.lastName}
          input={
            <Input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              value={form.lastName}
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.lastName)}
              aria-describedby={fieldErrors.lastName ? 'lastName-error' : undefined}
              onChange={(event) => updateField('lastName', event.target.value)}
            />
          }
        />
      </div>

      <FormField
        id="email"
        label={tForm('email')}
        error={fieldErrors.email}
        input={
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={form.email}
            disabled={isSubmitting}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            onChange={(event) => updateField('email', event.target.value)}
          />
        }
      />

      <FormField
        id="phone"
        label={tForm('phone')}
        hint={tForm('phoneHint')}
        error={fieldErrors.phone}
        input={
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder={tForm('phonePlaceholder')}
            value={form.phone}
            disabled={isSubmitting}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={
              fieldErrors.phone ? 'phone-error phone-hint' : 'phone-hint'
            }
            onChange={(event) => updateField('phone', event.target.value)}
          />
        }
      />

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <input
            id="privacyConsent"
            name="privacyConsent"
            type="checkbox"
            checked={form.privacyConsent}
            disabled={isSubmitting}
            aria-invalid={Boolean(fieldErrors.privacyConsent)}
            aria-describedby={
              fieldErrors.privacyConsent ? 'privacyConsent-error' : undefined
            }
            className="mt-1 size-4 shrink-0 rounded border border-input accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onChange={(event) => updateField('privacyConsent', event.target.checked)}
          />
          <Label htmlFor="privacyConsent" className="font-normal leading-snug text-muted-foreground">
            {tForm('consentPrefix')}{' '}
            <Link href="/privacy" className="text-secondary underline-offset-4 hover:underline">
              {tForm('consentLink')}
            </Link>
          </Label>
        </div>
        {fieldErrors.privacyConsent ? (
          <p id="privacyConsent-error" className="text-sm text-destructive" role="alert">
            {fieldErrors.privacyConsent}
          </p>
        ) : null}
      </div>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) => updateField('website', event.target.value)}
        />
      </div>

      {formError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? tForm('submitting') : tForm('submit')}
      </Button>
    </form>
  );
}

type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  input: ReactNode;
};

function FormField({ id, label, hint, error, input }: FormFieldProps) {
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
