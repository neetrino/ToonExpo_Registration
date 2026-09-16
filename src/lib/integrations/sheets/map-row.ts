import { flattenRegistrationAnswersForExport } from '@/lib/admin/export-answers';
import { formatAdminDateTimeForCsv } from '@/lib/admin/format-datetime';
import { CSV_EXPORT_COLUMNS } from '@/lib/admin/constants';
import {
  SHEETS_PUSH_MAX_CELL_CHARS,
  SHEETS_PUSH_MAX_VALUES,
} from '@/lib/integrations/sheets/constants';
import type { FormChannel, Locale } from '@/generated/prisma';

export type SheetsChannel = 'GENERAL' | 'SPYURK_RF';

export type SheetsRow = {
  channel: SheetsChannel;
  tab: string;
  headers: readonly string[];
  values: string[];
};

export const SHEET_TAB_NAMES = {
  GENERAL: 'General',
  SPYURK_RF: 'Spyurk RF',
} as const;

/** Headers match admin CSV (English) plus Registration ID for tracing. */
export const SHEET_HEADERS = [
  'Registration ID',
  ...CSV_EXPORT_COLUMNS.map((column) => column.header),
] as const;

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

/**
 * Build one Apps Script append payload from a registration (human-readable answers).
 */
export function toSheetsRow(registration: RegistrationForSheetRow): SheetsRow {
  const channel = channelFromFormChannel(registration.formChannel);
  const answers = flattenRegistrationAnswersForExport(
    registration.answers,
    registration.locale,
    registration.formVersion,
  );

  const byKey: Record<string, string> = {
    registeredAt: formatAdminDateTimeForCsv(registration.createdAt),
    firstName: registration.firstName,
    lastName: registration.lastName,
    email: registration.email,
    phone: registration.phone,
    locale: registration.locale,
    sourceSystem: registration.sourceSystem ?? '',
    sourceRegistrationId: registration.sourceRegistrationId ?? '',
    utmSource: registration.utmSource ?? '',
    utmMedium: registration.utmMedium ?? '',
    utmCampaign: registration.utmCampaign ?? '',
    ticketCode: registration.ticketCode ?? '',
    attendanceStatus: registration.attendanceStatus ?? '',
    emailDeliveryStatus: registration.emailDeliveryStatus,
    formVersion: registration.formVersion ?? '',
    formChannel: registration.formChannel,
    ...answers,
  };

  const values = [
    registration.id,
    ...CSV_EXPORT_COLUMNS.map((column) => byKey[column.key] ?? ''),
  ].map(sanitizeSheetCell);

  if (values.length > SHEETS_PUSH_MAX_VALUES) {
    throw new Error('SHEETS_ROW_TOO_WIDE');
  }

  return {
    channel,
    tab: channel === 'SPYURK_RF' ? SHEET_TAB_NAMES.SPYURK_RF : SHEET_TAB_NAMES.GENERAL,
    headers: SHEET_HEADERS,
    values,
  };
}
