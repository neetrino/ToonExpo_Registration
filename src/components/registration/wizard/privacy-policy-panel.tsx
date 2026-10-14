import { useTranslations } from 'next-intl';
import { PrivacyPolicyContent, type PrivacySection } from '@/components/legal/privacy-policy-content';
import { PRIVACY_POLICY_VERSION } from '@/lib/privacy';

export const PRIVACY_POLICY_PANEL_ID = 'privacyPolicyPanel';

/** Scrollable privacy policy shown above the consent checkbox so visitors never leave the form. */
export function PrivacyPolicyPanel() {
  const t = useTranslations('privacy');
  const sections = t.raw('sections') as PrivacySection[];
  const titleId = `${PRIVACY_POLICY_PANEL_ID}Title`;

  return (
    <section
      aria-labelledby={titleId}
      className="overflow-hidden rounded-xl border border-border bg-muted/40"
    >
      <header className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
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
        <div className="min-w-0">
          <h3 id={titleId} className="font-display text-sm font-bold leading-snug text-primary">
            {t('title')}
          </h3>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {t('status', { version: PRIVACY_POLICY_VERSION })}
          </p>
        </div>
      </header>

      <div
        id={PRIVACY_POLICY_PANEL_ID}
        tabIndex={0}
        className="max-h-72 overflow-y-auto overscroll-contain px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <PrivacyPolicyContent
          intro={t('intro')}
          sections={sections}
          compact
          sectionHeadingLevel="h4"
        />
      </div>
    </section>
  );
}
