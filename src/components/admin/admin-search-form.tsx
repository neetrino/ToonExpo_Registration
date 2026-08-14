'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ADMIN_SEARCH_DEBOUNCE_MS, ADMIN_SEARCH_MAX_LENGTH } from '@/lib/admin/constants';
import { buildAdminSearchHref, normalizeAdminSearchQuery } from '@/lib/admin/search-query';
import { cn } from '@/lib/utils';

const SEARCH_DEBOUNCE_MS = 300;

type AdminSearchFormProps = {
  initialQuery: string;
  variant?: 'default' | 'toolbar';
  className?: string;
};

function normalizeQuery(value: string): string {
  return value.trim().slice(0, ADMIN_SEARCH_MAX_LENGTH);
}

export function AdminSearchForm({
  initialQuery,
  variant = 'default',
  className,
}: AdminSearchFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(initialQuery);
  const committedQuery = useRef(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isToolbar = variant === 'toolbar';

  const applySearch = (rawValue: string) => {
    const nextQuery = normalizeAdminSearchQuery(rawValue) ?? '';
    if (nextQuery === committedQuery.current) {
      return;
    }

    committedQuery.current = nextQuery;
    startTransition(() => {
      router.replace(buildAdminSearchHref(rawValue));
    });
  };

  useEffect(() => {
    if (initialQuery === committedQuery.current) {
      return;
    }

    committedQuery.current = initialQuery;
    setValue(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const scheduleSearch = (nextValue: string) => {
    setValue(nextValue);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      applySearch(nextValue);
    }, ADMIN_SEARCH_DEBOUNCE_MS);
  };

  const flushSearch = (nextValue: string = value) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    applySearch(nextValue);
  };

  const input = (
    <Input
      id="admin-search"
      name="q"
      type="search"
      value={value}
      placeholder="Name, email, or phone"
      maxLength={ADMIN_SEARCH_MAX_LENGTH}
      aria-label="Search registrations"
      aria-busy={isPending || undefined}
      onChange={(event) => scheduleSearch(event.target.value)}
      className={cn(
        isToolbar
          ? 'h-11 rounded-xl border-border/80 bg-background shadow-sm sm:h-10'
          : 'rounded-xl',
      )}
    />
  );

  const clearControl =
    value || initialQuery ? (
      <Button type="button" variant="ghost" size="sm" asChild className="min-h-10 shrink-0">
        <Link href={buildAdminSearchHref('')}>Clear</Link>
      </Button>
    ) : null;

  return (
    <form
      method="get"
      action="/admin"
      className={cn(
        isToolbar
          ? 'flex w-full min-w-0 items-center gap-2'
          : 'flex w-full flex-col gap-3 sm:flex-row sm:items-end',
        className,
      )}
      onSubmit={(event) => {
        event.preventDefault();
        flushSearch();
      }}
    >
      {isToolbar ? (
        <div className="relative min-w-0 flex-1">{input}</div>
      ) : (
        <div className="min-w-0 flex-1 space-y-1.5">
          <label
            htmlFor="admin-search"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Search
          </label>
          {input}
        </div>
      )}
      {isToolbar ? clearControl : <div className="flex shrink-0 gap-2">{clearControl}</div>}
    </form>
  );
}
