import { logoutAdminAction } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';

export function AdminLogoutButton() {
  return (
    <form action={logoutAdminAction}>
      <Button type="submit" variant="outline" size="sm">
        Log out
      </Button>
    </form>
  );
}
