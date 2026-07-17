'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { deleteRegistrationAction } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DeleteRegistrationButtonProps = {
  registrationId: string;
  label: string;
  /** When set, navigate here after a successful delete instead of refreshing. */
  redirectTo?: string;
  /** Compact trash icon trigger (sheet header). */
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

export function DeleteRegistrationButton({
  registrationId,
  label,
  redirectTo,
  iconOnly = false,
}: DeleteRegistrationButtonProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!confirmOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setConfirmOpen(false);
        setError(null);
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [confirmOpen]);

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

  const dialog =
    confirmOpen && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Close delete confirmation"
              className="absolute inset-0 bg-[#00303D]/50"
              onClick={onCancel}
            />
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-registration-title"
              aria-describedby="delete-registration-description"
              className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-xl"
            >
              <h2
                id="delete-registration-title"
                className="font-display text-lg font-bold text-primary"
              >
                Delete registration?
              </h2>
              <p
                id="delete-registration-description"
                className="mt-2 text-sm leading-relaxed text-muted-foreground"
              >
                Delete <span className="font-medium text-foreground">{label}</span>? This cannot be
                undone.
              </p>
              <div className="mt-5 flex justify-end gap-2">
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
              {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {iconOnly ? (
        <button
          type="button"
          aria-label={`Delete ${label}`}
          disabled={pending}
          onClick={() => setConfirmOpen(true)}
          className={cn(
            'inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors sm:size-8',
            'hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          <TrashIcon />
        </button>
      ) : (
        <Button type="button" variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
          Delete
        </Button>
      )}
      {dialog}
    </>
  );
}
