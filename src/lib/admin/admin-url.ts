export type AdminFormChannelFilter = 'GENERAL' | 'SPYURK_RF';

type AdminUrlParams = {
  q?: string;
  page?: number;
  view?: string;
  channel?: AdminFormChannelFilter;
};

export function parseAdminFormChannel(
  raw: string | undefined | null,
): AdminFormChannelFilter | undefined {
  if (raw === 'GENERAL' || raw === 'SPYURK_RF') {
    return raw;
  }
  return undefined;
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
