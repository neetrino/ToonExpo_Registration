import { applyMootqRegistrationSchema } from '@/lib/integrations/mootq/apply-registration-schema';
import type { MootqCodedAnswer } from '@/lib/integrations/mootq/apply-registration-schema';
import { buildMootqCodedAnswers } from '@/lib/integrations/mootq/build-mootq-coded-answers';
import {
  MOOTQ_EVENT_ID,
  MOOTQ_TICKET_QUANTITY,
  MOOTQ_TICKET_TYPE_ID,
} from '@/lib/integrations/mootq/mootq-order-ids';
import type { MootqRegistrationSchema } from '@/lib/integrations/mootq/registration-schema';
import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';

export type MootqPushLocale = QuestionnaireLocale;

export type MootqPushPayload = {
  event_id: number;
  items: Array<{ ticket_type_id: number; quantity: number }>;
  buyer: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
  answers: {
    per_order: Record<string, MootqCodedAnswer>;
    per_user: Record<string, MootqCodedAnswer>;
    per_ticket: Record<string, MootqCodedAnswer>;
  };
  external_order_ref: string;
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

/**
 * Toon Expo → Mootq order body. Question ids come from the schema fetched for this send.
 * Ticket code, locale, and UTM stay in Toon Expo and are not part of this body.
 */
export function buildMootqPushPayload(
  input: BuildMootqPushPayloadInput,
  schema: MootqRegistrationSchema,
): MootqPushPayload {
  return {
    event_id: MOOTQ_EVENT_ID,
    items: [{ ticket_type_id: MOOTQ_TICKET_TYPE_ID, quantity: MOOTQ_TICKET_QUANTITY }],
    buyer: {
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
      email: input.email,
    },
    answers: applyMootqRegistrationSchema(schema, buildMootqCodedAnswers(input)),
    external_order_ref: input.sourceRegistrationId,
  };
}
