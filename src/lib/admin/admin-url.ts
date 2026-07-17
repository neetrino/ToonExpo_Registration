type AdminUrlParams = {
  q?: string;
  page?: number;
  view?: string;
};

/**
 * Build an admin dashboard href preserving list filters and optional detail view.
 */
export function buildAdminHref(params: AdminUrlParams = {}): string {
  const search = new URLSearchParams();

  if (params.q) {
    search.set('q', params.q);
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
