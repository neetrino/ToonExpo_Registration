import { logger } from '@/lib/logger';
import { MOOTQ_PUSH_TIMEOUT_MS } from '@/lib/integrations/mootq/push-constants';
import {
  parseRegistrationSchema,
  type MootqRegistrationSchema,
} from '@/lib/integrations/mootq/registration-schema';

const MOOTQ_SCHEMA_ACCEPT_LANGUAGE = 'hy';

export type MootqSchemaFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export type FetchMootqRegistrationSchemaResult =
  { ok: true; schema: MootqRegistrationSchema } | { ok: false };

export type FetchMootqRegistrationSchemaParams = {
  /** `MOOTQ_PUSH_URL`; the schema lives on the same Partner Registration API host. */
  pushUrl: string;
  key: string;
  eventKey: string;
  fetchImpl?: MootqSchemaFetch;
  timeoutMs?: number;
};

/** Current questionnaire for the mapped event (Bearer `mqi_` key). Never throws. */
export async function fetchMootqRegistrationSchema(
  params: FetchMootqRegistrationSchemaParams,
): Promise<FetchMootqRegistrationSchemaResult> {
  const fetchImpl = params.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), params.timeoutMs ?? MOOTQ_PUSH_TIMEOUT_MS);

  try {
    const response = await fetchImpl(mootqRegistrationSchemaUrl(params.pushUrl, params.eventKey), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${params.key}`,
        Accept: 'application/json',
        'Accept-Language': MOOTQ_SCHEMA_ACCEPT_LANGUAGE,
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      logger.warn('Mootq registration schema request failed', { status: response.status });
      return { ok: false };
    }
    const schema = parseRegistrationSchema(JSON.parse(await response.text()));
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

/** `{origin}/api/v1/integrations/events/{eventKey}/registration-schema`. */
export function mootqRegistrationSchemaUrl(pushUrl: string, eventKey: string): string {
  const path = `/api/v1/integrations/events/${encodeURIComponent(eventKey)}/registration-schema`;
  return new URL(path, pushUrl).toString();
}
