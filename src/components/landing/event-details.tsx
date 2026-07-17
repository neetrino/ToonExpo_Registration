type EventDetailsProps = {
  title: string;
  dateLabel: string;
  dateValue: string;
  venueLabel: string;
  venueValue: string;
};

export function EventDetails({
  title,
  dateLabel,
  dateValue,
  venueLabel,
  venueValue,
}: EventDetailsProps) {
  return (
    <section className="border-b border-border bg-muted">
      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
          {title}
        </h2>
        <dl className="mt-8 grid gap-8 sm:grid-cols-2">
          <div className="border-l-4 border-accent pl-5">
            <dt className="text-sm font-medium text-muted-foreground">{dateLabel}</dt>
            <dd className="mt-2 text-2xl font-semibold text-foreground">{dateValue}</dd>
          </div>
          <div className="border-l-4 border-highlight pl-5">
            <dt className="text-sm font-medium text-muted-foreground">{venueLabel}</dt>
            <dd className="mt-2 text-2xl font-semibold text-foreground">{venueValue}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
