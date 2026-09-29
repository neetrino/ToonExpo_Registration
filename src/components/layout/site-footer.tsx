import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

const NEETRINO_URL = 'https://www.neetrino.com/';

type SiteFooterProps = {
  privacyLabel: string;
};

function CreatorLink({ children }: { children: ReactNode }) {
  return (
    <a
      href={NEETRINO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-highlight motion-reduce:transition-none"
    >
      {children}
    </a>
  );
}

export async function SiteFooter({ privacyLabel }: SiteFooterProps) {
  const t = await getTranslations('landing');

  return (
    <footer className="border-t border-white/10 bg-primary">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 py-5 text-xs tracking-wide text-white/60 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-left">
          {t.rich('copyright', {
            creator: (chunks) => <CreatorLink>{chunks}</CreatorLink>,
          })}
        </p>
        <Link
          href="/privacy"
          className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-highlight motion-reduce:transition-none"
        >
          {privacyLabel}
        </Link>
      </div>
    </footer>
  );
}
