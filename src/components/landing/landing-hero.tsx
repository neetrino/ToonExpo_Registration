type LandingHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
};

export function LandingHero({ eyebrow, title, description, ctaLabel }: LandingHeroProps) {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-highlight">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-primary-foreground/85 md:text-lg">
          {description}
        </p>
        <div className="mt-10">
          <a
            href="#registration"
            className="inline-flex h-11 items-center justify-center rounded-md bg-highlight px-8 text-sm font-semibold text-primary transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
