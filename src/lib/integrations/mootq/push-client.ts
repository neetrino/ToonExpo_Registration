import {
  buildMootqPushPayload,
  type MootqPushPayload,
} from '@/lib/integrations/mootq/push-payload';
import {
  classifyMootqPushHttpStatus,
  partnerPushErrorCodeForHttpStatus,
} from '@/lib/integrations/mootq/push-outcome';
import { getMootqPushConfig } from '@/lib/integrations/mootq/push-config';
import { MOOTQ_PUSH_TIMEOUT_MS } from '@/lib/integrations/mootq/push-constants';
import { logger } from '@/lib/logger';

export type MootqPushClientResult =
  { ok: true } | { ok: false; reason: string; retryable: boolean };

export type MootqPushClientInput = {
  registrationId: string;
  ticketCode: string;
  createdAt: Date;
};

export type MootqPushFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

/**
 * POST one registration to Mootq. Never throws; maps transport/HTTP to retry policy.
 */
export async function pushRegistrationToMootq(
  input: MootqPushClientInput,
  options?: { fetchImpl?: MootqPushFetch },
): Promise<MootqPushClientResult> {
  const config = getMootqPushConfig();
  if (!config.ok) {
    logger.info('Mootq push skipped (NOT_CONFIGURED)', {
      registrationId: input.registrationId,
    });
    return { ok: false, reason: 'NOT_CONFIGURED', retryable: true };
  }

  const payload = buildMootqPushPayload(input);
  return executeMootqPushRequest({
    url: config.url,
    key: config.key,
    registrationId: input.registrationId,
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
  const timeoutMs = params.timeoutMs ?? MOOTQ_PUSH_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(params.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.key}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': params.registrationId,
      },
      signal: controller.signal,
      body: JSON.stringify(params.payload),
    });

    const outcome = classifyMootqPushHttpStatus(response.status);
    if (outcome === 'success') {
      return { ok: true };
    }

    const reason = partnerPushErrorCodeForHttpStatus(response.status);
    if (outcome === 'retryable') {
      logger.warn('Mootq push retryable HTTP failure', {
        registrationId: params.registrationId,
        status: response.status,
      });
      return { ok: false, reason, retryable: true };
    }

    logger.warn('Mootq push permanent HTTP failure', {
      registrationId: params.registrationId,
      status: response.status,
    });
    return { ok: false, reason, retryable: false };
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

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}
