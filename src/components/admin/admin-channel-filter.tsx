'use client';

import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  return (
    <div
      className="flex scroll-mt-24 flex-wrap gap-2 [overflow-anchor:none]"
      role="group"
      aria-label="Registration filter"
    >
      {FILTERS.map((item) => {
        const active = item.id ? selected.includes(item.id) : selected.length === 0;
        const channels = item.id ? toggleAdminListFilter(selected, item.id) : [];
        const href = buildAdminHref({ q: query, channels });
        return (
          <button
            key={item.label}
            type="button"
            aria-pressed={active}
            onClick={() => {
              if (!item.id && selected.length === 0) {
                return;
              }
              router.push(href, { scroll: false });
            }}
            className={cn(
              'inline-flex cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium tracking-wide',
              active
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
