import { ADMIN_SEARCH_MAX_LENGTH } from '@/lib/admin/constants';
import { buildAdminHref } from '@/lib/admin/admin-url';

/**
 * Trim and bound an admin list search string. Empty input becomes undefined.
 */
export function normalizeAdminSearchQuery(raw: string | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }

  const trimmed = raw.trim().slice(0, ADMIN_SEARCH_MAX_LENGTH);
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Live-search URL: query only, always page 1 (page omitted).
 */
export function buildAdminSearchHref(rawQuery: string): string {
  return buildAdminHref({ q: normalizeAdminSearchQuery(rawQuery) });
}
