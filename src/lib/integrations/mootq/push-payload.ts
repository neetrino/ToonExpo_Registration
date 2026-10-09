import { buildMootqOrderPerUser } from '@/lib/integrations/mootq/build-mootq-order-answers';
import type { MootqOrderAnswerValue } from '@/lib/integrations/mootq/build-mootq-order-answers';
import {
  MOOTQ_EVENT_ID,
  MOOTQ_TICKET_QUANTITY,
  MOOTQ_TICKET_TYPE_ID,
} from '@/lib/integrations/mootq/mootq-order-ids';
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
    per_order: Record<string, MootqOrderAnswerValue>;
    per_user: Record<string, MootqOrderAnswerValue>;
    per_ticket: Record<string, MootqOrderAnswerValue>;
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
 * Toon Expo → Mootq order body confirmed by the partner example on 2026-10-09.
 * Ticket code, locale, and UTM stay in Toon Expo and are not part of this body.
 */
export function buildMootqPushPayload(input: BuildMootqPushPayloadInput): MootqPushPayload {
  return {
    event_id: MOOTQ_EVENT_ID,
    items: [{ ticket_type_id: MOOTQ_TICKET_TYPE_ID, quantity: MOOTQ_TICKET_QUANTITY }],
    buyer: {
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
      email: input.email,
    },
    answers: {
      per_order: {},
      per_user: buildMootqOrderPerUser(input),
      per_ticket: {},
    },
    external_order_ref: input.sourceRegistrationId,
  };
}
