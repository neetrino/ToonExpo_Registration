import { logoutAdminAction } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AdminLogoutButtonProps = {
  variant?: 'default' | 'inverse';
};

export function AdminLogoutButton({ variant = 'default' }: AdminLogoutButtonProps) {
  const isInverse = variant === 'inverse';

  return (
    <form action={logoutAdminAction}>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className={cn(
          'min-h-10 shrink-0',
          isInverse &&
            'border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white focus-visible:ring-highlight focus-visible:ring-offset-primary',
        )}
      >
        Log out
      </Button>
    </form>
  );
}
