'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteRegistrationAction } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';

type DeleteRegistrationButtonProps = {
  registrationId: string;
  label: string;
  /** When set, navigate here after a successful delete instead of refreshing. */
  redirectTo?: string;
};

export function DeleteRegistrationButton({
  registrationId,
  label,
  redirectTo,
}: DeleteRegistrationButtonProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onConfirm(): void {
    setError(null);
    startTransition(async () => {
      const result = await deleteRegistrationAction(registrationId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setConfirmOpen(false);
      if (redirectTo) {
        router.push(redirectTo);
        return;
      }
      router.refresh();
    });
  }

  if (!confirmOpen) {
    return (
      <Button type="button" variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
        Delete
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <p className="max-w-xs text-right text-xs text-muted-foreground">
        Delete <span className="font-medium text-foreground">{label}</span>? This cannot be undone.
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => {
            setConfirmOpen(false);
            setError(null);
          }}
        >
          Cancel
        </Button>
        <Button type="button" variant="destructive" size="sm" disabled={pending} onClick={onConfirm}>
          {pending ? 'Deleting…' : 'Confirm delete'}
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
