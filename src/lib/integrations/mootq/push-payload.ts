import { MOOTQ_PUSH_SOURCE_SYSTEM } from '@/lib/integrations/mootq/push-constants';

export type MootqPushPayload = {
  sourceRegistrationId: string;
  ticketCode: string;
  sourceSystem: typeof MOOTQ_PUSH_SOURCE_SYSTEM;
  createdAt: string;
};

/**
 * Minimal Toon Expo → Mootq fast-push body (no PII beyond ticket identity).
 * For TOON_EXPO, sourceRegistrationId is the local Registration.id.
 */
export function buildMootqPushPayload(input: {
  registrationId: string;
  ticketCode: string;
  createdAt: Date;
}): MootqPushPayload {
  return {
    sourceRegistrationId: input.registrationId,
    ticketCode: input.ticketCode,
    sourceSystem: MOOTQ_PUSH_SOURCE_SYSTEM,
    createdAt: input.createdAt.toISOString(),
  };
}
