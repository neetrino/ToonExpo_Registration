import type { FormChannel } from '@/generated/prisma';
import { getPrisma } from '@/lib/db/prisma';
import { deleteSheetRegistrationRow } from '@/lib/integrations/sheets/client';
import { SHEET_TAB_NAMES, type SheetsChannel } from '@/lib/integrations/sheets/map-row';
import { logger } from '@/lib/logger';
import {
  EPHEMERAL_TEST_PHONE_NORMALIZED,
  EPHEMERAL_TEST_PHONE_TTL_MS,
} from '@/lib/registrations/ephemeral-test-phone';

const PURGE_BATCH_SIZE = 20;

const SHEET_SKIP_REASONS = new Set(['NOT_CONFIGURED', 'SHEETS_WEBHOOK_URL_INVALID']);

export type PurgeEphemeralTestPhoneResult = {
  due: number;
  deleted: number;
  skippedSheet: number;
};

type DueRegistration = {
  id: string;
  formChannel: FormChannel;
};

/**
 * Delete registrations for the live-test phone once they are older than 30 minutes.
 * Sheet row is removed first (matching tab). Other phone numbers are never selected.
 */
export async function purgeExpiredEphemeralTestRegistrations(
  now = new Date(),
): Promise<PurgeEphemeralTestPhoneResult> {
  const cutoff = new Date(now.getTime() - EPHEMERAL_TEST_PHONE_TTL_MS);
  const due = await getPrisma().registration.findMany({
    where: {
      phoneNormalized: EPHEMERAL_TEST_PHONE_NORMALIZED,
      createdAt: { lte: cutoff },
    },
    orderBy: { createdAt: 'asc' },
    take: PURGE_BATCH_SIZE,
    select: { id: true, formChannel: true },
  });

  const result: PurgeEphemeralTestPhoneResult = {
    due: due.length,
    deleted: 0,
    skippedSheet: 0,
  };

  for (const registration of due) {
    const removed = await removeExpiredRegistration(registration);
    if (removed) {
      result.deleted += 1;
    } else {
      result.skippedSheet += 1;
    }
  }

  return result;
}

function sheetTarget(formChannel: FormChannel): { channel: SheetsChannel; tab: string } {
  const channel: SheetsChannel = formChannel === 'SPYURK_RF' ? 'SPYURK_RF' : 'GENERAL';
  return { channel, tab: SHEET_TAB_NAMES[channel] };
}

async function removeExpiredRegistration(registration: DueRegistration): Promise<boolean> {
  const target = sheetTarget(registration.formChannel);
  const sheet = await deleteSheetRegistrationRow({
    channel: target.channel,
    tab: target.tab,
    registrationId: registration.id,
  });

  if (!sheet.ok && !SHEET_SKIP_REASONS.has(sheet.reason)) {
    logger.warn('ephemeral_test_phone.sheet_delete_failed', {
      registrationId: registration.id,
      reason: sheet.reason,
    });
    return false;
  }

  await getPrisma().registration.delete({ where: { id: registration.id } });
  logger.info('ephemeral_test_phone.deleted', {
    registrationId: registration.id,
    channel: target.channel,
  });
  return true;
}
