import {
  applyMootqRegistrationSchema,
  type MootqCodedAnswers,
} from '@/lib/integrations/mootq/apply-registration-schema';
import { buildMootqCodedAnswers } from '@/lib/integrations/mootq/build-mootq-coded-answers';
import type {
  MootqIdentityField,
  MootqRegistrationSchema,
} from '@/lib/integrations/mootq/registration-schema';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';

export type MootqPushLocale = QuestionnaireLocale;

/** Partner Registration envelope (`POST /api/v1/integrations/registrations`). */
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
  answers: MootqCodedAnswers;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

export type BuildMootqPushPayloadInput = {
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

export type MootqPushPayloadResult = {
  payload: MootqPushPayload;
  missingRequired: string[];
};

/**
 * Build the registration body from the schema fetched for this send.
 * `eventKey` and identity answer codes come from that schema.
 */
export function buildMootqPushPayload(
  input: BuildMootqPushPayloadInput,
  schema: MootqRegistrationSchema,
): MootqPushPayloadResult {
  const coded = { ...buildMootqCodedAnswers(input), ...identityAnswers(input, schema) };
  const { answers, missingRequired } = applyMootqRegistrationSchema(schema, coded);

  const payload: MootqPushPayload = {
    eventKey: schema.eventKey,
    sourceRegistrationId: input.sourceRegistrationId,
    ticketCode: input.ticketCode,
    registeredAt: input.registeredAt.toISOString(),
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    locale: input.locale,
    answers,
  };
  assignOptionalUtm(payload, 'utmSource', input.utmSource);
  assignOptionalUtm(payload, 'utmMedium', input.utmMedium);
  assignOptionalUtm(payload, 'utmCampaign', input.utmCampaign);
  return { payload, missingRequired };
}

function identityAnswers(
  input: BuildMootqPushPayloadInput,
  schema: MootqRegistrationSchema,
): MootqCodedAnswers {
  const answers: MootqCodedAnswers = {};
  const fields: readonly MootqIdentityField[] = ['firstName', 'lastName', 'email', 'phone'];
  for (const field of fields) {
    const code = schema.identityAnswerCodes[field];
    if (code) {
      answers[code] = input[field];
    }
  }
  return answers;
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
