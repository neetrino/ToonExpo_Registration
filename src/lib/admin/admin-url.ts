export const ADMIN_LIST_FILTERS = ['GENERAL', 'SPYURK_RF', 'MOOTQ'] as const;

export type AdminListFilter = (typeof ADMIN_LIST_FILTERS)[number];

export type AdminFormChannelFilter = Exclude<AdminListFilter, 'MOOTQ'>;

type AdminUrlParams = {
  q?: string;
  page?: number;
  view?: string;
  channels?: readonly AdminListFilter[];
};

export function parseAdminListFilter(raw: string | undefined | null): AdminListFilter | undefined {
  if (raw === 'GENERAL' || raw === 'SPYURK_RF' || raw === 'MOOTQ') {
    return raw;
  }
  return undefined;
}

/** Selected pills in a stable order. Unknown values are dropped. */
export function parseAdminListFilters(
  raw: string | readonly string[] | undefined | null,
): AdminListFilter[] {
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const selected = new Set<AdminListFilter>();
  for (const value of values) {
    const parsed = parseAdminListFilter(value);
    if (parsed) {
      selected.add(parsed);
    }
  }
  return ADMIN_LIST_FILTERS.filter((filter) => selected.has(filter));
}

/** Add a filter, or remove it when it is already selected. Empty means All. */
export function toggleAdminListFilter(
  current: readonly AdminListFilter[],
  filter: AdminListFilter,
): AdminListFilter[] {
  const selected = new Set(current);
  if (selected.has(filter)) {
    selected.delete(filter);
  } else {
    selected.add(filter);
  }
  return ADMIN_LIST_FILTERS.filter((item) => selected.has(item));
}

export function adminListFilterLabel(filter: AdminListFilter): string {
  if (filter === 'SPYURK_RF') {
    return 'Spyurk RF';
  }
  if (filter === 'MOOTQ') {
    return 'Mootq';
  }
  return 'General';
}

export function adminListFiltersLabel(filters: readonly AdminListFilter[]): string {
  return filters.map(adminListFilterLabel).join(', ');
}

/**
 * Build an admin dashboard href preserving list filters and optional detail view.
 */
export function buildAdminHref(params: AdminUrlParams = {}): string {
  const search = new URLSearchParams();

  if (params.q) {
    search.set('q', params.q);
  }

  for (const filter of parseAdminListFilters(params.channels ?? [])) {
    search.append('channel', filter);
  }

  if (params.page && params.page > 1) {
    search.set('page', String(params.page));
  }

  if (params.view) {
    search.set('view', params.view);
  }

  const query = search.toString();
  return query ? `/admin?${query}` : '/admin';
}
