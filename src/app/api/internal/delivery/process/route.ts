import { NextResponse } from 'next/server';
import { processDueDeliveryJobs } from '@/lib/delivery';
import { logger } from '@/lib/logger';
import { createRequestId, getOrCreateRequestId, requestIdHeaders } from '@/lib/security';

export const dynamic = 'force-dynamic';

/**
 * Internal delivery dispatcher endpoint for cron / ops retries.
 * Requires Authorization: Bearer <DELIVERY_CRON_SECRET> when configured.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const requestId = getOrCreateRequestId(request) || createRequestId();
  const configuredSecret = process.env.DELIVERY_CRON_SECRET?.trim();

  if (!configuredSecret) {
    return NextResponse.json(
      { ok: false, code: 'NOT_CONFIGURED', requestId },
      { status: 503, headers: requestIdHeaders(requestId) },
    );
  }

  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${configuredSecret}`) {
    return NextResponse.json(
      { ok: false, code: 'UNAUTHORIZED', requestId },
      { status: 401, headers: requestIdHeaders(requestId) },
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
