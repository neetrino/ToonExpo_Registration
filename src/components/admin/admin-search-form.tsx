import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { buildAdminHref } from '@/lib/admin/admin-url';
import { cn } from '@/lib/utils';

type AdminSearchFormProps = {
  initialQuery: string;
  variant?: 'default' | 'toolbar';
  className?: string;
};

export function AdminSearchForm({
  initialQuery,
  variant = 'default',
  className,
}: AdminSearchFormProps) {
  const isToolbar = variant === 'toolbar';

  if (isToolbar) {
    return (
      <form
        method="get"
        action="/admin"
        className={cn('flex w-full min-w-0 items-center gap-2', className)}
      >
        <div className="relative min-w-0 flex-1">
          <Input
            id="admin-search"
            name="q"
            type="search"
            defaultValue={initialQuery}
            placeholder="Name, email, or phone"
            maxLength={100}
            aria-label="Search registrations"
            className="h-11 rounded-xl border-border/80 bg-background pr-[5.25rem] shadow-sm sm:h-10"
          />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            className="absolute top-1/2 right-1 h-9 -translate-y-1/2 rounded-lg px-3 sm:h-8"
          >
            Search
          </Button>
        </div>
        {initialQuery ? (
          <Button type="button" variant="ghost" size="sm" asChild className="min-h-10 shrink-0">
            <Link href={buildAdminHref()}>Clear</Link>
          </Button>
        ) : null}
      </form>
    );
  }

  return (
    <form
      method="get"
      action="/admin"
      className={cn('flex w-full flex-col gap-3 sm:flex-row sm:items-end', className)}
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <label
          htmlFor="admin-search"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Search
        </label>
        <Input
          id="admin-search"
          name="q"
          type="search"
          defaultValue={initialQuery}
          placeholder="Name, email, or phone"
          maxLength={100}
          className="rounded-xl"
        />
      </div>
      <div className="flex shrink-0 gap-2">
        <Button type="submit" variant="secondary" size="sm">
          Search
        </Button>
        {initialQuery ? (
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link href={buildAdminHref()}>Clear</Link>
          </Button>
        ) : null}
      </div>
    </form>
  );
}
