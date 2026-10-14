import { cn } from '@/lib/utils';

export type PrivacySection = {
  title: string;
  body: string;
  items?: string[];
  closing?: string;
};

type PrivacyPolicyContentProps = {
  intro: string;
  sections: PrivacySection[];
  /** Smaller type and spacing for the inline consent panel. */
  compact?: boolean;
  /** Heading level for section titles; the inline panel sits under a step heading. */
  sectionHeadingLevel?: 'h2' | 'h4';
};

/** Privacy policy body shared by the standalone page and the registration consent step. */
export function PrivacyPolicyContent({
  intro,
  sections,
  compact = false,
  sectionHeadingLevel = 'h2',
}: PrivacyPolicyContentProps) {
  const SectionHeading = sectionHeadingLevel;

  return (
    <div
      className={cn(
        'text-muted-foreground',
        compact ? 'space-y-4 text-sm leading-relaxed' : 'space-y-6 text-base leading-relaxed',
      )}
    >
      <p className="whitespace-pre-line">{intro}</p>

      {sections.map((section) => (
        <section key={section.title} className={compact ? 'space-y-1.5' : 'space-y-2'}>
          <SectionHeading
            className={cn(
              'font-display font-bold text-foreground',
              compact ? 'text-sm' : 'text-lg',
            )}
          >
            {section.title}
          </SectionHeading>
          <p className="whitespace-pre-line">{section.body}</p>
          {section.items && section.items.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {section.closing ? <p className="whitespace-pre-line">{section.closing}</p> : null}
        </section>
      ))}
    </div>
  );
}
