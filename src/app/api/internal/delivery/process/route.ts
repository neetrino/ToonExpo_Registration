import { NextResponse } from 'next/server';
import { processDueDeliveryJobs } from '@/lib/delivery';
import { logger } from '@/lib/logger';
import { DELIVERY_CRON_ENABLED_ENV, isCronFlagEnabled } from '@/lib/ops/cron-flags';
import { createRequestId, getOrCreateRequestId, requestIdHeaders } from '@/lib/security';
import { secureSecretEqual } from '@/lib/security/secure-compare';

export const dynamic = 'force-dynamic';

/**
 * Internal delivery dispatcher for Vercel Cron / ops retries.
 * Requires Authorization: Bearer <CRON_SECRET>.
 * Vercel Cron invokes GET and injects Bearer from env `CRON_SECRET`.
 * Gated by `DELIVERY_CRON_ENABLED`: true|1 = ON; unset|false = OFF (no Neon).
 */
export async function GET(request: Request): Promise<NextResponse> {
  return processDelivery(request);
}

export async function POST(request: Request): Promise<NextResponse> {
  return processDelivery(request);
}

async function processDelivery(request: Request): Promise<NextResponse> {
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

  if (!isCronFlagEnabled(DELIVERY_CRON_ENABLED_ENV)) {
    return NextResponse.json(
      { ok: true, code: 'DISABLED', requestId, skipped: true },
      { status: 200, headers: requestIdHeaders(requestId) },
    );
  }

  try {
    const result = await processDueDeliveryJobs({ limit: 25 });
    return NextResponse.json(
      { ok: true, requestId, ...result },
      { status: 200, headers: requestIdHeaders(requestId) },
    );
  } catch {
    logger.error('Delivery cron processing failed', { requestId });
    return NextResponse.json(
      { ok: false, code: 'INTERNAL_ERROR', requestId },
      { status: 500, headers: requestIdHeaders(requestId) },
    );
  }
}
