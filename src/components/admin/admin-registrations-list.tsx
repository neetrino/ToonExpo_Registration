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

function formatRegisteredAtShort(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Yerevan',
  }).format(date);
}

function emailStatusClass(status: string): string {
  switch (status) {
    case 'SENT':
      return 'bg-success/10 text-success';
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

function initials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || '?';
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 text-muted-foreground/70"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
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
            <tr className="border-b border-border/80 bg-muted/40">
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
              <th className="w-10 px-3 py-3.5" aria-hidden="true" />
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
                className="group cursor-pointer transition-colors hover:bg-accent/[0.07] focus-visible:bg-accent/[0.07] focus-visible:outline-none"
              >
                <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                  {formatRegisteredAt(row.createdAt)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-xs font-bold text-primary"
                      aria-hidden="true"
                    >
                      {initials(row.firstName, row.lastName)}
                    </span>
                    <span className="font-medium text-foreground">
                      {row.firstName} {row.lastName}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 text-foreground">{row.email}</td>
                <td className="px-5 py-4 text-foreground">{row.phone}</td>
                <td className="px-5 py-4 uppercase text-muted-foreground">{row.locale}</td>
                <td className="px-5 py-4">
                  <EmailStatusBadge status={row.emailDeliveryStatus} />
                </td>
                <td className="px-3 py-4">
                  <span className="inline-flex opacity-40 transition-opacity group-hover:opacity-100">
                    <ChevronIcon />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border/60 md:hidden">
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => openRegistration(row.id)}
            className="flex w-full min-h-[4.5rem] items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-accent/[0.07] focus-visible:bg-accent/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:bg-accent/[0.1]"
          >
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary"
              aria-hidden="true"
            >
              {initials(row.firstName, row.lastName)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-2">
                <span className="truncate font-medium text-foreground">
                  {row.firstName} {row.lastName}
                </span>
                <EmailStatusBadge status={row.emailDeliveryStatus} />
              </span>
              <span className="mt-1 block truncate text-sm text-muted-foreground">{row.email}</span>
              <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                <span>{row.phone}</span>
                <span aria-hidden="true">·</span>
                <span className="uppercase">{row.locale}</span>
                <span aria-hidden="true">·</span>
                <span>{formatRegisteredAtShort(row.createdAt)}</span>
              </span>
            </span>
            <ChevronIcon />
          </button>
        ))}
      </div>
    </>
  );
}
