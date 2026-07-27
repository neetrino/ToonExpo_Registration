import { NextResponse } from 'next/server';
import { authenticateMootqRequest } from '@/lib/integrations/mootq/auth';
import { MOOTQ_MAX_BODY_BYTES } from '@/lib/integrations/mootq/constants';
import { getMootqToonExpoFeed } from '@/lib/integrations/mootq/feed';
import { importMootqRegistration } from '@/lib/integrations/mootq/import-registration';
import { mootqInboundBodySchema } from '@/lib/integrations/mootq/inbound-schema';
import { logger } from '@/lib/logger';
import {
  createRequestId,
  getOrCreateRequestId,
  requestIdHeaders,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

const NO_STORE = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
} as const;

/**
 * Mootq inbound registration (write scope).
 */
export async function POST(request: Request): Promise<NextResponse> {
  const requestId = getOrCreateRequestId(request) || createRequestId();
  const auth = authenticateMootqRequest(request, 'write');
  if (!auth.ok) {
    return jsonError(auth.status, auth.code, requestId);
  }

  const contentLengthHeader = request.headers.get('content-length');
  if (contentLengthHeader !== null) {
    const contentLength = Number(contentLengthHeader);
    if (Number.isFinite(contentLength) && contentLength > MOOTQ_MAX_BODY_BYTES) {
      return jsonError(400, 'VALIDATION_ERROR', requestId);
    }
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonError(400, 'VALIDATION_ERROR', requestId);
  }

  const parsed = mootqInboundBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    logger.info('Mootq inbound validation failed', {
      requestId,
      fields: parsed.error.issues.map((issue) => issue.path.join('.')).join(','),
    });
    return jsonError(400, 'VALIDATION_ERROR', requestId);
  }

  try {
    const result = await importMootqRegistration(parsed.data);
    if (!result.ok) {
      return jsonError(result.status, result.code, requestId);
    }

    return new NextResponse(null, {
      status: 204,
      headers: {
        ...NO_STORE,
        ...requestIdHeaders(requestId),
      },
    });
  } catch {
    logger.error('Unhandled Mootq inbound error', { requestId });
    return jsonError(500, 'INTERNAL_ERROR', requestId);
  }
}

/**
 * Mootq Toon Expo-origin fast feed (read scope).
 */
export async function GET(request: Request): Promise<NextResponse> {
  const requestId = getOrCreateRequestId(request) || createRequestId();
  const auth = authenticateMootqRequest(request, 'read');
  if (!auth.ok) {
    return jsonError(auth.status, auth.code, requestId);
  }

  const url = new URL(request.url);
  const result = await getMootqToonExpoFeed({
    after: url.searchParams.get('after'),
    limit: url.searchParams.get('limit'),
  });

  if (!result.ok) {
    return jsonError(result.status, result.code, requestId);
  }

  return NextResponse.json(result.page, {
    status: 200,
    headers: {
      ...NO_STORE,
      ...requestIdHeaders(requestId),
    },
  });
}

function jsonError(status: number, code: string, requestId: string): NextResponse {
  return NextResponse.json(
    { ok: false, code, requestId },
    {
      status,
      headers: {
        ...NO_STORE,
        ...requestIdHeaders(requestId),
      },
    },
  );
}
