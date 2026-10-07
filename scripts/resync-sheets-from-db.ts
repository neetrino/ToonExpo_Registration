import 'dotenv/config';
import { getPrisma } from '../src/lib/db/prisma';
import { appendSheetRow } from '../src/lib/integrations/sheets/client';
import { getSheetsWebhookConfig } from '../src/lib/integrations/sheets/config';
import { SHEETS_PUSH_MIN_INTERVAL_MS } from '../src/lib/integrations/sheets/constants';
import { toSheetsRow, type SheetsRow } from '../src/lib/integrations/sheets/map-row';

const RESET_TIMEOUT_MS = 120_000;
const CHANNELS = ['GENERAL', 'SPYURK_RF'] as const;

type SheetChannel = (typeof CHANNELS)[number];

/**
 * Replace both Sheets tabs with the current TOON_EXPO rows from Neon.
 * MOOTQ registrations stay out of the sheet. Already-sent rows are rewritten
 * once, not appended again.
 *
 * Usage:
 *   pnpm exec tsx scripts/resync-sheets-from-db.ts
 *   pnpm exec tsx scripts/resync-sheets-from-db.ts --apply
 */
async function loadChannel(channel: SheetChannel): Promise<SheetsRow[]> {
  const prisma = getPrisma();
  const registrations = await prisma.registration.findMany({
    where: { sourceSystem: 'TOON_EXPO', formChannel: channel },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      createdAt: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      locale: true,
      sourceSystem: true,
      sourceRegistrationId: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      ticketCode: true,
      attendanceStatus: true,
      emailDeliveryStatus: true,
      formVersion: true,
      formChannel: true,
      answers: true,
    },
  });

  return registrations.map((registration) => toSheetsRow(registration));
}

function resetBody(rows: SheetsRow[], secret: string): string {
  const first = rows[0];
  if (!first) {
    throw new Error('empty channel');
  }

  return JSON.stringify({
    secret,
    action: 'reset',
    channel: first.channel,
    tab: first.tab,
    headers: first.headers,
    rows: rows.map((row) => row.values),
  });
}

async function postReset(rows: SheetsRow[], secret: string, url: string): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: resetBody(rows, secret),
    signal: AbortSignal.timeout(RESET_TIMEOUT_MS),
  });
  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new Error(`sheets reset returned non-json (${response.status})`);
  }

  if (!parsed || typeof parsed !== 'object' || !('ok' in parsed) || parsed.ok !== true) {
    const detail = text.split(secret).join('[redacted]').slice(0, 180);
    throw new Error(`sheets reset failed (${response.status}): ${detail}`);
  }
}

async function appendCreatedSince(since: Date, alreadyWritten: Set<string>): Promise<number> {
  const prisma = getPrisma();
  const created = await prisma.registration.findMany({
    where: { sourceSystem: 'TOON_EXPO', createdAt: { gte: since } },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      createdAt: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      locale: true,
      sourceSystem: true,
      sourceRegistrationId: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      ticketCode: true,
      attendanceStatus: true,
      emailDeliveryStatus: true,
      formVersion: true,
      formChannel: true,
      answers: true,
    },
  });
  const missing = created.filter((registration) => !alreadyWritten.has(registration.id));

  for (let index = 0; index < missing.length; index += 1) {
    const registration = missing[index];
    if (!registration) {
      continue;
    }
    const result = await appendSheetRow(toSheetsRow(registration));
    if (!result.ok) {
      throw new Error(`delta append failed: ${result.reason}`);
    }
    if (index < missing.length - 1) {
      await delay(SHEETS_PUSH_MIN_INTERVAL_MS);
    }
  }

  return missing.length;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  const config = getSheetsWebhookConfig();
  if (!config.ok) {
    throw new Error(config.reason);
  }

  const since = new Date();
  const writtenIds = new Set<string>();

  for (const channel of CHANNELS) {
    const rows = await loadChannel(channel);
    if (rows.length === 0) {
      throw new Error(`refusing to clear empty channel ${channel}`);
    }
    for (const row of rows) {
      const id = row.values[0];
      if (id) {
        writtenIds.add(id);
      }
    }
    const bytes = Buffer.byteLength(resetBody(rows, config.secret), 'utf8');
    const tab = rows[0]?.tab ?? channel;
    process.stdout.write(`${JSON.stringify({ channel, tab, rows: rows.length, bytes, apply })}\n`);
    if (apply) {
      await postReset(rows, config.secret, config.url);
    }
  }

  if (!apply) {
    process.stdout.write(`${JSON.stringify({ dryRun: true })}\n`);
    return;
  }

  const delta = await appendCreatedSince(since, writtenIds);
  process.stdout.write(`${JSON.stringify({ ok: true, delta })}\n`);
}

main()
  .catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : 'resync failed'}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
