import type { Locale } from '@/types/locale';
import { RegistrationForm } from '@/components/registration/registration-form';

type RegistrationSectionProps = {
  locale: Locale;
  title: string;
  description: string;
};

export function RegistrationSection({ locale, title, description }: RegistrationSectionProps) {
  return (
    <section id="registration" className="scroll-mt-20 bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold text-primary">{title}</h2>
          <p className="mt-3 text-muted-foreground">{description}</p>
        </div>
        <div className="mt-10 max-w-xl border border-border bg-card p-6 md:p-8">
          <RegistrationForm locale={locale} />
        </div>
      </div>
    </section>
  );
}
