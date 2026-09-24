import { getSheetsWebhookConfig } from '@/lib/integrations/sheets/config';
import { SHEETS_PUSH_TIMEOUT_MS } from '@/lib/integrations/sheets/constants';
import type { SheetsChannel, SheetsRow } from '@/lib/integrations/sheets/map-row';
import { logger } from '@/lib/logger';

export type AppendSheetRowResult = { ok: true } | { ok: false; reason: string; retryable: boolean };

/** Apps Script often returns HTTP 200; success is `{ ok: true }` in the body. */
export function assertSheetsWebhookOk(body: unknown, status: number): void {
  if (status < 200 || status >= 300) {
    logger.warn('sheets.webhook_http_failed', { status });
    throw new Error(`SHEETS_WEBHOOK_${status}`);
  }

  if (body && typeof body === 'object' && 'ok' in body && body.ok === true) {
    return;
  }

  const rawCode =
    body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
      ? body.error
      : 'invalid_response';
  const code = /^[A-Za-z0-9_]{1,32}$/.test(rawCode) ? rawCode : 'invalid_response';
  logger.warn('sheets.webhook_body_failed', { status, code });
  throw new Error(`SHEETS_WEBHOOK_${code}`);
}

export function sheetsSyncErrorCode(error: unknown): string {
  if (error instanceof Error && /^SHEETS_[A-Za-z0-9_]{1,64}$/.test(error.message)) {
    return error.message;
  }
  return 'SHEETS_UNKNOWN';
}

function classifySheetsWebhookFailure(error: unknown): AppendSheetRowResult {
  const reason = sheetsSyncErrorCode(error);
  const retryable =
    reason === 'SHEETS_UNKNOWN' ||
    reason === 'SHEETS_WEBHOOK_INVALID_JSON' ||
    /^SHEETS_WEBHOOK_(429|5\d\d)$/.test(reason) ||
    reason === 'SHEETS_WEBHOOK_failed';
  return { ok: false, reason, retryable };
}

/**
 * POST one registration row to the Apps Script webhook.
 * Secret is sent in the JSON body (Apps Script often drops custom headers).
 */
export async function appendSheetRow(
  row: SheetsRow,
  timeoutMs = SHEETS_PUSH_TIMEOUT_MS,
): Promise<AppendSheetRowResult> {
  const config = getSheetsWebhookConfig();
  if (!config.ok) {
    return {
      ok: false,
      reason: config.reason === 'URL_INVALID' ? 'SHEETS_WEBHOOK_URL_INVALID' : 'NOT_CONFIGURED',
      retryable: config.reason === 'NOT_CONFIGURED',
    };
  }

  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: config.secret,
        channel: row.channel,
        tab: row.tab,
        headers: row.headers,
        values: row.values,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      logger.warn('sheets.webhook_invalid_json', { status: response.status });
      return { ok: false, reason: 'SHEETS_WEBHOOK_INVALID_JSON', retryable: true };
    }

    assertSheetsWebhookOk(body, response.status);
    return { ok: true };
  } catch (error: unknown) {
    return classifySheetsWebhookFailure(error);
  }
}

export type DeleteSheetRegistrationRowInput = {
  channel: SheetsChannel;
  tab: string;
  registrationId: string;
};

/**
 * Ask Apps Script to remove one registration row from a single tab.
 * Append behavior is unchanged; this is a separate webhook action.
 */
export async function deleteSheetRegistrationRow(
  input: DeleteSheetRegistrationRowInput,
  timeoutMs = SHEETS_PUSH_TIMEOUT_MS,
): Promise<AppendSheetRowResult> {
  const config = getSheetsWebhookConfig();
  if (!config.ok) {
    return {
      ok: false,
      reason: config.reason === 'URL_INVALID' ? 'SHEETS_WEBHOOK_URL_INVALID' : 'NOT_CONFIGURED',
      retryable: config.reason === 'NOT_CONFIGURED',
    };
  }

  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: config.secret,
        channel: input.channel,
        tab: input.tab,
        action: 'deleteByRegistrationId',
        registrationId: input.registrationId,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      logger.warn('sheets.webhook_invalid_json', { status: response.status });
      return { ok: false, reason: 'SHEETS_WEBHOOK_INVALID_JSON', retryable: true };
    }

    assertSheetsWebhookOk(body, response.status);
    return { ok: true };
  } catch (error: unknown) {
    return classifySheetsWebhookFailure(error);
  }
}
