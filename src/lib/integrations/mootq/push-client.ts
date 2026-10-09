import { fetchMootqRegistrationSchema } from '@/lib/integrations/mootq/fetch-registration-schema';
import {
  buildMootqPushPayload,
  type BuildMootqPushPayloadInput,
  type MootqPushPayload,
} from '@/lib/integrations/mootq/push-payload';
import {
  classifyMootqPushHttpStatus,
  parseRetryAfterSeconds,
  partnerPushErrorCodeForHttpStatus,
  summarizeMootqRejection,
} from '@/lib/integrations/mootq/push-outcome';
import { getMootqPushConfig } from '@/lib/integrations/mootq/push-config';
import { MOOTQ_PUSH_TIMEOUT_MS } from '@/lib/integrations/mootq/push-constants';
import { logger } from '@/lib/logger';

export type MootqPushClientResult =
  | { ok: true }
  | { ok: false; reason: string; retryable: boolean; retryAfterSeconds?: number };

export type MootqPushClientInput = Omit<BuildMootqPushPayloadInput, 'sourceRegistrationId'> & {
  registrationId: string;
};

export type MootqPushFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

const MOOTQ_PUSH_ACCEPT_LANGUAGE = 'en';

/**
 * Send one registration to Mootq Partner Registration. Never throws; maps transport/HTTP
 * to retry policy. The schema is refetched for every send.
 */
export async function pushRegistrationToMootq(
  input: MootqPushClientInput,
  options?: { fetchImpl?: MootqPushFetch },
): Promise<MootqPushClientResult> {
  const config = getMootqPushConfig();
  if (!config.ok) {
    logger.info('Mootq push skipped (NOT_CONFIGURED)', { registrationId: input.registrationId });
    return { ok: false, reason: 'NOT_CONFIGURED', retryable: true };
  }

  const schemaResult = await fetchMootqRegistrationSchema({
    pushUrl: config.url,
    key: config.key,
    eventKey: config.eventKey,
    fetchImpl: options?.fetchImpl,
  });
  if (!schemaResult.ok) {
    logger.warn('Mootq push skipped (schema unavailable)', { registrationId: input.registrationId });
    return { ok: false, reason: 'schema_unavailable', retryable: true };
  }

  const { registrationId, ...registration } = input;
  const { payload, missingRequired } = buildMootqPushPayload(
    { ...registration, sourceRegistrationId: registrationId },
    schemaResult.schema,
  );
  if (missingRequired.length > 0) {
    logger.warn('Mootq push has unanswered required questions', {
      registrationId,
      missingRequired: missingRequired.join(','),
    });
  }

  return executeMootqPushRequest({
    url: config.url,
    key: config.key,
    registrationId,
    payload,
    fetchImpl: options?.fetchImpl,
  });
}

export async function executeMootqPushRequest(params: {
  url: string;
  key: string;
  registrationId: string;
  payload: MootqPushPayload;
  fetchImpl?: MootqPushFetch;
  timeoutMs?: number;
}): Promise<MootqPushClientResult> {
  const fetchImpl = params.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), params.timeoutMs ?? MOOTQ_PUSH_TIMEOUT_MS);

  try {
    const response = await fetchImpl(params.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.key}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Language': MOOTQ_PUSH_ACCEPT_LANGUAGE,
        'Idempotency-Key': params.registrationId,
      },
      signal: controller.signal,
      body: JSON.stringify(params.payload),
    });
    return await toPushResult(response, params.registrationId);
  } catch (error: unknown) {
    if (isAbortError(error)) {
      logger.warn('Mootq push timed out', { registrationId: params.registrationId });
      return { ok: false, reason: 'timeout', retryable: true };
    }
    logger.warn('Mootq push network failure', { registrationId: params.registrationId });
    return { ok: false, reason: 'network_error', retryable: true };
  } finally {
    clearTimeout(timer);
  }
}

async function toPushResult(
  response: Response,
  registrationId: string,
): Promise<MootqPushClientResult> {
  const outcome = classifyMootqPushHttpStatus(response.status);
  if (outcome === 'success') {
    return { ok: true };
  }

  const reason = partnerPushErrorCodeForHttpStatus(response.status);
  const rejection = summarizeMootqRejection(await readBodySafely(response));
  if (outcome === 'retryable') {
    const retryAfterSeconds = parseRetryAfterSeconds(response.headers.get('Retry-After'));
    logger.warn('Mootq push retryable HTTP failure', {
      registrationId,
      status: response.status,
      retryAfterSeconds,
      ...rejection,
    });
    return { ok: false, reason, retryable: true, retryAfterSeconds };
  }

  logger.warn('Mootq push permanent HTTP failure', {
    registrationId,
    status: response.status,
    ...rejection,
  });
  return { ok: false, reason, retryable: false };
}

async function readBodySafely(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}
