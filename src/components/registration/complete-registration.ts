import { tagClarityRegistration } from '@/lib/analytics/clarity';
import {
  rememberAnalyticsFormChannel,
  type AnalyticsFormChannel,
} from '@/lib/analytics/form-channel-event';
import { clearRegistrationIdempotencyKey } from './idempotency';
import { storeTicketHandoff } from './ticket-handoff';
import type { SubmitRegistrationResult } from './types';

type SuccessfulRegistration = Extract<SubmitRegistrationResult, { ok: true }>;

/**
 * Shared post-success steps for every registration wizard (before navigating to /success).
 * Resets the per-registration idempotency key but keeps visit UTM attribution,
 * so later registrations from the same visit stay attributed.
 */
export function completeRegistration(
  result: SuccessfulRegistration,
  channel: AnalyticsFormChannel,
): void {
  clearRegistrationIdempotencyKey();
  tagClarityRegistration(result.registrationId);
  rememberAnalyticsFormChannel(channel);
  storeTicketHandoff({
    ticketCode: result.ticketCode,
    ticketViewToken: result.ticketViewToken,
  });
}
