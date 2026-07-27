import { getPrisma } from '@/lib/db/prisma';
import { MOOTQ_FEED_DEFAULT_LIMIT, MOOTQ_FEED_MAX_LIMIT } from '@/lib/integrations/mootq/constants';
import { logger } from '@/lib/logger';
import { mapRegistrationError } from '@/lib/registrations/errors';

export type MootqFeedItem = {
  sequence: string;
  sourceRegistrationId: string;
  sourceSystem: 'TOON_EXPO';
  ticketCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
};

export type MootqFeedPage = {
  items: MootqFeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type GetMootqFeedResult =
  | { ok: true; page: MootqFeedPage }
  | {
      ok: false;
      code: 'VALIDATION_ERROR' | 'INTERNAL_ERROR' | 'SERVICE_UNAVAILABLE';
      status: 400 | 500 | 503;
    };

/**
 * Incremental Toon Expo-origin feed for Mootq polling.
 * Cursor is PartnerFeedEvent.sequence; replay from a previous cursor is safe.
 */
export async function getMootqToonExpoFeed(params: {
  after?: string | null;
  limit?: string | null;
}): Promise<GetMootqFeedResult> {
  const afterSequence = parseCursor(params.after);
  if (afterSequence === null && params.after != null && params.after !== '') {
    return { ok: false, code: 'VALIDATION_ERROR', status: 400 };
  }

  const limit = parseLimit(params.limit);
  if (limit === null) {
    return { ok: false, code: 'VALIDATION_ERROR', status: 400 };
  }

  const prisma = getPrisma();

  try {
    const rows = await prisma.partnerFeedEvent.findMany({
      where: {
        sequence: { gt: BigInt(afterSequence ?? 0) },
        registration: {
          sourceSystem: 'TOON_EXPO',
          ticketCode: { not: null },
        },
      },
      orderBy: { sequence: 'asc' },
      take: limit + 1,
      select: {
        sequence: true,
        registration: {
          select: {
            id: true,
            ticketCode: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNormalized: true,
            createdAt: true,
          },
        },
      },
    });

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    const items: MootqFeedItem[] = [];
    for (const row of pageRows) {
      if (!row.registration.ticketCode) {
        continue;
      }
      items.push({
        sequence: row.sequence.toString(),
        sourceRegistrationId: row.registration.id,
        sourceSystem: 'TOON_EXPO',
        ticketCode: row.registration.ticketCode,
        firstName: row.registration.firstName,
        lastName: row.registration.lastName,
        email: row.registration.email,
        phone: row.registration.phoneNormalized,
        createdAt: row.registration.createdAt.toISOString(),
      });
    }

    const last = items[items.length - 1];
    return {
      ok: true,
      page: {
        items,
        nextCursor: last
          ? last.sequence
          : params.after && params.after !== ''
            ? params.after
            : null,
        hasMore,
      },
    };
  } catch (error: unknown) {
    const mapped = mapRegistrationError(error);
    logger.error('Mootq feed query failed', { code: mapped.code });
    if (mapped.code === 'SERVICE_UNAVAILABLE') {
      return { ok: false, code: 'SERVICE_UNAVAILABLE', status: 503 };
    }
    return { ok: false, code: 'INTERNAL_ERROR', status: 500 };
  }
}

function parseCursor(value: string | null | undefined): number | null {
  if (value == null || value === '') {
    return 0;
  }
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
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
