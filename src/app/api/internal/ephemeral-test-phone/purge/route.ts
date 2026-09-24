import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import {
  EPHEMERAL_TEST_PHONE_PURGE_ENABLED_ENV,
  isCronFlagEnabled,
} from '@/lib/ops/cron-flags';
import { purgeExpiredEphemeralTestRegistrations } from '@/lib/registrations/purge-ephemeral-test-phone';
import { createRequestId, getOrCreateRequestId, requestIdHeaders } from '@/lib/security';
import { secureSecretEqual } from '@/lib/security/secure-compare';

export const dynamic = 'force-dynamic';

/**
 * Deletes the live-test phone (+37495426165) from Neon and Google Sheets
 * 30 minutes after registration. Requires Authorization: Bearer <CRON_SECRET>.
 */
export async function GET(request: Request): Promise<NextResponse> {
  return purgeEphemeralTestPhone(request);
}

export async function POST(request: Request): Promise<NextResponse> {
  return purgeEphemeralTestPhone(request);
}

async function purgeEphemeralTestPhone(request: Request): Promise<NextResponse> {
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

  if (!isCronFlagEnabled(EPHEMERAL_TEST_PHONE_PURGE_ENABLED_ENV)) {
    return NextResponse.json(
      { ok: true, code: 'DISABLED', requestId, skipped: true },
      { status: 200, headers: requestIdHeaders(requestId) },
    );
  }

  try {
    const result = await purgeExpiredEphemeralTestRegistrations();
    return NextResponse.json(
      { ok: true, requestId, ...result },
      { status: 200, headers: requestIdHeaders(requestId) },
    );
  } catch {
    logger.error('Ephemeral test phone purge failed', { requestId });
    return NextResponse.json(
      { ok: false, code: 'INTERNAL_ERROR', requestId },
      { status: 500, headers: requestIdHeaders(requestId) },
    );
  }
}
