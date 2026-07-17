'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type MouseEvent, type ReactElement } from 'react';
import { deleteRegistrationAction } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DeleteRegistrationButtonProps = {
  registrationId: string;
  label: string;
  /** When set, navigate here after a successful delete instead of refreshing. */
  redirectTo?: string;
  /** Compact trash icon for list rows and sheet header. */
  iconOnly?: boolean;
};

function TrashIcon(): ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

function stopRowClick(event: MouseEvent<HTMLElement>): void {
  event.stopPropagation();
}

export function DeleteRegistrationButton({
  registrationId,
  label,
  redirectTo,
  iconOnly = false,
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

  function onCancel(): void {
    setConfirmOpen(false);
    setError(null);
  }

  if (iconOnly) {
    return (
      <div className="relative inline-flex" onClick={stopRowClick}>
        <button
          type="button"
          aria-label={`Delete ${label}`}
          aria-expanded={confirmOpen}
          disabled={pending}
          onClick={() => setConfirmOpen(true)}
          className={cn(
            'inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors',
            'hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          <TrashIcon />
        </button>

        {confirmOpen ? (
          <div
            role="dialog"
            aria-label="Confirm delete"
            className="absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border border-border bg-background p-3 shadow-lg"
          >
            <p className="text-xs leading-relaxed text-muted-foreground">
              Delete <span className="font-medium text-foreground">{label}</span>? This cannot be
              undone.
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" disabled={pending} onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={pending}
                onClick={onConfirm}
              >
                {pending ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
            {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
          </div>
        ) : null}
      </div>
    );
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
        <Button type="button" variant="outline" size="sm" disabled={pending} onClick={onCancel}>
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
