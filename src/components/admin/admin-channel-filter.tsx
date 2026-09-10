import Link from 'next/link';
import { buildAdminHref, type AdminFormChannelFilter } from '@/lib/admin/admin-url';
import { cn } from '@/lib/utils';

const CHANNELS: ReadonlyArray<{ id: AdminFormChannelFilter | undefined; label: string }> = [
  { id: undefined, label: 'All' },
  { id: 'GENERAL', label: 'General' },
  { id: 'SPYURK_RF', label: 'Spyurk RF' },
];

type AdminChannelFilterProps = {
  current?: AdminFormChannelFilter;
  query?: string;
};

export function AdminChannelFilter({ current, query }: AdminChannelFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Form channel">
      {CHANNELS.map((item) => {
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
