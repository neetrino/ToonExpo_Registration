import { NextResponse } from 'next/server';
import type { ZodIssue } from 'zod';
import { authenticateMootqRequest } from '@/lib/integrations/mootq/auth';
import { MOOTQ_MAX_BODY_BYTES } from '@/lib/integrations/mootq/constants';
import { getMootqToonExpoFeed } from '@/lib/integrations/mootq/feed';
import { importMootqRegistration } from '@/lib/integrations/mootq/import-registration';
import { mootqInboundBodySchema } from '@/lib/integrations/mootq/inbound-schema';
import { logger } from '@/lib/logger';
import { createRequestId, getOrCreateRequestId, requestIdHeaders } from '@/lib/security';

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
    const fields = inboundValidationFields(parsed.error.issues);
    logger.info('Mootq inbound validation failed', {
      requestId,
      fields: fields.join(','),
    });
    return jsonError(400, 'VALIDATION_ERROR', requestId, fields);
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

function inboundValidationFields(issues: ZodIssue[]): string[] {
  const names = new Set<string>();
  for (const issue of issues) {
    const path = issue.path.map(String).join('.');
    if (path) {
      names.add(path);
    }
  }
  return [...names].slice(0, 12);
}

function jsonError(
  status: number,
  code: string,
  requestId: string,
  fields?: string[],
): NextResponse {
  const body: { ok: false; code: string; requestId: string; fields?: string[] } = {
    ok: false,
    code,
    requestId,
  };
  if (fields && fields.length > 0) {
    body.fields = fields;
  }

  return NextResponse.json(body, {
    status,
    headers: {
      ...NO_STORE,
      ...requestIdHeaders(requestId),
    },
  });
}
