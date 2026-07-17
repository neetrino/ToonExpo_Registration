import { Link } from '@/i18n/navigation';

type SiteFooterProps = {
  privacyLabel: string;
};

export function SiteFooter({ privacyLabel }: SiteFooterProps) {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-primary-foreground/80">Toon Expo</p>
        <Link href="/privacy" className="underline-offset-4 hover:underline">
          {privacyLabel}
        </Link>
      </div>
    </footer>
  );
}
