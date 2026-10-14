import { useTranslations } from 'next-intl';
import { PrivacyPolicyContent, type PrivacySection } from '@/components/legal/privacy-policy-content';
import { PRIVACY_POLICY_VERSION } from '@/lib/privacy';
import { cn } from '@/lib/utils';

export const PRIVACY_POLICY_PANEL_ID = 'privacyPolicyPanel';

type PrivacyPolicyPanelProps = {
  open: boolean;
  onToggle: () => void;
};

/** Privacy policy revealed from the consent text so visitors never leave the form. */
export function PrivacyPolicyPanel({ open, onToggle }: PrivacyPolicyPanelProps) {
  const t = useTranslations('privacy');
  const titleId = `${PRIVACY_POLICY_PANEL_ID}Title`;

  if (!open) {
    return null;
  }

  return (
    <section
      aria-labelledby={titleId}
      className="scroll-mb-4 overflow-hidden rounded-xl border border-border bg-muted/40"
    >
      <h3 className="m-0">
        <button
          type="button"
          id={titleId}
          aria-expanded={open}
          aria-controls={PRIVACY_POLICY_PANEL_ID}
          onClick={onToggle}
          className="flex w-full items-center gap-3 bg-background px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <ShieldIcon />
          <span className="min-w-0 flex-1">
            <span className="block font-display text-sm font-bold leading-snug text-primary">
              {t('title')}
            </span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t('status', { version: PRIVACY_POLICY_VERSION })}
            </span>
          </span>
          <ChevronIcon open={open} />
        </button>
      </h3>

      <PolicyBody />
    </section>
  );
}

function PolicyBody() {
  const t = useTranslations('privacy');
  const sections = t.raw('sections') as PrivacySection[];

  return (
    <div
      id={PRIVACY_POLICY_PANEL_ID}
      tabIndex={0}
      className="max-h-72 overflow-y-auto overscroll-contain border-t border-border px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      <PrivacyPolicyContent
        intro={t('intro')}
        sections={sections}
        compact
        sectionHeadingLevel="h4"
      />
    </div>
  );
}

function ShieldIcon() {
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-secondary"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3 4.5 6.5v5c0 4.5 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5 7.5-9.5v-5L12 3Z" />
        <path d="M9.5 12.2 11.2 14l3.5-3.8" />
      </svg>
    </span>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        'size-5 shrink-0 text-secondary transition-transform duration-200 motion-reduce:transition-none',
        open && 'rotate-180',
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
