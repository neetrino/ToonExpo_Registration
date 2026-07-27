import { PRIVACY_POLICY_VERSION } from '@/lib/privacy';
import type { Locale } from '@/types/locale';
import { getOrCreateRegistrationIdempotencyKey } from './idempotency';
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
  const idempotencyKey = getOrCreateRegistrationIdempotencyKey();

  try {
    response = await fetch('/api/registrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
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
    try {
      const body = (await response.json()) as {
        registrationId?: string;
        ticketCode?: string;
        ticketViewToken?: string;
      };

      if (body.registrationId && body.ticketCode && body.ticketViewToken) {
        return {
          ok: true,
          registrationId: body.registrationId,
          ticketCode: body.ticketCode,
          ticketViewToken: body.ticketViewToken,
        };
      }
    } catch {
      return { ok: false, status: 500, code: 'INTERNAL_ERROR' };
    }

    return { ok: false, status: 500, code: 'INTERNAL_ERROR' };
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
