import Link from 'next/link';
import type { ReactNode } from 'react';
import { getAdminPageItems, type AdminPageItem } from '@/lib/admin/pagination';
import { cn } from '@/lib/utils';

type AdminListPaginationProps = {
  from: number;
  to: number;
  total: number;
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
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

function PageNumber({ page, href, current }: { page: number; href: string; current: boolean }) {
  const className = cn(
    'inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full px-2 text-xs font-semibold tabular-nums',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    current ? 'bg-primary text-primary-foreground' : 'text-primary hover:bg-primary/10',
  );

  if (current) {
    return (
      <span className={className} aria-current="page">
        {page}
      </span>
    );
  }

  return (
    <Link href={href} aria-label={`Page ${page}`} className={className}>
      {page}
    </Link>
  );
}

function PageEllipsis() {
  return (
    <span
      className="inline-flex h-9 w-7 shrink-0 items-center justify-center text-sm text-muted-foreground"
      aria-hidden="true"
    >
      …
    </span>
  );
}

function PageListItem({
  item,
  page,
  hrefForPage,
}: {
  item: AdminPageItem;
  page: number;
  hrefForPage: (page: number) => string;
}) {
  if (item === 'ellipsis') {
    return <PageEllipsis />;
  }

  return <PageNumber page={item} href={hrefForPage(item)} current={item === page} />;
}

export function AdminListPagination({
  from,
  to,
  total,
  page,
  totalPages,
  hrefForPage,
}: AdminListPaginationProps) {
  const items = getAdminPageItems(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-center gap-3 border-t border-border/70 bg-muted/40 px-4 py-5 sm:px-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Showing {from}–{to} of {total}
      </p>

      <nav
        className="flex max-w-full flex-wrap items-center justify-center gap-0.5 rounded-[1.75rem] border border-border bg-background p-0.5 shadow-sm"
        aria-label="Pagination"
      >
        <PageControl href={hrefForPage(page - 1)} enabled={page > 1} label="Previous page">
          <ChevronLeftIcon />
        </PageControl>

        {items.map((item, index) => (
          <PageListItem
            key={item === 'ellipsis' ? `ellipsis-${index}` : item}
            item={item}
            page={page}
            hrefForPage={hrefForPage}
          />
        ))}

        <PageControl href={hrefForPage(page + 1)} enabled={page < totalPages} label="Next page">
          <ChevronRightIcon />
        </PageControl>
      </nav>
    </div>
  );
}
