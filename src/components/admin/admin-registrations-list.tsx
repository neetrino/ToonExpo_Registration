import Link from 'next/link';
import { DeleteRegistrationButton } from '@/components/admin/delete-registration-button';
import { Button } from '@/components/ui/button';
import { buildAdminHref } from '@/lib/admin/admin-url';
import type { AdminRegistrationRow } from '@/lib/admin/list-registrations';

type AdminRegistrationsListProps = {
  rows: AdminRegistrationRow[];
  query: string;
  page: number;
};

function formatRegisteredAt(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Yerevan',
  }).format(date);
}

function emailStatusClass(status: string): string {
  switch (status) {
    case 'SENT':
      return 'bg-secondary/10 text-secondary';
    case 'FAILED':
      return 'bg-destructive/10 text-destructive';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function EmailStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${emailStatusClass(status)}`}
    >
      {status}
    </span>
  );
}

function ViewButton({ id, query, page }: { id: string; query: string; page: number }) {
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={buildAdminHref({ q: query || undefined, page, view: id })}>View</Link>
    </Button>
  );
}

export function AdminRegistrationsList({ rows, query, page }: AdminRegistrationsListProps) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/60">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Registered
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Phone
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Locale
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Email status
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => {
              const label = `${row.firstName} ${row.lastName} (${row.email})`;

              return (
                <tr key={row.id} className="transition-colors hover:bg-muted/40">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatRegisteredAt(row.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.firstName} {row.lastName}
                  </td>
                  <td className="px-4 py-3 text-foreground">{row.email}</td>
                  <td className="px-4 py-3 text-foreground">{row.phone}</td>
                  <td className="px-4 py-3 uppercase text-muted-foreground">{row.locale}</td>
                  <td className="px-4 py-3">
                    <EmailStatusBadge status={row.emailDeliveryStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <ViewButton id={row.id} query={query} page={page} />
                      <DeleteRegistrationButton registrationId={row.id} label={label} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border md:hidden">
        {rows.map((row) => {
          const label = `${row.firstName} ${row.lastName} (${row.email})`;

          return (
            <article key={row.id} className="space-y-3 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">
                    {row.firstName} {row.lastName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatRegisteredAt(row.createdAt)}
                  </p>
                </div>
                <EmailStatusBadge status={row.emailDeliveryStatus} />
              </div>
              <dl className="grid gap-2 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Email</dt>
                  <dd className="text-foreground">{row.email}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Phone</dt>
                  <dd className="text-foreground">{row.phone}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Locale</dt>
                  <dd className="uppercase text-foreground">{row.locale}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2 pt-1">
                <ViewButton id={row.id} query={query} page={page} />
                <DeleteRegistrationButton registrationId={row.id} label={label} />
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
