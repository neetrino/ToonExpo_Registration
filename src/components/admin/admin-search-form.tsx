import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AdminSearchFormProps = {
  initialQuery: string;
};

export function AdminSearchForm({ initialQuery }: AdminSearchFormProps) {
  return (
    <form method="get" action="/admin" className="flex flex-wrap items-end gap-3">
      <div className="min-w-[16rem] flex-1 space-y-1">
        <label htmlFor="admin-search" className="text-sm font-medium text-foreground">
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
      <Button type="submit" variant="secondary">
        Search
      </Button>
      {initialQuery ? (
        <Button type="button" variant="ghost" asChild>
          <Link href="/admin">Clear</Link>
        </Button>
      ) : null}
    </form>
  );
}
