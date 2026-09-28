import Link from 'next/link';
import { buildAdminHref, type AdminListFilter } from '@/lib/admin/admin-url';
import { cn } from '@/lib/utils';

const FILTERS: ReadonlyArray<{ id: AdminListFilter | undefined; label: string }> = [
  { id: undefined, label: 'All' },
  { id: 'GENERAL', label: 'General' },
  { id: 'SPYURK_RF', label: 'Spyurk RF' },
  { id: 'MOOTQ', label: 'Mootq' },
];

type AdminChannelFilterProps = {
  current?: AdminListFilter;
  query?: string;
};

export function AdminChannelFilter({ current, query }: AdminChannelFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Registration filter">
      {FILTERS.map((item) => {
        const active = current === item.id;
        return (
          <Link
            key={item.label}
            href={buildAdminHref({ q: query, channel: item.id })}
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
