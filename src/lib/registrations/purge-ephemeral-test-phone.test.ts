import { afterEach, describe, expect, it, vi } from 'vitest';
import { EPHEMERAL_TEST_PHONE_NORMALIZED } from '@/lib/registrations/ephemeral-test-phone';

const getPrisma = vi.hoisted(() => vi.fn());
const deleteSheetRegistrationRow = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db/prisma', () => ({ getPrisma }));
vi.mock('@/lib/integrations/sheets/client', () => ({ deleteSheetRegistrationRow }));

import { purgeExpiredEphemeralTestRegistrations } from '@/lib/registrations/purge-ephemeral-test-phone';

const NOW = new Date('2026-09-24T12:30:00.000Z');

describe('purgeExpiredEphemeralTestRegistrations', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deletes only the test phone after 30 minutes, on the matching sheet tab', async () => {
    const findMany = vi.fn().mockResolvedValue([
      { id: 'reg_general', formChannel: 'GENERAL' },
      { id: 'reg_spyurk', formChannel: 'SPYURK_RF' },
    ]);
    const deleteRow = vi.fn().mockResolvedValue({ count: 1 });
    getPrisma.mockReturnValue({
      registration: { findMany, delete: deleteRow },
    });
    deleteSheetRegistrationRow.mockResolvedValue({ ok: true });

    const result = await purgeExpiredEphemeralTestRegistrations(NOW);

    expect(findMany).toHaveBeenCalledWith({
      where: {
        phoneNormalized: EPHEMERAL_TEST_PHONE_NORMALIZED,
        createdAt: { lte: new Date('2026-09-24T12:00:00.000Z') },
      },
      orderBy: { createdAt: 'asc' },
      take: 20,
      select: { id: true, formChannel: true },
    });
    expect(deleteSheetRegistrationRow).toHaveBeenNthCalledWith(1, {
      channel: 'GENERAL',
      tab: 'Ընդհանուր',
      registrationId: 'reg_general',
    });
    expect(deleteSheetRegistrationRow).toHaveBeenNthCalledWith(2, {
      channel: 'SPYURK_RF',
      tab: 'Սփյուռք ՌԴ',
      registrationId: 'reg_spyurk',
    });
    expect(deleteRow).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ due: 2, deleted: 2, skippedSheet: 0 });
  });

  it('keeps the database row when the sheet delete fails', async () => {
    const findMany = vi.fn().mockResolvedValue([{ id: 'reg_1', formChannel: 'GENERAL' }]);
    const deleteRow = vi.fn();
    getPrisma.mockReturnValue({
      registration: { findMany, delete: deleteRow },
    });
    deleteSheetRegistrationRow.mockResolvedValue({
      ok: false,
      reason: 'SHEETS_WEBHOOK_failed',
      retryable: true,
    });

    const result = await purgeExpiredEphemeralTestRegistrations(NOW);

    expect(deleteRow).not.toHaveBeenCalled();
    expect(result).toEqual({ due: 1, deleted: 0, skippedSheet: 1 });
  });
});
