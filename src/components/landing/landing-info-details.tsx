type LandingInfoDetailsProps = {
  aboutToggle: string;
  paragraphs: string[];
};

export function LandingInfoDetails({ aboutToggle, paragraphs }: LandingInfoDetailsProps) {
  return (
    <div className="w-full min-w-0 max-w-xl space-y-3 text-center sm:text-left">
      <details className="group border-t border-white/15 pt-3">
        <summary className="cursor-pointer list-none text-sm font-semibold text-white/90 marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center justify-center gap-2 sm:justify-start">
            <span
              aria-hidden="true"
              className="inline-block text-accent transition-transform group-open:rotate-90"
            >
              ▸
            </span>
            {aboutToggle}
          </span>
        </summary>
        <div className="mt-3 space-y-3 text-left text-sm leading-relaxed text-white/75">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </details>
    </div>
  );
}
