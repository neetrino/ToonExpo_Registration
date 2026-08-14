import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

export function AdminListPagination({
  from,
  to,
  total,
  page,
  totalPages,
  prevHref,
  nextHref,
}: AdminListPaginationProps) {
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const controlClassName = 'size-9 shrink-0 rounded-full p-0';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 bg-muted/30 px-4 py-3 sm:px-5">
      <p className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-medium tabular-nums text-foreground">
          {from}–{to}
        </span>{' '}
        of <span className="font-medium tabular-nums text-foreground">{total}</span>
      </p>

      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Button asChild variant="outline" size="sm" className={controlClassName}>
            <Link href={prevHref} aria-label="Previous page">
              <ChevronLeftIcon />
            </Link>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={controlClassName}
            disabled
            aria-label="Previous page"
          >
            <ChevronLeftIcon />
          </Button>
        )}

        <span className="min-w-[4.5rem] rounded-full bg-background px-3 py-1.5 text-center text-xs font-medium tabular-nums text-foreground">
          {page} / {totalPages}
        </span>

        {hasNext ? (
          <Button asChild variant="outline" size="sm" className={controlClassName}>
            <Link href={nextHref} aria-label="Next page">
              <ChevronRightIcon />
            </Link>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={controlClassName}
            disabled
            aria-label="Next page"
          >
            <ChevronRightIcon />
          </Button>
        )}
      </div>
    </div>
  );
}
