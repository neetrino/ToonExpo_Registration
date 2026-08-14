'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type MouseEvent } from 'react';
import { resendTicketAction } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SendQrButtonProps = {
  registrationId: string;
  compact?: boolean;
};

export function SendQrButton({ registrationId, compact = false }: SendQrButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function onSend(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();
    setError(null);
    startTransition(async () => {
      const result = await resendTicketAction(registrationId);
      if (!result.ok) {
        setError(result.error);
        setSent(false);
        return;
      }
      setSent(true);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={onSend}
        onKeyDown={(event) => event.stopPropagation()}
        className={cn(compact ? 'h-8 px-2.5 text-xs' : 'min-h-10')}
      >
        {pending ? 'Sending…' : sent ? 'Sent' : 'Send QR'}
      </Button>
      {error ? <p className="max-w-[10rem] text-[11px] text-destructive">{error}</p> : null}
    </div>
  );
}
