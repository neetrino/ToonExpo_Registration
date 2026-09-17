import { buildMootqPartnerAnswers } from '@/lib/integrations/mootq/build-mootq-partner-answers';
import type { MootqAnswers } from '@/lib/integrations/mootq/flatten-answers';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';

export type MootqPushLocale = QuestionnaireLocale;

export type MootqPushPayload = {
  eventKey: string;
  sourceRegistrationId: string;
  ticketCode: string;
  registeredAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  locale: MootqPushLocale;
  answers: MootqAnswers;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

export type BuildMootqPushPayloadInput = {
  eventKey: string;
  sourceRegistrationId: string;
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
 * Toon Expo → Mootq registration body (partner live schema, 2026-09).
 * Includes eventKey + sourceRegistrationId and CRM field_* answers.
 */
export function buildMootqPushPayload(input: BuildMootqPushPayloadInput): MootqPushPayload {
  const payload: MootqPushPayload = {
    eventKey: input.eventKey,
    sourceRegistrationId: input.sourceRegistrationId,
    ticketCode: input.ticketCode,
    registeredAt: input.registeredAt.toISOString(),
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    locale: input.locale,
    answers: buildMootqPartnerAnswers({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      locale: input.locale,
      formVersion: input.formVersion,
      answers: input.answers,
    }),
  };

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
