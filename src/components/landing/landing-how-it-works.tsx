import { getTranslations } from 'next-intl/server';
import { readHowItWorksSteps } from '@/components/landing/landing-copy';
import { cn } from '@/lib/utils';

const STEP_LINE = ['bg-secondary', 'bg-secondary', 'bg-secondary', 'bg-cta'] as const;

/**
 * Four-step “how it works” band placed directly under the Spyurk hero.
 * Desktop is four columns; narrower viewports stack the steps in order.
 */
export async function LandingHowItWorks() {
  const t = await getTranslations('landing');
  const steps = readHowItWorksSteps(t.raw('howItWorksSteps'));

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="scroll-mt-4 bg-white"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16 lg:py-20">
        <h2
          id="how-it-works-title"
          className="font-display text-3xl font-extrabold tracking-tight text-primary sm:text-4xl"
        >
          {t('howItWorksTitle')}
        </h2>
        <ol className="mt-8 grid grid-cols-1 gap-8 sm:mt-10 lg:grid-cols-4 lg:gap-6">
          {steps.map((step, index) => (
            <li key={step} className="min-w-0">
              <div className={cn('h-0.5 w-full', STEP_LINE[index] ?? 'bg-secondary')} />
              <p className="mt-4 font-display text-5xl font-extrabold leading-none text-secondary">
                {index + 1}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-primary sm:text-[15px]">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
