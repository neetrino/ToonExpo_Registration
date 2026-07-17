import { buildCsv } from '@/lib/admin/csv';
import { CSV_EXPORT_COLUMNS } from '@/lib/admin/constants';
import { flattenRegistrationAnswersForExport } from '@/lib/admin/export-answers';
import { listRegistrationsForExport } from '@/lib/admin/list-registrations';

/**
 * Build a formula-safe, human-readable CSV for the active event (optional search filter).
 * Questionnaire answers are flattened into separate English-labeled columns.
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
    emailDeliveryStatus: row.emailDeliveryStatus,
    formVersion: row.formVersion ?? '',
    ...flattenRegistrationAnswersForExport(row.answers),
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
export {
  ADMIN_PAGE_SIZE,
  ADMIN_SEARCH_MAX_LENGTH,
  ADMIN_NO_STORE_HEADERS,
  CSV_EXPORT_COLUMNS,
  CSV_ANSWER_COLUMNS,
  CSV_IDENTITY_COLUMNS,
} from '@/lib/admin/constants';
