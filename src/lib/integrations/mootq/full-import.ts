import { z } from 'zod';
import { getPrisma } from '@/lib/db/prisma';
import { DELIVERY_CLAIM_BATCH_SIZE_AFTER_CREATE } from '@/lib/delivery/constants';
import { createTicketDeliveryJobs } from '@/lib/delivery/create-ticket-delivery-jobs';
import { processDueDeliveryJobs } from '@/lib/delivery/process-delivery-jobs';
import { MOOTQ_PRIVACY_POLICY_VERSION } from '@/lib/integrations/mootq/constants';
import { logger } from '@/lib/logger';
import { mapRegistrationError } from '@/lib/registrations/errors';
import { generateTicketViewToken } from '@/lib/tickets/codes';
import { isValidTicketCode } from '@/lib/tickets/ticket-code-format';
import { normalizeEmail, normalizeName, trimEmail } from '@/lib/validation/normalize';
import { normalizePhone } from '@/lib/validation/phone';

const fullImportRecordSchema = z.object({
  ticketCode: z.string().refine((value) => isValidTicketCode(value)),
  sourceSystem: z.enum(['TOON_EXPO', 'MOOTQ']),
  sourceRegistrationId: z.string().min(1).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(1).max(64),
  locale: z.enum(['hy', 'en', 'ru']).optional(),
  attendanceStatus: z.enum(['NOT_VISITED', 'VISITED']).nullable().optional(),
  formVersion: z.string().nullable().optional(),
  answers: z.unknown().optional(),
  createdAt: z.string().datetime({ offset: true }).optional(),
});

export type FullImportRecord = z.infer<typeof fullImportRecordSchema>;

export type StartFullImportResult =
  | { ok: true; runId: string; status: 'SUCCEEDED' | 'PARTIAL' | 'FAILED' }
  | { ok: false; error: string };

type Counters = {
  read: number;
  created: number;
  updated: number;
  skipped: number;
  conflict: number;
  error: number;
};

/**
 * Admin-triggered full import from Mootq.
 * Requires MOOTQ_FULL_EXPORT_BASE_URL + MOOTQ_FULL_EXPORT_KEY. Without them returns NOT_CONFIGURED.
 */
export async function startFullImportFromMootq(
  initiatedBy: string,
): Promise<StartFullImportResult> {
  const baseUrl = process.env.MOOTQ_FULL_EXPORT_BASE_URL?.trim();
  const exportKey = process.env.MOOTQ_FULL_EXPORT_KEY?.trim();

  if (!baseUrl || !exportKey || exportKey.length < 32) {
    return {
      ok: false,
      error:
        'Mootq full export is not configured yet. Set MOOTQ_FULL_EXPORT_BASE_URL and MOOTQ_FULL_EXPORT_KEY when Mootq provides them.',
    };
  }

  const prisma = getPrisma();
  const run = await prisma.integrationSyncRun.create({
    data: {
      direction: 'IMPORT_FROM_MQ',
      status: 'RUNNING',
      initiatedBy,
    },
    select: { id: true },
  });

  const counters: Counters = {
    read: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    conflict: 0,
    error: 0,
  };
  const errorSummary: Array<{ code: string }> = [];

  try {
    let after: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const page = await fetchMootqFullPage(baseUrl, exportKey, after);
      if (!page.ok) {
        counters.error += 1;
        errorSummary.push({ code: page.code });
        await finishRun(run.id, 'FAILED', counters, after, errorSummary);
        return { ok: true, runId: run.id, status: 'FAILED' };
      }

      for (const raw of page.items) {
        counters.read += 1;
        const outcome = await upsertImportedRecord(raw);
        counters[outcome] += 1;
        if (outcome === 'conflict' || outcome === 'error') {
          errorSummary.push({
            code: outcome,
          });
        }
      }

      after = page.nextCursor;
      hasMore = page.hasMore;
      await prisma.integrationSyncRun.update({
        where: { id: run.id },
        data: {
          lastCursor: after,
          readCount: counters.read,
          createdCount: counters.created,
          updatedCount: counters.updated,
          skippedCount: counters.skipped,
          conflictCount: counters.conflict,
          errorCount: counters.error,
        },
      });
    }

    const status = counters.conflict > 0 || counters.error > 0 ? 'PARTIAL' : ('SUCCEEDED' as const);
    await finishRun(run.id, status, counters, after, errorSummary);
    return { ok: true, runId: run.id, status };
  } catch (error: unknown) {
    logger.error('Full import failed', { code: mapRegistrationError(error).code, runId: run.id });
    await finishRun(run.id, 'FAILED', counters, null, [
      ...errorSummary,
      { code: 'INTERNAL_ERROR' },
    ]);
    return { ok: true, runId: run.id, status: 'FAILED' };
  }
}

