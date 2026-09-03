import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AdminListPaginationProps = {
  from: number;
  to: number;
  total: number;
  page: number;
  totalPages: number;
  prevHref: string;
  nextHref: string;
};

function ChevronLeftIcon() {
  return (
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function PageControl({
  href,
  enabled,
  label,
  children,
}: {
  href: string;
  enabled: boolean;
  label: string;
  children: ReactNode;
}) {
  const className = cn(
    'inline-flex size-9 items-center justify-center rounded-full transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    enabled ? 'text-primary hover:bg-primary/10' : 'cursor-not-allowed text-muted-foreground/35',
  );

  if (!enabled) {
    return (
      <span className={className} aria-disabled="true" aria-label={label}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} aria-label={label} className={className}>
      {children}
    </Link>
  );
}

export function AdminListPagination({
  from,
  to,
  total,
  page,
  totalPages,
  prevHref,
  nextHref,
}: AdminListPaginationProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 border-t border-border/70 bg-muted/40 px-4 py-5 sm:px-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Showing {from}–{to} of {total}
      </p>

      <div
        className="inline-flex items-center gap-0.5 rounded-full border border-border bg-background p-0.5 shadow-sm"
        role="navigation"
        aria-label="Pagination"
      >
        <PageControl href={prevHref} enabled={page > 1} label="Previous page">
          <ChevronLeftIcon />
        </PageControl>

        <span className="min-w-[3.75rem] rounded-full bg-primary px-3.5 py-1.5 text-center text-xs font-semibold tabular-nums tracking-wide text-primary-foreground">
          {page} / {totalPages}
        </span>

        <PageControl href={nextHref} enabled={page < totalPages} label="Next page">
          <ChevronRightIcon />
        </PageControl>
      </div>
    </div>
  );
}
