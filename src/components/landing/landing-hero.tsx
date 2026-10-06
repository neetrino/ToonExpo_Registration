import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { readHeroAdvantages, type HeroAdvantage } from '@/components/landing/landing-copy';
import { cn } from '@/lib/utils';
import {
  CalendarIcon,
  ClockIcon,
  OfferIcon,
  PinIcon,
  ProjectsIcon,
  TicketIcon,
} from '@/components/landing/landing-icons';

const ADVANTAGE_ICONS = [OfferIcon, TicketIcon, ClockIcon, ProjectsIcon] as const;
const POSTER_SRC = '/landing/toon-expo-rf-square.jpg';
const POSTER_WIDTH = 1024;
const POSTER_HEIGHT = 1023;

const heroLinkClassName =
  'rounded-sm font-semibold text-white underline decoration-white/70 underline-offset-4 transition-colors hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-primary';

type Fact = {
  id: string;
  label: string;
  value: string;
  icon: typeof CalendarIcon;
};

/**
 * Spyurk first screen. Mobile order is poster, actions, then copy.
 * Wide screens keep the copy beside a smaller poster, with actions under the image.
 */
export async function LandingHero() {
  const t = await getTranslations('landing');
  const advantages = readHeroAdvantages(t.raw('heroAdvantages'));
  const facts: Fact[] = [
    { id: 'date', label: t('dateLabel'), value: t('dateValue'), icon: CalendarIcon },
    { id: 'hours', label: t('hoursLabel'), value: t('heroHoursValue'), icon: ClockIcon },
    { id: 'venue', label: t('venueLabel'), value: t('heroVenueValue'), icon: PinIcon },
    { id: 'entry', label: t('freeEntry'), value: t('freeEntry'), icon: TicketIcon },
  ];

  return (
    <section className="overflow-x-clip bg-primary text-white" aria-labelledby="landing-hero-title">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 px-4 pt-0 pb-10 sm:gap-7 sm:pb-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-x-14 lg:gap-y-5 lg:px-6 lg:py-16">
        <HeroPoster alt={t('heroPosterAlt')} className="order-1 lg:col-start-2 lg:row-start-1" />
        <HeroActions
          registerLabel={t('registerCta')}
          howItWorksLabel={t('howItWorksTitle')}
          className="order-2 justify-center lg:col-start-2 lg:row-start-2"
        />
        <div className="order-3 flex min-w-0 flex-col gap-6 sm:gap-7 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-center">
          <HeroIntro title={t('heroTitle')} accent={t('heroTitleAccent')} />
          <HeroAdvantages items={advantages} />
          <HeroFacts facts={facts} />
        </div>
      </div>
    </section>
  );
}

function HeroIntro({ title, accent }: { title: string; accent: string }) {
  return (
    <h1
      id="landing-hero-title"
      className="min-w-0 font-display text-[clamp(1.7rem,4.2vw,2.75rem)] font-extrabold leading-[1.08] tracking-tight text-white"
    >
      {title}
      <span className="mt-2 block text-[0.62em] leading-snug text-hero-cream">{accent}</span>
    </h1>
  );
}

function HeroAdvantages({ items }: { items: HeroAdvantage[] }) {
  return (
    <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {items.map((item, index) => {
        const Icon = ADVANTAGE_ICONS[index] ?? ProjectsIcon;
        return (
          <li key={item.text} className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10">
              <Icon className="size-4 text-hero-cream" />
            </span>
            <p className="min-w-0 text-sm leading-snug text-white/90">
              {item.lead ? (
                <span className="mb-1 block font-display text-[1.85rem] font-extrabold leading-none tracking-tight text-highlight tabular-nums">
                  {item.lead}
                </span>
              ) : null}
              {item.text}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

function HeroFacts({ facts }: { facts: Fact[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2.5 text-sm text-white/90">
      {facts.map((fact) => {
        const Icon = fact.icon;
        return (
          <li key={fact.id} className="flex min-w-0 items-center gap-2">
            <Icon className="size-4 shrink-0 text-hero-cream" />
            <span>
              {fact.id === 'entry' ? null : <span className="sr-only">{fact.label}: </span>}
              {fact.value}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function HeroActions({
  registerLabel,
  howItWorksLabel,
  className,
}: {
  registerLabel: string;
  howItWorksLabel: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-5 gap-y-3', className)}>
      <a
        href="#registration"
        className="inline-flex h-12 items-center justify-center rounded-lg bg-cta px-6 text-sm font-semibold text-white transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      >
        {registerLabel}
      </a>
      <a href="#how-it-works" className={heroLinkClassName}>
        {howItWorksLabel}
      </a>
    </div>
  );
}

function HeroPoster({ alt, className }: { alt: string; className?: string }) {
  return (
    <div
      className={cn(
        '-mx-4 flex w-[calc(100%+2rem)] min-w-0 justify-center lg:mx-0 lg:w-full',
        className,
      )}
    >
      <Image
        src={POSTER_SRC}
        alt={alt}
        width={POSTER_WIDTH}
        height={POSTER_HEIGHT}
        priority
        unoptimized
        sizes="(min-width: 1024px) 36rem, 100vw"
        className="h-auto w-full object-contain lg:max-h-[min(34rem,calc(100dvh-8rem))] lg:w-auto lg:max-w-full"
      />
    </div>
  );
}
