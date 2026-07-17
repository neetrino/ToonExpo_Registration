type LandingBrandProps = {
  title: string;
  tagline: string;
};

export function LandingBrand({ title, tagline }: LandingBrandProps) {
  return (
    <header className="landing-brand text-center">
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
        {tagline}
      </p>
    </header>
  );
}
