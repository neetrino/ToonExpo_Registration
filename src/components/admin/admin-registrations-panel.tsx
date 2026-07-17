'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminRegistrationsList } from '@/components/admin/admin-registrations-list';
import { RegistrationDetailSheet } from '@/components/admin/registration-detail-sheet';
import { buildAdminHref } from '@/lib/admin/admin-url';
import type { AdminRegistrationDetail } from '@/lib/admin/get-registration';
import type { AdminRegistrationRow } from '@/lib/admin/list-registrations';

type EventSummary = { id: string; name: string; slug: string };

type AdminRegistrationsPanelProps = {
  rows: AdminRegistrationRow[];
  event: EventSummary;
  query: string;
  page: number;
  initialView: AdminRegistrationDetail | null;
};

function asDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function toDetail(row: AdminRegistrationRow, event: EventSummary): AdminRegistrationDetail {
  return {
    id: row.id,
    createdAt: asDate(row.createdAt),
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    locale: row.locale,
    emailDeliveryStatus: row.emailDeliveryStatus,
    formVersion: row.formVersion,
    answers: row.answers,
    consentAcceptedAt: asDate(row.consentAcceptedAt),
    privacyPolicyVersion: row.privacyPolicyVersion,
    event,
  };
}

function readViewIdFromUrl(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const view = new URLSearchParams(window.location.search).get('view')?.trim();
  return view || undefined;
}

/**
 * List + detail sheet with instant client-side open (no full page RSC reload).
 */
export function AdminRegistrationsPanel({
  rows,
  event,
  query,
  page,
  initialView,
}: AdminRegistrationsPanelProps) {
  const [view, setView] = useState<AdminRegistrationDetail | null>(initialView);
  const [prevInitialView, setPrevInitialView] = useState(initialView);
  const closeHref = buildAdminHref({ q: query || undefined, page });

  if (initialView !== prevInitialView) {
    setPrevInitialView(initialView);
    setView(initialView);
  }

  const openRegistration = useCallback(
    (row: AdminRegistrationRow) => {
      const detail = toDetail(row, event);
      setView(detail);
      window.history.pushState(
        { view: row.id },
        '',
        buildAdminHref({ q: query || undefined, page, view: row.id }),
      );
    },
    [event, page, query],
  );

  const closeRegistration = useCallback(() => {
    setView(null);
    window.history.pushState({ view: null }, '', closeHref);
  }, [closeHref]);

  useEffect(() => {
    function onPopState(): void {
      const viewId = readViewIdFromUrl();
      if (!viewId) {
        setView(null);
        return;
      }

      const row = rows.find((entry) => entry.id === viewId);
      if (row) {
        setView(toDetail(row, event));
        return;
      }

      if (initialView?.id === viewId) {
        setView(initialView);
        return;
      }

      setView(null);
    }

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [event, initialView, rows]);

  return (
    <>
      <AdminRegistrationsList rows={rows} onOpen={openRegistration} />
      {view ? (
        <RegistrationDetailSheet
          registration={view}
          closeHref={closeHref}
          onClose={closeRegistration}
        />
      ) : null}
    </>
  );
}
