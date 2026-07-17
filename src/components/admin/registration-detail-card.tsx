import type { ReactNode } from 'react';
import { DeleteRegistrationButton } from '@/components/admin/delete-registration-button';
import { Button } from '@/components/ui/button';
import type { AdminRegistrationDetail } from '@/lib/admin/get-registration';
import { formatRegistrationAnswersForDisplay } from '@/lib/admin/format-answers';

type RegistrationDetailCardProps = {
  registration: AdminRegistrationDetail;
  onClose: () => void;
  closeHref: string;
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
      return 'bg-success/10 text-success';
    case 'FAILED':
      return 'bg-destructive/10 text-destructive';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm leading-relaxed text-foreground">{value}</dd>
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
 * Admin participant detail content for the right-side sheet.
 */
export function RegistrationDetailCard({
  registration,
  onClose,
  closeHref,
  titleId,
  fullName: fullNameProp,
}: RegistrationDetailCardProps) {
  const fullName = fullNameProp ?? `${registration.firstName} ${registration.lastName}`;
  const questionnaire = formatRegistrationAnswersForDisplay(registration.answers);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 px-4 py-3 sm:px-5 sm:py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Details
        </p>
        <div className="flex items-center gap-1">
          <DeleteRegistrationButton
            registrationId={registration.id}
            label={`${fullName} (${registration.email})`}
            redirectTo={closeHref}
            iconOnly
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close"
            className="size-11 shrink-0 sm:size-9"
          >
            <CloseIcon />
          </Button>
        </div>
      </div>

      <article className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <header className="border-b border-border/70 bg-muted/30 px-4 py-5 sm:px-6 sm:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">
            {registration.event.name}
          </p>
          <h1 id={titleId} className="mt-2 font-display text-2xl font-bold text-primary">
            {fullName}
          </h1>
          <div className="mt-2 h-0.5 w-8 bg-highlight" aria-hidden="true" />
          <p className="mt-3 text-sm text-muted-foreground">
            Registered {formatAdminDateTime(registration.createdAt)}
          </p>
        </header>

        <section className="border-b border-border px-4 py-5 sm:px-6 sm:py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Contact</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <DetailField
              label="Email"
              value={
                <a
                  href={`mailto:${registration.email}`}
                  className="break-all text-secondary underline-offset-2 hover:underline"
                >
                  {registration.email}
                </a>
              }
            />
            <DetailField
              label="Phone"
              value={
                <a
                  href={`tel:${registration.phone}`}
                  className="text-secondary underline-offset-2 hover:underline"
                >
                  {registration.phone}
                </a>
              }
            />
            <DetailField label="Form locale" value={registration.locale.toUpperCase()} />
          </dl>
        </section>

        <section className="border-b border-border px-4 py-5 sm:px-6 sm:py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
            Registration meta
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <DetailField label="Form version" value={registration.formVersion ?? '—'} />
            <DetailField
              label="Email delivery"
              value={
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${emailStatusTone(registration.emailDeliveryStatus)}`}
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

        <section className="px-4 py-5 sm:px-6 sm:py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
            Questionnaire
          </h2>
          {!registration.formVersion && !questionnaire.visitPurposeLabel ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No questionnaire answers recorded for this registration.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {questionnaire.visitPurposeLabel ? (
                <div className="rounded-xl border border-highlight/40 bg-highlight/10 px-4 py-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Visit purpose
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-foreground">
                    {questionnaire.visitPurposeLabel}
                  </p>
                </div>
              ) : null}

              {questionnaire.rows.length > 0 ? (
                <dl className="overflow-hidden rounded-xl border border-border divide-y divide-border">
                  {questionnaire.rows.map((row) => (
                    <div key={row.label} className="grid gap-1 px-4 py-3.5">
                      <dt className="text-sm font-medium text-foreground">{row.label}</dt>
                      <dd className="text-sm leading-relaxed text-muted-foreground">{row.value}</dd>
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
