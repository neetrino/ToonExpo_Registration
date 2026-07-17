import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { ADMIN_NO_STORE_HEADERS, buildRegistrationsCsv } from '@/lib/admin';
import { logger } from '@/lib/logger';
import { getOrCreateRequestId, requestIdHeaders } from '@/lib/security';

export const dynamic = 'force-dynamic';

/**
 * Authenticated CSV export of active-event registrations (formula-safe).
 */
export async function GET(request: Request): Promise<NextResponse> {
  const requestId = getOrCreateRequestId(request);
  const headers = {
    ...ADMIN_NO_STORE_HEADERS,
    ...requestIdHeaders(requestId),
  };

  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, code: 'UNAUTHORIZED', requestId },
      { status: 401, headers },
    );
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('q') ?? undefined;

  const result = await buildRegistrationsCsv(search);
  if (!result) {
    return NextResponse.json(
      { ok: false, code: 'NO_ACTIVE_EVENT', requestId },
      { status: 404, headers },
    );
  }

  logger.info('Admin CSV export generated', {
    requestId,
    eventSlug: result.filename.split('-registrations-')[0] ?? 'unknown',
  });

  return new NextResponse(result.csv, {
    status: 200,
    headers: {
      ...headers,
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${result.filename}"`,
    },
  });
}
