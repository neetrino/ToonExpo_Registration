import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createRegistration } from '@/lib/registrations';
import { logger } from '@/lib/logger';
import { isAllowedOrigin, isHoneypotFilled } from '@/lib/security';
import { registrationBodySchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
} as const;

type ErrorBody = {
  ok: false;
  code: string;
  requestId: string;
};

type SuccessBody = {
  ok: true;
  requestId: string;
  registrationId: string;
};

/**
 * Public registration mutation. Resolves the active event server-side.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const requestId = randomUUID();

  if (!isAllowedOrigin(request)) {
    return jsonError(403, 'ORIGIN_REJECTED', requestId);
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonError(400, 'VALIDATION_ERROR', requestId);
  }

  const parsed = registrationBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return jsonError(400, 'VALIDATION_ERROR', requestId);
  }

  if (isHoneypotFilled(parsed.data.website)) {
    // Reject bots without revealing the honeypot rule.
    logger.info('Honeypot submission rejected', { requestId });
    return NextResponse.json(
      { ok: true, requestId, registrationId: randomUUID() } satisfies SuccessBody,
      { status: 201, headers: NO_STORE_HEADERS },
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
  };

  try {
    const result = await createRegistration(payload);
    if (!result.ok) {
      return jsonError(result.error.httpStatus, result.error.code, requestId);
    }

    return NextResponse.json(
      {
        ok: true,
        requestId,
        registrationId: result.registrationId,
      } satisfies SuccessBody,
      { status: 201, headers: NO_STORE_HEADERS },
    );
  } catch {
    logger.error('Unhandled registration route error', { requestId });
    return jsonError(500, 'INTERNAL_ERROR', requestId);
  }
}

function jsonError(
  status: number,
  code: string,
  requestId: string,
): NextResponse<ErrorBody> {
  return NextResponse.json(
    { ok: false, code, requestId } satisfies ErrorBody,
    { status, headers: NO_STORE_HEADERS },
  );
}
