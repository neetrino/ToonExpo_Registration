import { PRIVACY_POLICY_VERSION } from '@/lib/privacy';
import type { Locale } from '@/types/locale';
import type { RegistrationSubmitPayload } from './wizard/build-payload';
import type {
  RegistrationApiErrorBody,
  RegistrationFieldErrors,
  SubmitRegistrationResult,
} from './types';

const SERVER_FIELD_MAP: Record<string, keyof RegistrationFieldErrors> = {
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  phone: 'phone',
  privacyConsent: 'privacyConsent',
};

function mapServerFieldErrors(
  errors: Record<string, string[]> | undefined,
): RegistrationFieldErrors | undefined {
  if (!errors) {
    return undefined;
  }

  const mapped: RegistrationFieldErrors = {};

  for (const [key, messages] of Object.entries(errors)) {
    const field = SERVER_FIELD_MAP[key];
    const message = messages[0];

    if (field && message) {
      mapped[field] = message;
    }
  }

  return Object.keys(mapped).length > 0 ? mapped : undefined;
}

export async function submitRegistration(
  values: RegistrationSubmitPayload,
  locale: Locale,
  honeypot: string,
): Promise<SubmitRegistrationResult> {
  let response: Response;

  try {
    response = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        phoneCountry: values.phoneCountry,
        locale,
        privacyConsent: values.privacyConsent,
        privacyPolicyVersion: PRIVACY_POLICY_VERSION,
        formVersion: values.formVersion,
        answers: values.answers,
        website: honeypot,
      }),
    });
  } catch {
    return { ok: false, status: 0 };
  }

  if (response.status === 201) {
    return { ok: true };
  }

  let body: RegistrationApiErrorBody | undefined;

  try {
    body = (await response.json()) as RegistrationApiErrorBody;
  } catch {
    body = undefined;
  }

  return {
    ok: false,
    status: response.status,
    code: body?.code,
    fieldErrors: mapServerFieldErrors(body?.errors),
  };
}
