export type AdminFormChannelFilter = 'GENERAL' | 'SPYURK_RF';

/** Admin list pill: a public form channel, or Mootq-origin registrations. */
export type AdminListFilter = AdminFormChannelFilter | 'MOOTQ';

type AdminUrlParams = {
  q?: string;
  page?: number;
  view?: string;
  channel?: AdminListFilter;
};

export function parseAdminListFilter(raw: string | undefined | null): AdminListFilter | undefined {
  if (raw === 'GENERAL' || raw === 'SPYURK_RF' || raw === 'MOOTQ') {
    return raw;
  }
  return undefined;
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

/**
 * Build an admin dashboard href preserving list filters and optional detail view.
 */
export function buildAdminHref(params: AdminUrlParams = {}): string {
  const search = new URLSearchParams();

  if (params.q) {
    search.set('q', params.q);
  }

  if (params.channel) {
    search.set('channel', params.channel);
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
