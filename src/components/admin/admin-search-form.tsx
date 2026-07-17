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

  return (
    <form
      method="get"
      action="/admin"
      className={cn(
        'flex w-full flex-col gap-3 sm:flex-row sm:items-center',
        isToolbar ? 'sm:max-w-md' : 'sm:items-end',
        className,
      )}
    >
      <div className={cn('min-w-0 flex-1', isToolbar ? 'space-y-0' : 'space-y-1.5')}>
        {!isToolbar ? (
          <label
            htmlFor="admin-search"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Search
          </label>
        ) : null}
        <Input
          id="admin-search"
          name="q"
          type="search"
          defaultValue={initialQuery}
          placeholder="Name, email, or phone"
          maxLength={100}
          aria-label={isToolbar ? 'Search registrations' : undefined}
          className={cn(isToolbar && 'h-10 border-border/80 bg-background shadow-sm')}
        />
      </div>
      <div className="flex shrink-0 gap-2">
        <Button type="submit" variant={isToolbar ? 'outline' : 'secondary'} size="sm">
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
