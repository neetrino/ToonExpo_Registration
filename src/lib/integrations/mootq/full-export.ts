import { getPrisma } from '@/lib/db/prisma';
import { MOOTQ_FEED_DEFAULT_LIMIT, MOOTQ_FEED_MAX_LIMIT } from '@/lib/integrations/mootq/constants';
import { logger } from '@/lib/logger';
import { mapRegistrationError } from '@/lib/registrations/errors';

export type FullExportRecord = {
  ticketCode: string;
  sourceSystem: 'TOON_EXPO' | 'MOOTQ';
  sourceRegistrationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  locale: string;
  attendanceStatus: 'NOT_VISITED' | 'VISITED' | null;
  formVersion: string | null;
  answers: unknown;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateFullExportRunResult =
  | { ok: true; runId: string; estimatedRecords: number }
  | { ok: false; code: 'INTERNAL_ERROR' | 'SERVICE_UNAVAILABLE'; status: 500 | 503 };

export type FullExportPageResult =
  | {
      ok: true;
      items: FullExportRecord[];
      nextCursor: string | null;
      hasMore: boolean;
    }
  | {
      ok: false;
      code: 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR' | 'SERVICE_UNAVAILABLE';
      status: 400 | 404 | 500 | 503;
    };

/**
 * Start an EXPORT_TO_MQ run for Mootq full reconciliation.
 */
export async function createFullExportRun(initiatedBy: string): Promise<CreateFullExportRunResult> {
  const prisma = getPrisma();

  try {
    const estimatedRecords = await prisma.registration.count({
      where: { ticketCode: { not: null }, sourceSystem: { not: null } },
    });

    const run = await prisma.integrationSyncRun.create({
      data: {
        direction: 'EXPORT_TO_MQ',
        status: 'RUNNING',
        initiatedBy,
        readCount: 0,
      },
      select: { id: true },
    });

    return { ok: true, runId: run.id, estimatedRecords };
  } catch (error: unknown) {
    const mapped = mapRegistrationError(error);
    logger.error('Failed to create full export run', { code: mapped.code });
    if (mapped.code === 'SERVICE_UNAVAILABLE') {
      return { ok: false, code: 'SERVICE_UNAVAILABLE', status: 503 };
    }
    return { ok: false, code: 'INTERNAL_ERROR', status: 500 };
  }
}

/**
 * Page ticketed registrations for an export run. Cursor format: `${createdAtISO}|${id}`.
 */
export async function getFullExportPage(params: {
  runId: string;
  after?: string | null;
  limit?: string | null;
}): Promise<FullExportPageResult> {
  const limit = parseLimit(params.limit);
  if (limit === null) {
    return { ok: false, code: 'VALIDATION_ERROR', status: 400 };
  }

  const cursor = parseExportCursor(params.after);
  if (cursor === null && params.after != null && params.after !== '') {
    return { ok: false, code: 'VALIDATION_ERROR', status: 400 };
  }

  const prisma = getPrisma();

  try {
    const run = await prisma.integrationSyncRun.findFirst({
      where: { id: params.runId, direction: 'EXPORT_TO_MQ' },
      select: { id: true, status: true },
    });

    if (!run) {
      return { ok: false, code: 'NOT_FOUND', status: 404 };
    }

    const rows = await prisma.registration.findMany({
      where: {
        ticketCode: { not: null },
        sourceSystem: { not: null },
        ...(cursor
          ? {
              OR: [
                { createdAt: { gt: cursor.createdAt } },
                { createdAt: cursor.createdAt, id: { gt: cursor.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: limit + 1,
      select: {
        id: true,
        ticketCode: true,
        sourceSystem: true,
        sourceRegistrationId: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNormalized: true,
        locale: true,
        attendanceStatus: true,
        formVersion: true,
        answers: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    const items: FullExportRecord[] = [];
    for (const row of pageRows) {
      if (!row.ticketCode || !row.sourceSystem) {
        continue;
      }
      items.push({
        ticketCode: row.ticketCode,
        sourceSystem: row.sourceSystem,
        sourceRegistrationId:
          row.sourceRegistrationId ?? (row.sourceSystem === 'TOON_EXPO' ? row.id : row.id),
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        phone: row.phoneNormalized,
        locale: row.locale,
        attendanceStatus: row.attendanceStatus,
        formVersion: row.formVersion,
        answers: row.answers,
        utmSource: row.utmSource,
        utmMedium: row.utmMedium,
        utmCampaign: row.utmCampaign,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      });
    }

    const last = pageRows[pageRows.length - 1];
    const nextCursor = last
      ? encodeExportCursor(last.createdAt, last.id)
      : params.after && params.after !== ''
        ? params.after
        : null;

    await prisma.integrationSyncRun.update({
      where: { id: run.id },
      data: {
        readCount: { increment: items.length },
        lastCursor: nextCursor,
        status: hasMore ? 'RUNNING' : 'SUCCEEDED',
        finishedAt: hasMore ? null : new Date(),
      },
    });

    return { ok: true, items, nextCursor, hasMore };
  } catch (error: unknown) {
    const mapped = mapRegistrationError(error);
    logger.error('Full export page failed', { code: mapped.code, runId: params.runId });
    if (mapped.code === 'SERVICE_UNAVAILABLE') {
      return { ok: false, code: 'SERVICE_UNAVAILABLE', status: 503 };
    }
    return { ok: false, code: 'INTERNAL_ERROR', status: 500 };
  }
}

function parseLimit(value: string | null | undefined): number | null {
  if (value == null || value === '') {
    return MOOTQ_FEED_DEFAULT_LIMIT;
  }
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MOOTQ_FEED_MAX_LIMIT) {
    return null;
  }
  return parsed;
}

function encodeExportCursor(createdAt: Date, id: string): string {
  return `${createdAt.toISOString()}|${id}`;
}

function parseExportCursor(
  value: string | null | undefined,
): { createdAt: Date; id: string } | null {
  if (value == null || value === '') {
    return null;
  }
  const separator = value.lastIndexOf('|');
  if (separator <= 0) {
    return null;
  }
  const createdAtRaw = value.slice(0, separator);
  const id = value.slice(separator + 1);
  const createdAt = new Date(createdAtRaw);
  if (!id || Number.isNaN(createdAt.getTime())) {
    return null;
  }
  return { createdAt, id };
}
