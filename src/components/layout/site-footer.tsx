import { Link } from '@/i18n/navigation';
import { ToonExpoLogo } from '@/components/brand/toon-expo-logo';

type SiteFooterProps = {
  privacyLabel: string;
};

export function SiteFooter({ privacyLabel }: SiteFooterProps) {
  return (
    <footer className="border-t border-white/10 bg-primary">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 text-xs text-white/60">
        <p className="flex items-center gap-2">
          <ToonExpoLogo size={22} className="opacity-90" />
          <span>Toon Expo</span>
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
