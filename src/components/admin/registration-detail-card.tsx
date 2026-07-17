import Link from 'next/link';
import type { ReactNode } from 'react';
import { DeleteRegistrationButton } from '@/components/admin/delete-registration-button';
import { Button } from '@/components/ui/button';
import type { AdminRegistrationDetail } from '@/lib/admin/get-registration';
import { formatRegistrationAnswersForDisplay } from '@/lib/admin/format-answers';

type RegistrationDetailCardProps = {
  registration: AdminRegistrationDetail;
  variant?: 'page' | 'sheet';
  onClose?: () => void;
  closeHref?: string;
  titleId?: string;
  fullName?: string;
};

function formatAdminDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Yerevan',
  }).format(date);
}

function emailStatusTone(status: string): string {
  switch (status) {
    case 'SENT':
      return 'bg-secondary/10 text-secondary';
    case 'FAILED':
      return 'bg-destructive/10 text-destructive';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

function CloseIcon(): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * Admin participant detail card with identity, meta, and localized questionnaire answers.
 */
export function RegistrationDetailCard({
  registration,
  variant = 'page',
  onClose,
  closeHref = '/admin',
  titleId,
  fullName: fullNameProp,
}: RegistrationDetailCardProps) {
  const fullName = fullNameProp ?? `${registration.firstName} ${registration.lastName}`;
  const questionnaire = formatRegistrationAnswersForDisplay(registration.answers);
  const isSheet = variant === 'sheet';

  return (
    <div className={isSheet ? 'flex h-full flex-col' : 'space-y-6'}>
      <div
        className={
          isSheet
            ? 'flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4'
            : 'flex flex-wrap items-center justify-between gap-3'
        }
      >
        {isSheet ? (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Registration details
          </p>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">&larr; Back to registrations</Link>
          </Button>
        )}

        <div className="flex items-center gap-2">
          <DeleteRegistrationButton
            registrationId={registration.id}
            label={`${fullName} (${registration.email})`}
            redirectTo={closeHref}
          />
          {isSheet && onClose ? (
            <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </Button>
          ) : null}
        </div>
      </div>

      <article
        className={
          isSheet
            ? 'flex-1 overflow-y-auto'
            : 'overflow-hidden rounded-lg border border-border bg-background'
        }
      >
        <header className="border-b-4 border-primary bg-card px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {registration.event.name}
          </p>
          <h1 id={titleId} className="mt-2 font-display text-2xl font-bold text-primary">
            {fullName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registered {formatAdminDateTime(registration.createdAt)}
          </p>
        </header>

        <section className="border-b border-border px-5 py-5 sm:px-6 sm:py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Contact</h2>
          <dl className="mt-4 space-y-4">
            <DetailField label="Email" value={registration.email} />
            <DetailField label="Phone" value={registration.phone} />
            <DetailField label="Form locale" value={registration.locale.toUpperCase()} />
          </dl>
        </section>

        <section className="border-b border-border px-5 py-5 sm:px-6 sm:py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
            Registration meta
          </h2>
          <dl className="mt-4 space-y-4">
            <DetailField label="Form version" value={registration.formVersion ?? '—'} />
            <DetailField
              label="Email delivery"
              value={
                <span
                  className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${emailStatusTone(registration.emailDeliveryStatus)}`}
                >
                  {registration.emailDeliveryStatus}
                </span>
              }
            />
            <DetailField
              label="Consent accepted"
              value={formatAdminDateTime(registration.consentAcceptedAt)}
            />
            <DetailField label="Privacy policy" value={registration.privacyPolicyVersion} />
          </dl>
        </section>

        <section className="px-5 py-5 sm:px-6 sm:py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Questionnaire</h2>
          {!registration.formVersion && !questionnaire.visitPurposeLabel ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No questionnaire answers recorded for this registration.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {questionnaire.visitPurposeLabel ? (
                <div className="rounded-md border border-highlight/40 bg-highlight/10 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Visit purpose
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {questionnaire.visitPurposeLabel}
                  </p>
                </div>
              ) : null}

              {questionnaire.rows.length > 0 ? (
                <dl className="divide-y divide-border rounded-md border border-border">
                  {questionnaire.rows.map((row) => (
                    <div
                      key={row.label}
                      className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4"
                    >
                      <dt className="text-sm font-medium text-foreground">{row.label}</dt>
                      <dd className="text-sm text-muted-foreground">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : questionnaire.visitPurposeLabel ? (
                <p className="text-sm text-muted-foreground">No additional answers recorded.</p>
              ) : null}
            </div>
          )}
        </section>
      </article>
    </div>
  );
}
