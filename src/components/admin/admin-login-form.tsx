'use client';

import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { loginAdminAction, type LoginActionResult } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: LoginActionResult | null = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </Button>
  );
}

async function loginFormAction(
  _prev: LoginActionResult | null,
  formData: FormData,
): Promise<LoginActionResult> {
  return loginAdminAction(formData);
}

export function AdminLoginForm() {
  const [state, formAction] = useActionState(loginFormAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="admin-email">Email</Label>
        <Input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          className="bg-background"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="admin-password">Password</Label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
          className="bg-background"
        />
      </div>
      {state && !state.ok ? (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </div>
      ) : null}
      <SubmitButton />
    </form>
  );
}
