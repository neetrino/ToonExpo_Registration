import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { ADMIN_NO_STORE_HEADERS, buildRegistrationsCsv } from '@/lib/admin';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * Authenticated CSV export of active-event registrations (formula-safe).
 */
export async function GET(request: Request): Promise<NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, code: 'UNAUTHORIZED' },
      { status: 401, headers: ADMIN_NO_STORE_HEADERS },
    );
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('q') ?? undefined;

  const result = await buildRegistrationsCsv(search);
  if (!result) {
    return NextResponse.json(
      { ok: false, code: 'NO_ACTIVE_EVENT' },
      { status: 404, headers: ADMIN_NO_STORE_HEADERS },
    );
  }

  logger.info('Admin CSV export generated', {
    eventSlug: result.filename.split('-registrations-')[0] ?? 'unknown',
  });

  return new NextResponse(result.csv, {
    status: 200,
    headers: {
      ...ADMIN_NO_STORE_HEADERS,
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${result.filename}"`,
    },
  });
}
