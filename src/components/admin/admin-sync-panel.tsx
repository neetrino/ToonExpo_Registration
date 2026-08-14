'use client';

import { useState, useTransition } from 'react';
import { importFullDataFromMootqAction } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import type { AdminSyncRunRow } from '@/lib/admin/list-sync-runs';

type AdminSyncPanelProps = {
  runs: AdminSyncRunRow[];
};

function formatWhen(date: Date | string): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Yerevan',
  }).format(new Date(date));
}

/**
 * Full-sync operations: import trigger + recent run history.
 */
export function AdminSyncPanel({ runs }: AdminSyncPanelProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onImport(): void {
    const confirmed = window.confirm(
      'Import full data from Mootq? This requires partner export credentials and may take a while.',
    );
    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      setMessage(null);
      const result = await importFullDataFromMootqAction();
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setMessage(
        `Import finished: ${result.status} (run ${result.runId}). Refresh to see history.`,
      );
    });
  }

  return (
    <section className="rounded-2xl border border-border/80 bg-background p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 7h16" />
              <path d="M4 12h10" />
              <path d="M4 17h16" />
              <path d="M16 10l4 2-4 2" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Full sync
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-primary">
              Mootq reconciliation
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Manual import pulls partner pages when configured. Export is started by Mootq against
              our API.
            </p>
          </div>
        </div>
        <Button type="button" onClick={onImport} disabled={isPending} className="shrink-0">
          {isPending ? 'Importing…' : 'Import full data from Mootq'}
        </Button>
      </div>

      {message ? <p className="mt-4 text-sm text-muted-foreground">{message}</p> : null}

      <div className="mt-5">
        {runs.length === 0 ? (
          <p className="rounded-full border border-dashed border-border bg-muted/50 px-4 py-2.5 text-center text-sm text-muted-foreground">
            No sync runs yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40">
                  <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Started
                  </th>
                  <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Direction
                  </th>
                  <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Status
                  </th>
                  <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Counts
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {runs.map((run) => (
                  <tr key={run.id}>
                    <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                      {formatWhen(run.startedAt)}
                    </td>
                    <td className="px-3 py-3 font-medium text-foreground">{run.direction}</td>
                    <td className="px-3 py-3 text-foreground">{run.status}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      read {run.readCount} · created {run.createdCount} · updated {run.updatedCount}{' '}
                      · skipped {run.skippedCount} · conflict {run.conflictCount} · error{' '}
                      {run.errorCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
