import type { ReactNode } from 'react';

type ColumnIconName =
  | 'registered'
  | 'name'
  | 'source'
  | 'ticket'
  | 'email'
  | 'phone'
  | 'emailStatus'
  | 'sendQr';

const iconClassName = 'size-3.5 shrink-0 text-secondary';

function IconFrame({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={iconClassName}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function AdminListColumnIcon({ name }: { name: ColumnIconName }) {
  switch (name) {
    case 'registered':
      return (
        <IconFrame>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18" />
          <path d="M8 3v4" />
          <path d="M16 3v4" />
        </IconFrame>
      );
    case 'name':
      return (
        <IconFrame>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 19.5c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5" />
        </IconFrame>
      );
    case 'source':
      return (
        <IconFrame>
          <path d="M4 20V9l8-5 8 5v11" />
          <path d="M9 20v-6h6v6" />
        </IconFrame>
      );
    case 'ticket':
      return (
        <IconFrame>
          <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
          <path d="M12 8v8" />
        </IconFrame>
      );
    case 'email':
      return (
        <IconFrame>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </IconFrame>
      );
    case 'phone':
      return (
        <IconFrame>
          <path d="M8 3h3l1 4-2 1a12 12 0 0 0 6 6l1-2 4 1v3a2 2 0 0 1-2 2A16 16 0 0 1 4 7a2 2 0 0 1 2-2z" />
        </IconFrame>
      );
    case 'emailStatus':
      return (
        <IconFrame>
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12.5 2.5 2.5 4.5-5" />
        </IconFrame>
      );
    case 'sendQr':
      return (
        <IconFrame>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <path d="M14 14h2v2h-2z" />
          <path d="M18 14h2" />
          <path d="M14 18h2" />
          <path d="M18 18h2v2" />
        </IconFrame>
      );
    default:
      return null;
  }
}

type AdminListColumnHeaderProps = {
  icon: ColumnIconName;
  children: ReactNode;
};

export function AdminListColumnHeader({ icon, children }: AdminListColumnHeaderProps) {
  return (
    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <AdminListColumnIcon name={icon} />
        {children}
      </span>
    </th>
  );
}
