import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { buildAdminHref } from '@/lib/admin/admin-url';

type AdminSearchFormProps = {
  initialQuery: string;
};

export function AdminSearchForm({ initialQuery }: AdminSearchFormProps) {
  return (
    <form method="get" action="/admin" className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1 space-y-1.5">
        <label htmlFor="admin-search" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Search
        </label>
        <Input
          id="admin-search"
          name="q"
          type="search"
          defaultValue={initialQuery}
          placeholder="Name, email, or phone"
          maxLength={100}
        />
      </div>
      <div className="flex shrink-0 gap-2">
        <Button type="submit" variant="secondary">
          Search
        </Button>
        {initialQuery ? (
          <Button type="button" variant="ghost" asChild>
            <Link href={buildAdminHref()}>Clear</Link>
          </Button>
        ) : null}
      </div>
    </form>
  );
}
