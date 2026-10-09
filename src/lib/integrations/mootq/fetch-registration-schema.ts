import { logger } from '@/lib/logger';
import {
  MOOTQ_TICKET_QUANTITY,
  MOOTQ_TICKET_TYPE_ID,
} from '@/lib/integrations/mootq/mootq-order-ids';
import { MOOTQ_PUSH_TIMEOUT_MS } from '@/lib/integrations/mootq/push-constants';
import {
  parseRegistrationSchema,
  type MootqRegistrationSchema,
} from '@/lib/integrations/mootq/registration-schema';

/** Partner catalog confirmed 2026-10-09. No auth header. */
const MOOTQ_SCHEMA_ORIGIN = 'https://api.v3.mootq.com';
const MOOTQ_SCHEMA_EVENT_SLUG = 'toon-expo-2026';
const MOOTQ_SCHEMA_ACCEPT_LANGUAGE = 'hy';

export type MootqSchemaFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export type FetchMootqRegistrationSchemaResult =
  { ok: true; schema: MootqRegistrationSchema } | { ok: false };

/** Current question ids for event 21 / ticket 56. Never throws. */
export async function fetchMootqRegistrationSchema(options?: {
  fetchImpl?: MootqSchemaFetch;
  timeoutMs?: number;
}): Promise<FetchMootqRegistrationSchemaResult> {
  const fetchImpl = options?.fetchImpl ?? fetch;
  const timeoutMs = options?.timeoutMs ?? MOOTQ_PUSH_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(mootqRegistrationSchemaUrl(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Accept-Language': MOOTQ_SCHEMA_ACCEPT_LANGUAGE,
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      logger.warn('Mootq registration schema request failed', { status: response.status });
      return { ok: false };
    }
    const body: unknown = JSON.parse(await response.text());
    const schema = parseRegistrationSchema(body);
    if (!schema) {
      logger.warn('Mootq registration schema response was not usable');
      return { ok: false };
    }
    return { ok: true, schema };
  } catch (error: unknown) {
    logger.warn('Mootq registration schema unavailable', {
      timedOut: error instanceof Error && error.name === 'AbortError',
    });
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}

export function mootqRegistrationSchemaUrl(): string {
  const items = `${MOOTQ_TICKET_TYPE_ID}:${MOOTQ_TICKET_QUANTITY}`;
  return `${MOOTQ_SCHEMA_ORIGIN}/api/events/${MOOTQ_SCHEMA_EVENT_SLUG}/registration-schema?items[]=${items}`;
}
