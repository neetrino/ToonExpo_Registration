import type { Locale } from '@/types/locale';
import { RegistrationWizard } from '@/components/registration/registration-wizard';

type LandingRegistrationCardProps = {
  locale: Locale;
};

export function LandingRegistrationCard({ locale }: LandingRegistrationCardProps) {
  return (
    <div className="landing-card-enter w-full max-w-xl">
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-[0_8px_32px_rgba(0,48,61,0.12)] md:p-8">
        <RegistrationWizard locale={locale} />
      </div>
    </div>
  );
}
