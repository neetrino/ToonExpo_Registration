import type { Locale } from '@/types/locale';
import { RegistrationWizard } from '@/components/registration/registration-wizard';
import { SpyurkRegistrationWizard } from '@/components/registration/spyurk/spyurk-registration-wizard';

type LandingRegistrationCardProps = {
  locale: Locale;
  variant?: 'general' | 'spyurk';
};

export function LandingRegistrationCard({
  locale,
  variant = 'general',
}: LandingRegistrationCardProps) {
  return (
    <div className="landing-card-enter mx-auto w-full max-w-xl">
      <div className="rounded-2xl border border-border/80 bg-card p-7 shadow-[0_8px_32px_rgba(0,48,61,0.12)] md:p-10">
        {variant === 'spyurk' ? (
          <SpyurkRegistrationWizard locale={locale} />
        ) : (
          <RegistrationWizard locale={locale} />
        )}
      </div>
    </div>
  );
}
