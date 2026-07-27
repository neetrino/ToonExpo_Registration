import { NextResponse } from 'next/server';
import { authenticateMootqRequest } from '@/lib/integrations/mootq/auth';
import { createFullExportRun } from '@/lib/integrations/mootq/full-export';
import { logger } from '@/lib/logger';
import { createRequestId, getOrCreateRequestId, requestIdHeaders } from '@/lib/security';

export const dynamic = 'force-dynamic';

const NO_STORE = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
} as const;

/**
 * Create a Mootq full-export run.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const requestId = getOrCreateRequestId(request) || createRequestId();
  const auth = authenticateMootqRequest(request, 'read');
  if (!auth.ok) {
    return jsonError(auth.status, auth.code, requestId);
  }

  try {
    const result = await createFullExportRun('mootq-read');
    if (!result.ok) {
      return jsonError(result.status, result.code, requestId);
    }

    return NextResponse.json(
      {
        runId: result.runId,
        estimatedRecords: result.estimatedRecords,
      },
      {
        status: 201,
        headers: { ...NO_STORE, ...requestIdHeaders(requestId) },
      },
    );
  } catch {
    logger.error('Unhandled full-export create error', { requestId });
    return jsonError(500, 'INTERNAL_ERROR', requestId);
  }
}

function jsonError(status: number, code: string, requestId: string): NextResponse {
  return NextResponse.json(
    { ok: false, code, requestId },
    { status, headers: { ...NO_STORE, ...requestIdHeaders(requestId) } },
  );
}
