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
      <header className="sticky top-0 z-20 border-b border-white/10 bg-primary">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/95 shadow-sm">
              <ToonExpoLogo size={28} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
                Admin
              </p>
              <h1 className="truncate font-display text-lg font-bold tracking-tight text-white sm:text-xl">
                Registrations
              </h1>
              {data.event ? (
                <p className="mt-0.5 truncate text-xs text-white/55">{data.event.name}</p>
              ) : null}
            </div>
          </div>
          <AdminLogoutButton variant="inverse" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-5 sm:space-y-5 sm:px-6 sm:py-8">
        <section className="rounded-2xl border border-border/80 bg-background p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-end gap-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Total
                </p>
                <p className="mt-1 font-display text-4xl font-bold tabular-nums leading-none text-primary">
                  {data.totalCount}
                </p>
              </div>
              <p className="hidden pb-1 text-xs text-muted-foreground sm:block">
                Times in Asia/Yerevan (UTC+4)
              </p>
            </div>

            <div className="flex w-full min-w-0 flex-1 flex-col gap-2.5 sm:flex-row sm:items-center lg:justify-end">
              <AdminSearchForm initialQuery={query} variant="toolbar" className="min-w-0 flex-1" />
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="size-11 shrink-0 p-0 sm:size-10"
              >
                <a href={exportHref} aria-label="Export CSV" title="Export CSV">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M12 15V3" />
                  </svg>
                </a>
              </Button>
            </div>
          </div>

          {query ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Showing {data.filteredCount} match{data.filteredCount === 1 ? '' : 'es'} for &ldquo;
              {query}&rdquo;
            </p>
          ) : null}
        </section>

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
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 bg-muted/40 px-4 py-3.5 text-sm sm:px-5">
              <p className="text-muted-foreground">
                Page {data.page} of {totalPages}
              </p>
              <div className="flex gap-2">
                {data.page > 1 ? (
                  <Button asChild variant="outline" size="sm" className="min-h-10 px-4">
                    <Link href={listHref(data.page - 1)}>Previous</Link>
                  </Button>
                ) : null}
                {data.page < totalPages ? (
                  <Button asChild variant="outline" size="sm" className="min-h-10 px-4">
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
