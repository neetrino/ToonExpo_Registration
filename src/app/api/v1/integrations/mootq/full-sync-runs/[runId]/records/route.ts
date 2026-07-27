import { NextResponse } from 'next/server';
import { authenticateMootqRequest } from '@/lib/integrations/mootq/auth';
import { getFullExportPage } from '@/lib/integrations/mootq/full-export';
import { logger } from '@/lib/logger';
import { createRequestId, getOrCreateRequestId, requestIdHeaders } from '@/lib/security';

export const dynamic = 'force-dynamic';

const NO_STORE = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
} as const;

type RouteProps = {
  params: Promise<{ runId: string }>;
};

/**
 * Page records for a Mootq full-export run.
 */
export async function GET(request: Request, { params }: RouteProps): Promise<NextResponse> {
  const requestId = getOrCreateRequestId(request) || createRequestId();
  const auth = authenticateMootqRequest(request, 'read');
  if (!auth.ok) {
    return jsonError(auth.status, auth.code, requestId);
  }

  const { runId } = await params;
  if (!runId || runId.length > 64) {
    return jsonError(400, 'VALIDATION_ERROR', requestId);
  }

  const url = new URL(request.url);

  try {
    const result = await getFullExportPage({
      runId,
      after: url.searchParams.get('after'),
      limit: url.searchParams.get('limit'),
    });

    if (!result.ok) {
      return jsonError(result.status, result.code, requestId);
    }

    return NextResponse.json(
      {
        items: result.items,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
      },
      {
        status: 200,
        headers: { ...NO_STORE, ...requestIdHeaders(requestId) },
      },
    );
  } catch {
    logger.error('Unhandled full-export page error', { requestId, runId });
    return jsonError(500, 'INTERNAL_ERROR', requestId);
  }
}

function jsonError(status: number, code: string, requestId: string): NextResponse {
  return NextResponse.json(
    { ok: false, code, requestId },
    { status, headers: { ...NO_STORE, ...requestIdHeaders(requestId) } },
  );
}
