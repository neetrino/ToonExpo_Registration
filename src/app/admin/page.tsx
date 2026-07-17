import Link from 'next/link';
import { AdminLogoutButton } from '@/components/admin/admin-logout-button';
import { AdminSearchForm } from '@/components/admin/admin-search-form';
import { DeleteRegistrationButton } from '@/components/admin/delete-registration-button';
import { Button } from '@/components/ui/button';
import { listAdminRegistrations } from '@/lib/admin';

export const dynamic = 'force-dynamic';

type AdminDashboardPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

function formatRegisteredAt(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Yerevan',
  }).format(date);
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? '';
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);

  const data = await listAdminRegistrations({ page, search: query || undefined });
  const totalPages = Math.max(1, Math.ceil(data.filteredCount / data.pageSize));
  const exportHref = query
    ? `/api/admin/registrations/export?q=${encodeURIComponent(query)}`
    : '/api/admin/registrations/export';

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border bg-background p-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Registrations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.event ? data.event.name : 'No active event'}
          </p>
          <p className="mt-3 text-sm text-foreground">
            Total registrations: <span className="font-semibold">{data.totalCount}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Times shown in Asia/Yerevan (UTC+4).</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="secondary" size="sm">
            <a href={exportHref}>Export CSV</a>
          </Button>
          <AdminLogoutButton />
        </div>
      </header>

      <section className="rounded-lg border border-border bg-background p-6">
        <AdminSearchForm initialQuery={query} />
        {query ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Showing {data.filteredCount} match{data.filteredCount === 1 ? '' : 'es'} for &ldquo;{query}
            &rdquo;
          </p>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-background">
        {!data.event ? (
          <p className="p-6 text-sm text-muted-foreground">No active event is configured.</p>
        ) : data.rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            {query ? 'No registrations match this search.' : 'No registrations yet.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Registered</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Locale</th>
                  <th className="px-4 py-3 font-medium">Email status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-4 py-3">{formatRegisteredAt(row.createdAt)}</td>
                    <td className="px-4 py-3">
                      {row.firstName} {row.lastName}
                    </td>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3">{row.phone}</td>
                    <td className="px-4 py-3 uppercase">{row.locale}</td>
                    <td className="px-4 py-3">{row.emailDeliveryStatus}</td>
                    <td className="px-4 py-3">
                      <DeleteRegistrationButton
                        registrationId={row.id}
                        label={`${row.firstName} ${row.lastName} (${row.email})`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data.event && data.filteredCount > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              Page {data.page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {data.page > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={`/admin?${new URLSearchParams({
                      ...(query ? { q: query } : {}),
                      page: String(data.page - 1),
                    }).toString()}`}
                  >
                    Previous
                  </Link>
                </Button>
              ) : null}
              {data.page < totalPages ? (
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={`/admin?${new URLSearchParams({
                      ...(query ? { q: query } : {}),
                      page: String(data.page + 1),
                    }).toString()}`}
                  >
                    Next
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
