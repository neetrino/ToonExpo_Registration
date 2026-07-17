'use client';

import { useRouter } from 'next/navigation';
import { buildAdminHref } from '@/lib/admin/admin-url';
import type { AdminRegistrationRow } from '@/lib/admin/list-registrations';
import { cn } from '@/lib/utils';

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
      return 'bg-accent/10 text-secondary';
    case 'FAILED':
      return 'bg-destructive/10 text-destructive';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function EmailStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide',
        emailStatusClass(status),
      )}
    >
      {status}
    </span>
  );
}

export function AdminRegistrationsList({ rows, query, page }: AdminRegistrationsListProps) {
  const router = useRouter();

  function openRegistration(id: string): void {
    router.push(buildAdminHref({ q: query || undefined, page, view: id }));
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/80">
              <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Registered
              </th>
              <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Name
              </th>
              <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Email
              </th>
              <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Phone
              </th>
              <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Locale
              </th>
              <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Email status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => openRegistration(row.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openRegistration(row.id);
                  }
                }}
                tabIndex={0}
                className="cursor-pointer transition-colors hover:bg-accent/[0.07] focus-visible:bg-accent/[0.07] focus-visible:outline-none"
              >
                <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                  {formatRegisteredAt(row.createdAt)}
                </td>
                <td className="px-5 py-4 font-medium text-foreground">
                  {row.firstName} {row.lastName}
                </td>
                <td className="px-5 py-4 text-foreground">{row.email}</td>
                <td className="px-5 py-4 text-foreground">{row.phone}</td>
                <td className="px-5 py-4 uppercase text-muted-foreground">{row.locale}</td>
                <td className="px-5 py-4">
                  <EmailStatusBadge status={row.emailDeliveryStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border/60 md:hidden">
        {rows.map((row) => (
          <article
            key={row.id}
            onClick={() => openRegistration(row.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openRegistration(row.id);
              }
            }}
            tabIndex={0}
            className="cursor-pointer px-4 py-5 transition-colors hover:bg-accent/[0.07] focus-visible:bg-accent/[0.1] focus-visible:outline-none active:bg-accent/[0.1]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">
                  {row.firstName} {row.lastName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatRegisteredAt(row.createdAt)}
                </p>
              </div>
              <EmailStatusBadge status={row.emailDeliveryStatus} />
            </div>
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Email
                </dt>
                <dd className="mt-0.5 text-foreground">{row.email}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Phone
                </dt>
                <dd className="mt-0.5 text-foreground">{row.phone}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Locale
                </dt>
                <dd className="mt-0.5 uppercase text-foreground">{row.locale}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
