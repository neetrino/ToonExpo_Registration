import { logoutAdminAction } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AdminLogoutButtonProps = {
  variant?: 'default' | 'inverse';
};

function LogoutIcon() {
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
      <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function AdminLogoutButton({ variant = 'default' }: AdminLogoutButtonProps) {
  const isInverse = variant === 'inverse';

  return (
    <form action={logoutAdminAction}>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className={cn(
          'h-10 shrink-0 gap-2 rounded-full px-4 font-semibold tracking-wide',
          isInverse
            ? 'border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white hover:text-primary focus-visible:ring-highlight focus-visible:ring-offset-primary'
            : 'text-foreground',
        )}
      >
        <LogoutIcon />
        Log out
      </Button>
    </form>
  );
}
