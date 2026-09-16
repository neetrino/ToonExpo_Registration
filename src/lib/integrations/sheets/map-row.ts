import { flattenRegistrationAnswersForExport } from '@/lib/admin/export-answers';
import { formatAdminDateTimeForCsv } from '@/lib/admin/format-datetime';
import {
  SHEETS_PUSH_MAX_CELL_CHARS,
  SHEETS_PUSH_MAX_VALUES,
} from '@/lib/integrations/sheets/constants';
import {
  SHEET_GENERAL_COLUMNS,
  SHEET_SPYURK_COLUMNS,
  sheetAttendanceLabel,
  sheetEmailDeliveryLabel,
  sheetLocaleLabel,
  sheetNewsletterLabel,
  type SheetColumnDef,
} from '@/lib/integrations/sheets/sheet-columns';
import type { FormChannel, Locale } from '@/generated/prisma';

export type SheetsChannel = 'GENERAL' | 'SPYURK_RF';

export type SheetsRow = {
  channel: SheetsChannel;
  tab: string;
  headers: readonly string[];
  values: string[];
};

export const SHEET_TAB_NAMES = {
  GENERAL: 'Ընդհանուր',
  SPYURK_RF: 'Սփյուռք ՌԴ',
} as const;

export type RegistrationForSheetRow = {
  id: string;
  createdAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  locale: Locale;
  sourceSystem: string | null;
  sourceRegistrationId: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  ticketCode: string | null;
  attendanceStatus: string | null;
  emailDeliveryStatus: string;
  formVersion: string | null;
  formChannel: FormChannel;
  answers: unknown;
};

export function sanitizeSheetCell(value: string): string {
  const text = value.slice(0, SHEETS_PUSH_MAX_CELL_CHARS);
  if (/^[=+\-@\t\r]/.test(text)) {
    return `'${text}`;
  }
  return text;
}

function channelFromFormChannel(formChannel: FormChannel): SheetsChannel {
  return formChannel === 'SPYURK_RF' ? 'SPYURK_RF' : 'GENERAL';
}

function columnsForChannel(channel: SheetsChannel): readonly SheetColumnDef[] {
  return channel === 'SPYURK_RF' ? SHEET_SPYURK_COLUMNS : SHEET_GENERAL_COLUMNS;
}

/**
 * Build one Apps Script append payload.
 * Answers are always localized to Armenian so the Sheet stays operator-friendly.
 */
export function toSheetsRow(registration: RegistrationForSheetRow): SheetsRow {
  const channel = channelFromFormChannel(registration.formChannel);
  const columns = columnsForChannel(channel);
  const answers = flattenRegistrationAnswersForExport(
    registration.answers,
    'hy',
    registration.formVersion,
  );

  const byKey: Record<string, string> = {
    registrationId: registration.id,
    registeredAt: formatAdminDateTimeForCsv(registration.createdAt),
    firstName: registration.firstName,
    lastName: registration.lastName,
    email: registration.email,
    phone: registration.phone,
    locale: sheetLocaleLabel(registration.locale),
    utmSource: registration.utmSource ?? '',
    utmMedium: registration.utmMedium ?? '',
    utmCampaign: registration.utmCampaign ?? '',
    ticketCode: registration.ticketCode ?? '',
    attendanceStatus: sheetAttendanceLabel(registration.attendanceStatus),
    emailDelivery: sheetEmailDeliveryLabel(registration.emailDeliveryStatus),
    ...answers,
    newsletter: sheetNewsletterLabel(answers.newsletter ?? ''),
  };

  const headers = columns.map((column) => column.header);
  const values = columns.map((column) => sanitizeSheetCell(byKey[column.key] ?? ''));

  if (values.length > SHEETS_PUSH_MAX_VALUES) {
    throw new Error('SHEETS_ROW_TOO_WIDE');
  }

  return {
    channel,
    tab: channel === 'SPYURK_RF' ? SHEET_TAB_NAMES.SPYURK_RF : SHEET_TAB_NAMES.GENERAL,
    headers,
    values,
  };
}
