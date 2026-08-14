import { buildCsv } from '@/lib/admin/csv';
import { CSV_EXPORT_COLUMNS } from '@/lib/admin/constants';
import { flattenRegistrationAnswersForExport } from '@/lib/admin/export-answers';
import { listRegistrationsForExport } from '@/lib/admin/list-registrations';

/**
 * Build a formula-safe, human-readable CSV for the active event (optional search filter).
 * Questionnaire answer values are localized to each registration's locale;
 * column headers stay English for operator consistency.
 */
export async function buildRegistrationsCsv(search?: string): Promise<{
  filename: string;
  csv: string;
} | null> {
  const { event, rows } = await listRegistrationsForExport(search);

  if (!event) {
    return null;
  }

  const dateStamp = new Date().toISOString().slice(0, 10);
  const filename = `${event.slug}-registrations-${dateStamp}.csv`;

  const csvRows = rows.map((row) => ({
    registeredAt: row.createdAt.toISOString(),
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    locale: row.locale,
    sourceSystem: row.sourceSystem ?? '',
    sourceRegistrationId: row.sourceRegistrationId ?? '',
    utmSource: row.utmSource ?? '',
    utmMedium: row.utmMedium ?? '',
    utmCampaign: row.utmCampaign ?? '',
    ticketCode: row.ticketCode ?? '',
    attendanceStatus: row.attendanceStatus ?? '',
    emailDeliveryStatus: row.emailDeliveryStatus,
    formVersion: row.formVersion ?? '',
    ...flattenRegistrationAnswersForExport(row.answers, row.locale),
  }));

  return {
    filename,
    csv: buildCsv(CSV_EXPORT_COLUMNS, csvRows),
  };
}

export { neutralizeCsvValue, formatCsvCell, buildCsv } from '@/lib/admin/csv';
export { listAdminRegistrations, listRegistrationsForExport } from '@/lib/admin/list-registrations';
export { getAdminRegistration } from '@/lib/admin/get-registration';
export { formatRegistrationAnswersForDisplay } from '@/lib/admin/format-answers';
export { flattenRegistrationAnswersForExport } from '@/lib/admin/export-answers';
export { deleteRegistration } from '@/lib/admin/delete-registration';
export { resendRegistrationTicket } from '@/lib/admin/resend-ticket';
export { listAdminSyncRuns } from '@/lib/admin/list-sync-runs';
export {
  ADMIN_PAGE_SIZE,
  ADMIN_SEARCH_MAX_LENGTH,
  ADMIN_NO_STORE_HEADERS,
  CSV_EXPORT_COLUMNS,
  CSV_ANSWER_COLUMNS,
  CSV_IDENTITY_COLUMNS,
} from '@/lib/admin/constants';
