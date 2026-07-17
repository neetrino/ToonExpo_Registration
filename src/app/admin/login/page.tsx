import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLoginPage() {
  return (
    <section className="mx-auto max-w-md rounded-lg border border-border bg-background p-6">
      <h1 className="text-2xl font-bold text-primary">Admin login</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {/* TODO: Implement Auth.js credentials flow in a later phase. */}
        Placeholder shell — authentication is not wired yet.
      </p>

      <form className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-email">Email</Label>
          <Input id="admin-email" type="email" autoComplete="username" disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Password</Label>
          <Input id="admin-password" type="password" autoComplete="current-password" disabled />
        </div>
        <Button type="button" disabled>
          Sign in
        </Button>
      </form>
    </section>
  );
}
