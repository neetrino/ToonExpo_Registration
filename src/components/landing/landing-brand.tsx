type LandingBrandMetaItem = {
  label: string;
  value: string;
};

type LandingBrandProps = {
  title: string;
  titleBrand: string;
  titleEvent: string;
  lead: string;
  meta: LandingBrandMetaItem[];
};

export function LandingBrand({
  title,
  titleBrand,
  titleEvent,
  lead,
  meta,
}: LandingBrandProps) {
  return (
    <header className="landing-brand mx-auto w-full max-w-3xl min-w-0 text-center">
      <h1 className="font-display font-extrabold tracking-tight text-white">
        <span className="sr-only">{title}</span>
        <span
          aria-hidden="true"
          className="block text-[clamp(1.75rem,6vw,2.75rem)] leading-none"
        >
          {titleBrand}
        </span>
        <span
          aria-hidden="true"
          className="mt-2 block text-[clamp(1.15rem,3.8vw,1.65rem)] font-bold leading-snug text-white/95"
        >
          {titleEvent}
        </span>
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
        {lead}
      </p>
      <p className="mx-auto mt-5 flex max-w-3xl flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-center text-sm font-bold text-white sm:text-base">
        {meta.map((item, index) => (
          <span key={item.label} className="inline-flex min-w-0 items-baseline gap-2">
            {index > 0 ? (
              <span aria-hidden="true" className="font-normal text-white/35">
                ·
              </span>
            ) : null}
            <span>
              <span className="sr-only">{item.label}: </span>
              {item.value}
            </span>
          </span>
        ))}
      </p>
    </header>
  );
}
