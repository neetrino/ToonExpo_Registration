import Link from 'next/link';
import { ToonExpoLogo } from '@/components/brand/toon-expo-logo';
import { AdminLogoutButton } from '@/components/admin/admin-logout-button';
import { AdminRegistrationsList } from '@/components/admin/admin-registrations-list';
import { AdminSearchForm } from '@/components/admin/admin-search-form';
import { RegistrationDetailSheet } from '@/components/admin/registration-detail-sheet';
import { Button } from '@/components/ui/button';
import { buildAdminHref } from '@/lib/admin/admin-url';
import { getAdminRegistration } from '@/lib/admin/get-registration';
import { listAdminRegistrations } from '@/lib/admin';

export const dynamic = 'force-dynamic';

type AdminDashboardPageProps = {
  searchParams: Promise<{ q?: string; page?: string; view?: string }>;
};

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? '';
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);
  const viewId = params.view?.trim() || undefined;

  const [data, viewRegistration] = await Promise.all([
    listAdminRegistrations({ page, search: query || undefined }),
    viewId ? getAdminRegistration(viewId) : Promise.resolve(null),
  ]);

  const totalPages = Math.max(1, Math.ceil(data.filteredCount / data.pageSize));
  const exportHref = query
    ? `/api/admin/registrations/export?q=${encodeURIComponent(query)}`
    : '/api/admin/registrations/export';
  const closeHref = buildAdminHref({ q: query || undefined, page });
  const listHref = (targetPage: number) =>
    buildAdminHref({ q: query || undefined, page: targetPage });

  return (
    <div className="min-h-dvh bg-muted">
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <ToonExpoLogo size={32} />
            <div className="min-w-0">
              <h1 className="truncate font-display text-lg font-bold text-primary">Registrations</h1>
              {data.event ? (
                <p className="truncate text-xs text-muted-foreground">{data.event.name}</p>
              ) : null}
            </div>
          </div>
          <AdminLogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <section className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="rounded-xl border border-border bg-primary px-5 py-4 text-primary-foreground">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Total registrations
            </p>
            <p className="mt-1 font-display text-4xl font-extrabold">{data.totalCount}</p>
            <p className="mt-2 text-xs text-white/60">Times shown in Asia/Yerevan (UTC+4).</p>
          </div>
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <a href={exportHref}>Export CSV</a>
          </Button>
        </section>

        <section className="rounded-xl border border-border bg-background p-4 sm:p-5">
          <AdminSearchForm initialQuery={query} />
          {query ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Showing {data.filteredCount} match{data.filteredCount === 1 ? '' : 'es'} for &ldquo;
              {query}&rdquo;
            </p>
          ) : null}
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-background">
          {!data.event ? (
            <div className="px-6 py-12 text-center">
              <p className="font-display text-lg font-bold text-primary">No active event</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Configure an active event before registrations can appear here.
              </p>
            </div>
          ) : data.rows.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-display text-lg font-bold text-primary">
                {query ? 'No results' : 'No registrations yet'}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {query
                  ? 'Try a different name, email, or phone number.'
                  : 'New registrations will show up here as visitors complete the form.'}
              </p>
              {query ? (
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href={buildAdminHref()}>Clear search</Link>
                </Button>
              ) : null}
            </div>
          ) : (
            <AdminRegistrationsList rows={data.rows} query={query} page={page} />
          )}

          {data.event && data.filteredCount > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm">
              <p className="text-muted-foreground">
                Page {data.page} of {totalPages}
              </p>
              <div className="flex gap-2">
                {data.page > 1 ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={listHref(data.page - 1)}>Previous</Link>
                  </Button>
                ) : null}
                {data.page < totalPages ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={listHref(data.page + 1)}>Next</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      </main>

      {viewRegistration ? (
        <RegistrationDetailSheet registration={viewRegistration} closeHref={closeHref} />
      ) : null}
    </div>
  );
}
