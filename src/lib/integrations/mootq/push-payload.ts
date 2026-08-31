import {
  flattenQuestionnaireAnswers,
  type MootqAnswers,
} from '@/lib/integrations/mootq/flatten-answers';

export type MootqPushLocale = 'hy' | 'en' | 'ru';

export type MootqPushPayload = {
  ticketCode: string;
  registeredAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  locale: MootqPushLocale;
  answers?: MootqAnswers;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

export type BuildMootqPushPayloadInput = {
  ticketCode: string;
  registeredAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  locale: MootqPushLocale;
  answers?: unknown;
  formVersion?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
};

/**
 * Toon Expo → Mootq registration body (contract 16).
 * sourceRegistrationId is the Idempotency-Key header only, not a JSON field.
 */
export function buildMootqPushPayload(input: BuildMootqPushPayloadInput): MootqPushPayload {
  const payload: MootqPushPayload = {
    ticketCode: input.ticketCode,
    registeredAt: input.registeredAt.toISOString(),
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    locale: input.locale,
  };

  const answers = flattenQuestionnaireAnswers({
    formVersion: input.formVersion,
    answers: input.answers,
  });
  if (answers) {
    payload.answers = answers;
  }

  assignOptionalUtm(payload, 'utmSource', input.utmSource);
  assignOptionalUtm(payload, 'utmMedium', input.utmMedium);
  assignOptionalUtm(payload, 'utmCampaign', input.utmCampaign);
  return payload;
}

function assignOptionalUtm(
  payload: MootqPushPayload,
  key: 'utmSource' | 'utmMedium' | 'utmCampaign',
  value: string | null | undefined,
): void {
  if (value) {
    payload[key] = value;
  }
}
