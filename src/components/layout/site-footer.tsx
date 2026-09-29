import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

const NEETRINO_URL = 'https://www.neetrino.com/';

const footerLinkClassName =
  'rounded-sm underline decoration-white/50 underline-offset-4 transition-colors hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary motion-reduce:transition-none';

type SiteFooterProps = {
  privacyLabel: string;
};

function CreatorLink({ children }: { children: ReactNode }) {
  return (
    <a
      href={NEETRINO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={footerLinkClassName}
    >
      {children}
    </a>
  );
}

export async function SiteFooter({ privacyLabel }: SiteFooterProps) {
  const t = await getTranslations('landing');

  return (
    <footer className="border-t border-white/10 bg-primary text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-center gap-3 px-4 py-7 text-sm leading-relaxed tracking-wide sm:flex-row sm:items-center sm:justify-between">
        <p className="text-left">
          {t.rich('copyright', {
            creator: (chunks) => <CreatorLink>{chunks}</CreatorLink>,
          })}
        </p>
        <Link href="/privacy" className={footerLinkClassName}>
          {privacyLabel}
        </Link>
      </div>
    </footer>
  );
}
