import { Link } from '@/i18n/navigation';

type SiteFooterProps = {
  privacyLabel: string;
};

export function SiteFooter({ privacyLabel }: SiteFooterProps) {
  return (
    <footer className="border-t border-white/10 bg-primary">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 text-xs text-white/60">
        <p>Toon Expo</p>
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
