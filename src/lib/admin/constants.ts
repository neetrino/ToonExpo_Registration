/** Default page size for the admin registration table. */
export const ADMIN_PAGE_SIZE = 25;

/** Maximum search query length accepted by admin list/export filters. */
export const ADMIN_SEARCH_MAX_LENGTH = 100;

/** Cache-Control for admin responses that include participant data. */
export const ADMIN_NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
} as const;

export const CSV_EXPORT_COLUMNS = [
  'registeredAt',
  'firstName',
  'lastName',
  'email',
  'phone',
  'locale',
  'emailDeliveryStatus',
] as const;

export type CsvExportColumn = (typeof CSV_EXPORT_COLUMNS)[number];
