import type { Locale } from '@/types/locale';

export type RegistrationPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  locale: Locale;
  privacyConsent: true;
  privacyPolicyVersion: string;
  website: string;
};

export type RegistrationFieldErrors = Partial<
  Record<'firstName' | 'lastName' | 'email' | 'phone' | 'privacyConsent', string>
>;

export type RegistrationApiErrorBody = {
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
};

export type SubmitRegistrationResult =
  | { ok: true }
  | {
      ok: false;
      status: number;
      code?: string;
      fieldErrors?: RegistrationFieldErrors;
    };
