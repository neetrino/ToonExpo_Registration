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
      setMessage(`Import finished: ${result.status} (run ${result.runId}). Refresh to see history.`);
    });
  }

  return (
    <section className="rounded-2xl border border-border/80 bg-background p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Full sync
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-primary">Mootq reconciliation</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Manual import pulls partner pages when configured. Export is started by Mootq against our
            API.
          </p>
        </div>
        <Button type="button" onClick={onImport} disabled={isPending} className="shrink-0">
          {isPending ? 'Importing…' : 'Import full data from Mootq'}
        </Button>
      </div>

      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}

      <div className="mt-5 overflow-x-auto">
        {runs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sync runs yet.</p>
        ) : (
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
                    read {run.readCount} · created {run.createdCount} · updated {run.updatedCount} ·
                    skipped {run.skippedCount} · conflict {run.conflictCount} · error{' '}
                    {run.errorCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
