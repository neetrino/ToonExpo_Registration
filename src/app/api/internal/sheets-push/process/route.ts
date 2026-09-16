import { NextResponse } from 'next/server';
import { processDueSheetsPushes } from '@/lib/integrations/sheets/process-sheets-pushes';
import { SHEETS_PUSH_CRON_ENABLED_ENV } from '@/lib/integrations/sheets/constants';
import { logger } from '@/lib/logger';
import { isCronFlagEnabled } from '@/lib/ops/cron-flags';
import { createRequestId, getOrCreateRequestId, requestIdHeaders } from '@/lib/security';
import { secureSecretEqual } from '@/lib/security/secure-compare';

export const dynamic = 'force-dynamic';

/**
 * Internal Sheets append dispatcher for Vercel Cron / ops retries.
 * Requires Authorization: Bearer <CRON_SECRET>.
 * Gated by `SHEETS_PUSH_CRON_ENABLED`: true|1 = ON; unset|false = OFF (no Neon).
 */
export async function GET(request: Request): Promise<NextResponse> {
  return processSheetsPush(request);
}

export async function POST(request: Request): Promise<NextResponse> {
  return processSheetsPush(request);
}

async function processSheetsPush(request: Request): Promise<NextResponse> {
  const requestId = getOrCreateRequestId(request) || createRequestId();
  const configuredSecret = process.env.CRON_SECRET?.trim();

  if (!configuredSecret || configuredSecret.length < 32) {
    return NextResponse.json(
      { ok: false, code: 'NOT_CONFIGURED', requestId },
      { status: 503, headers: requestIdHeaders(requestId) },
    );
  }

  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    return NextResponse.json(
      { ok: false, code: 'UNAUTHORIZED', requestId },
      { status: 401, headers: requestIdHeaders(requestId) },
    );
  }

  const presented = header.slice('Bearer '.length).trim();
  if (!presented || !secureSecretEqual(presented, configuredSecret)) {
    return NextResponse.json(
      { ok: false, code: 'UNAUTHORIZED', requestId },
      { status: 401, headers: requestIdHeaders(requestId) },
    );
  }

  if (!isCronFlagEnabled(SHEETS_PUSH_CRON_ENABLED_ENV)) {
    return NextResponse.json(
      { ok: true, code: 'DISABLED', requestId, skipped: true },
      { status: 200, headers: requestIdHeaders(requestId) },
    );
  }

  try {
    const result = await processDueSheetsPushes({ limit: 25 });
    return NextResponse.json(
      { ok: true, requestId, ...result },
      { status: 200, headers: requestIdHeaders(requestId) },
    );
  } catch {
    logger.error('Sheets push cron processing failed', { requestId });
    return NextResponse.json(
      { ok: false, code: 'INTERNAL_ERROR', requestId },
      { status: 500, headers: requestIdHeaders(requestId) },
    );
  }
}
