import { after, NextResponse } from 'next/server';
import { processDuePartnerPushes } from '@/lib/integrations/mootq/process-partner-pushes';
import { createRegistration } from '@/lib/registrations';
import { logger } from '@/lib/logger';
import {
  REGISTRATION_MAX_BODY_BYTES,
  createRequestId,
  getOrCreateRequestId,
  isAllowedOrigin,
  isHoneypotFilled,
  requestIdHeaders,
} from '@/lib/security';
import { registrationBodySchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
} as const;

const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

type ErrorBody = {
  ok: false;
  code: string;
  requestId: string;
  errors?: Record<string, string[]>;
};

type SuccessBody = {
  ok: true;
  requestId: string;
  registrationId: string;
  ticketCode: string;
  ticketViewToken: string;
};

/**
 * Public registration mutation. Resolves the active event server-side.
 * Assigns sourceSystem=TOON_EXPO and issues a ticket code.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const requestId = getOrCreateRequestId(request);

  if (!isAllowedOrigin(request)) {
    return jsonError(403, 'ORIGIN_REJECTED', requestId);
  }

  const contentLengthHeader = request.headers.get('content-length');
  if (contentLengthHeader !== null) {
    const contentLength = Number(contentLengthHeader);
    if (Number.isFinite(contentLength) && contentLength > REGISTRATION_MAX_BODY_BYTES) {
      return jsonError(400, 'VALIDATION_ERROR', requestId);
    }
  }

  const idempotencyKey = readIdempotencyKey(request);
  if (!idempotencyKey) {
    return jsonError(400, 'VALIDATION_ERROR', requestId);
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonError(400, 'VALIDATION_ERROR', requestId);
  }

  const parsed = registrationBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};

    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key !== 'string') {
        continue;
      }

      const bucket = errors[key] ?? [];
      bucket.push(issue.message);
      errors[key] = bucket;
    }

    logger.info('Registration validation failed', {
      requestId,
      fields: Object.keys(errors).join(','),
    });

    return NextResponse.json(
      { ok: false, code: 'VALIDATION_ERROR', requestId, errors } satisfies ErrorBody,
      { status: 400, headers: responseHeaders(requestId) },
    );
  }

  if (isHoneypotFilled(parsed.data.website)) {
    logger.info('Honeypot submission rejected', { requestId });
    return NextResponse.json(
      {
        ok: true,
        requestId,
        registrationId: createRequestId(),
        ticketCode: 'invalid',
        ticketViewToken: 'invalid',
      } satisfies SuccessBody,
      { status: 201, headers: responseHeaders(requestId) },
    );
  }

  const payload = {
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    emailNormalized: parsed.data.emailNormalized,
    phone: parsed.data.phone,
    phoneNormalized: parsed.data.phoneNormalized,
    locale: parsed.data.locale,
    privacyPolicyVersion: parsed.data.privacyPolicyVersion,
    formVersion: parsed.data.formVersion,
    answers: parsed.data.answers,
    utmSource: parsed.data.utmSource,
    utmMedium: parsed.data.utmMedium,
    utmCampaign: parsed.data.utmCampaign,
    idempotencyKey,
  };

  try {
    const result = await createRegistration(payload);
    if (!result.ok) {
      return jsonError(result.error.httpStatus, result.error.code, requestId);
    }

    const registrationId = result.registrationId;
    after(async () => {
      try {
        await processDuePartnerPushes({ registrationId, limit: 1 });
      } catch {
        logger.error('Mootq push after registration failed', { registrationId, requestId });
      }
    });

    return NextResponse.json(
      {
        ok: true,
        requestId,
        registrationId: result.registrationId,
        ticketCode: result.ticketCode,
        ticketViewToken: result.ticketViewToken,
      } satisfies SuccessBody,
      { status: 201, headers: responseHeaders(requestId) },
    );
  } catch {
    logger.error('Unhandled registration route error', { requestId });
    return jsonError(500, 'INTERNAL_ERROR', requestId);
  }
}

function readIdempotencyKey(request: Request): string | null {
  const header = request.headers.get('idempotency-key')?.trim();
  if (!header || !IDEMPOTENCY_KEY_PATTERN.test(header)) {
    return null;
  }
  return header;
}

function responseHeaders(requestId: string): Record<string, string> {
  return {
    ...NO_STORE_HEADERS,
    ...requestIdHeaders(requestId),
  };
}

function jsonError(
  status: number,
  code: string,
  requestId: string,
  extraHeaders?: Record<string, string>,
): NextResponse<ErrorBody> {
  return NextResponse.json({ ok: false, code, requestId } satisfies ErrorBody, {
    status,
    headers: {
      ...responseHeaders(requestId),
      ...extraHeaders,
    },
  });
}
