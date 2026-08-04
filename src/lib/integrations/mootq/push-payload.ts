import { MOOTQ_PUSH_SOURCE_SYSTEM } from '@/lib/integrations/mootq/push-constants';

export type MootqPushPayload = {
  sourceRegistrationId: string;
  ticketCode: string;
  sourceSystem: typeof MOOTQ_PUSH_SOURCE_SYSTEM;
  createdAt: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

/**
 * Minimal Toon Expo → Mootq fast-push body (no PII beyond ticket identity).
 * For TOON_EXPO, sourceRegistrationId is the local Registration.id.
 * Optional UTM fields are omitted when absent (additive contract).
 */
export function buildMootqPushPayload(input: {
  registrationId: string;
  ticketCode: string;
  createdAt: Date;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}): MootqPushPayload {
  const payload: MootqPushPayload = {
    sourceRegistrationId: input.registrationId,
    ticketCode: input.ticketCode,
    sourceSystem: MOOTQ_PUSH_SOURCE_SYSTEM,
    createdAt: input.createdAt.toISOString(),
  };

  if (input.utmSource) {
    payload.utmSource = input.utmSource;
  }
  if (input.utmMedium) {
    payload.utmMedium = input.utmMedium;
  }
  if (input.utmCampaign) {
    payload.utmCampaign = input.utmCampaign;
  }

  return payload;
}
