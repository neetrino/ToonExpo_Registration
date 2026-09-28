import Link from 'next/link';
import {
  adminListFilterLabel,
  buildAdminHref,
  toggleAdminListFilter,
  ADMIN_LIST_FILTERS,
  type AdminListFilter,
} from '@/lib/admin/admin-url';
import { cn } from '@/lib/utils';

const FILTERS: ReadonlyArray<{ id: AdminListFilter | undefined; label: string }> = [
  { id: undefined, label: 'All' },
  ...ADMIN_LIST_FILTERS.map((id) => ({ id, label: adminListFilterLabel(id) })),
];

type AdminChannelFilterProps = {
  selected: readonly AdminListFilter[];
  query?: string;
};

export function AdminChannelFilter({ selected, query }: AdminChannelFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Registration filter">
      {FILTERS.map((item) => {
        const active = item.id ? selected.includes(item.id) : selected.length === 0;
        const channels = item.id ? toggleAdminListFilter(selected, item.id) : [];
        return (
          <Link
            key={item.label}
            href={buildAdminHref({ q: query, channels })}
            aria-pressed={active}
            className={cn(
              'inline-flex rounded-full px-3 py-1.5 text-xs font-medium tracking-wide',
              active
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