async function fetchMootqFullPage(
  baseUrl: string,
  exportKey: string,
  after: string | null,
): Promise<
  | { ok: true; items: unknown[]; nextCursor: string | null; hasMore: boolean }
  | { ok: false; code: string }
> {
  const url = new URL(baseUrl.replace(/\/$/, '') + '/records');
  if (after) {
    url.searchParams.set('after', after);
  }
  url.searchParams.set('limit', '200');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${exportKey}`,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    return { ok: false, code: `http_${response.status}` };
  }

  const payload = (await response.json()) as {
    items?: unknown[];
    nextCursor?: string | null;
    hasMore?: boolean;
  };

  return {
    ok: true,
    items: Array.isArray(payload.items) ? payload.items : [],
    nextCursor: payload.nextCursor ?? null,
    hasMore: Boolean(payload.hasMore),
  };
}

async function upsertImportedRecord(
  raw: unknown,
): Promise<'created' | 'updated' | 'skipped' | 'conflict' | 'error'> {
  const parsed = fullImportRecordSchema.safeParse(raw);
  if (!parsed.success) {
    return 'error';
  }

  const input = parsed.data;
  const prisma = getPrisma();
  const phone = normalizePhone(input.phone);
  if (!phone) {
    return 'error';
  }

  const email = trimEmail(input.email);
  const emailNormalized = normalizeEmail(email);
  const firstName = normalizeName(input.firstName);
  const lastName = normalizeName(input.lastName);

  try {
    const existing = await prisma.registration.findFirst({
      where: { ticketCode: input.ticketCode },
      select: {
        id: true,
        sourceSystem: true,
        sourceRegistrationId: true,
      },
    });

    if (existing) {
      if (
        existing.sourceSystem &&
        (existing.sourceSystem !== input.sourceSystem ||
          (existing.sourceRegistrationId &&
            existing.sourceRegistrationId !== input.sourceRegistrationId))
      ) {
        return 'conflict';
      }

      await prisma.registration.update({
        where: { id: existing.id },
        data: {
          attendanceStatus: input.attendanceStatus ?? undefined,
          ...(input.sourceSystem === 'MOOTQ'
            ? {
                firstName,
                lastName,
                email,
                emailNormalized,
                phone: phone.phone,
                phoneNormalized: phone.phoneNormalized,
                locale: input.locale ?? undefined,
                formVersion: input.formVersion ?? undefined,
                answers: input.answers === undefined ? undefined : (input.answers as object),
              }
            : {}),
        },
      });
      return 'updated';
    }

    if (input.sourceSystem === 'TOON_EXPO') {
      return 'skipped';
    }

    const activeEvent = await prisma.event.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (!activeEvent) {
      return 'error';
    }

    const created = await prisma.$transaction(async (tx) => {
      const registration = await tx.registration.create({
        data: {
          eventId: activeEvent.id,
          firstName,
          lastName,
          email,
          emailNormalized,
          phone: phone.phone,
          phoneNormalized: phone.phoneNormalized,
          locale: input.locale ?? 'hy',
          consentAcceptedAt: input.createdAt ? new Date(input.createdAt) : new Date(),
          privacyPolicyVersion: MOOTQ_PRIVACY_POLICY_VERSION,
          sourceSystem: 'MOOTQ',
          sourceRegistrationId: input.sourceRegistrationId,
          ticketCode: input.ticketCode,
          ticketViewToken: generateTicketViewToken(),
          attendanceStatus: input.attendanceStatus ?? 'NOT_VISITED',
          formVersion: input.formVersion ?? null,
          answers: input.answers === undefined ? undefined : (input.answers as object),
          emailDeliveryStatus: 'PENDING',
        },
        select: { id: true },
      });

      await createTicketDeliveryJobs(tx, registration.id);

      return registration;
    });

    await processDueDeliveryJobs({
      registrationId: created.id,
      limit: DELIVERY_CLAIM_BATCH_SIZE_AFTER_CREATE,
    });
    return 'created';
  } catch (error: unknown) {
    logger.error('Full import upsert failed', { code: mapRegistrationError(error).code });
    return 'error';
  }
}

async function finishRun(
  runId: string,
  status: 'SUCCEEDED' | 'PARTIAL' | 'FAILED',
  counters: Counters,
  lastCursor: string | null,
  errorSummary: Array<{ code: string }>,
): Promise<void> {
  const prisma = getPrisma();
  await prisma.integrationSyncRun.update({
    where: { id: runId },
    data: {
      status,
      finishedAt: new Date(),
      lastCursor,
      readCount: counters.read,
      createdCount: counters.created,
      updatedCount: counters.updated,
      skippedCount: counters.skipped,
      conflictCount: counters.conflict,
      errorCount: counters.error,
      errorSummary: errorSummary.slice(0, 50),
    },
  });
}
