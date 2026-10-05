import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { readHeroAdvantages, type HeroAdvantage } from '@/components/landing/landing-copy';
import {
  BellIcon,
  CalendarIcon,
  ClockIcon,
  DevelopersIcon,
  OfferIcon,
  PinIcon,
  ProjectsIcon,
  TicketIcon,
} from '@/components/landing/landing-icons';

const ADVANTAGE_ICONS = [ProjectsIcon, OfferIcon, DevelopersIcon, BellIcon] as const;
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
 * Spyurk first screen: headline, four advantages, event facts, and the square poster.
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
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-8 sm:gap-10 sm:py-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-12 lg:py-16">
        <div className="flex min-w-0 flex-col gap-6 sm:gap-7">
          <HeroIntro
            title={t('heroTitle')}
            accent={t('heroTitleAccent')}
            subtitle={t('heroSubtitle')}
          />
          <HeroAdvantages items={advantages} />
          <HeroFacts facts={facts} />
          <HeroActions registerLabel={t('registerCta')} howItWorksLabel={t('howItWorksTitle')} />
        </div>
        <HeroPoster alt={t('heroPosterAlt')} />
      </div>
    </section>
  );
}

function HeroIntro({
  title,
  accent,
  subtitle,
}: {
  title: string;
  accent: string;
  subtitle: string;
}) {
  return (
    <div className="min-w-0">
      <h1
        id="landing-hero-title"
        className="font-display text-[clamp(1.85rem,4.6vw,3.15rem)] font-extrabold leading-[1.05] tracking-tight text-white"
      >
        {title}
        <span className="mt-2 block text-hero-cream">{accent}</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">{subtitle}</p>
    </div>
  );
}

function HeroAdvantages({ items }: { items: HeroAdvantage[] }) {
  return (
    <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {items.map((item, index) => {
        const Icon = ADVANTAGE_ICONS[index] ?? ProjectsIcon;
        return (
          <li
            key={item.text}
            className="flex min-w-0 items-start gap-2.5 rounded-xl border border-white/15 bg-white/5 px-3 py-3"
          >
            <Icon className="mt-0.5 size-4 shrink-0 text-hero-cream" />
            <p className="min-w-0 text-sm leading-snug text-white/90">
              {item.lead ? (
                <span className="mb-1 block font-display text-[1.65rem] font-extrabold leading-none tracking-tight text-highlight">
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
}: {
  registerLabel: string;
  howItWorksLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
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

function HeroPoster({ alt }: { alt: string }) {
  return (
    <div className="-mx-4 w-[calc(100%+2rem)] min-w-0 lg:mx-0 lg:w-full">
      <Image
        src={POSTER_SRC}
        alt={alt}
        width={POSTER_WIDTH}
        height={POSTER_HEIGHT}
        priority
        sizes="(min-width: 1024px) 34rem, 100vw"
        className="h-auto w-full"
      />
    </div>
  );
}
