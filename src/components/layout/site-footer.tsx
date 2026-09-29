import { Link } from '@/i18n/navigation';

type SiteFooterProps = {
  copyright: string;
  privacyLabel: string;
};

export function SiteFooter({ copyright, privacyLabel }: SiteFooterProps) {
  return (
    <footer className="border-t border-white/10 bg-primary">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 py-5 text-xs tracking-wide text-white/60 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-left">{copyright}</p>
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
