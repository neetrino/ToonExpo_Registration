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
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3.5">
            <ToonExpoLogo size={36} />
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-bold tracking-tight text-primary">
                Registrations
              </h1>
              <div className="mt-1.5 h-0.5 w-10 bg-highlight" aria-hidden="true" />
              {data.event ? (
                <p className="mt-2 truncate text-xs text-muted-foreground">{data.event.name}</p>
              ) : null}
            </div>
          </div>
          <AdminLogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-end gap-4">
            <div className="border-l-4 border-accent pl-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Total
              </p>
              <p className="mt-0.5 font-display text-4xl font-bold tabular-nums leading-none text-primary">
                {data.totalCount}
              </p>
            </div>
            <p className="hidden pb-1 text-xs text-muted-foreground sm:block">
              Times in Asia/Yerevan (UTC+4)
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:max-w-2xl lg:justify-end">
            <AdminSearchForm initialQuery={query} variant="toolbar" className="flex-1" />
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="h-10 shrink-0 px-4 shadow-sm sm:w-auto"
            >
              <a href={exportHref}>Export CSV</a>
            </Button>
          </div>
        </section>

        {query ? (
          <p className="text-sm text-muted-foreground">
            Showing {data.filteredCount} match{data.filteredCount === 1 ? '' : 'es'} for &ldquo;
            {query}&rdquo;
          </p>
        ) : null}

        <section className="overflow-hidden rounded-2xl border border-border/80 bg-background shadow-sm">
          {!data.event ? (
            <div className="px-6 py-16 text-center">
              <p className="font-display text-lg font-semibold text-primary">No active event</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Configure an active event before registrations can appear here.
              </p>
            </div>
          ) : data.rows.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-display text-lg font-semibold text-primary">
                {query ? 'No results' : 'No registrations yet'}
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {query
                  ? 'Try a different name, email, or phone number.'
                  : 'New registrations will show up here as visitors complete the form.'}
              </p>
              {query ? (
                <Button asChild variant="outline" size="sm" className="mt-5">
                  <Link href={buildAdminHref()}>Clear search</Link>
                </Button>
              ) : null}
            </div>
          ) : (
            <AdminRegistrationsList rows={data.rows} query={query} page={page} />
          )}

          {data.event && data.filteredCount > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 bg-muted/30 px-5 py-3.5 text-sm">
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
