export type HeroAdvantage = {
  lead: string;
  text: string;
};

/** Reads hero advantage rows from the message catalog. */
export function readHeroAdvantages(value: unknown): HeroAdvantage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item !== 'object' || item === null) {
      return [];
    }

    const record = item as Record<string, unknown>;
    if (typeof record.text !== 'string' || record.text.length === 0) {
      return [];
    }

    const lead = typeof record.lead === 'string' ? record.lead : '';
    return [{ lead, text: record.text }];
  });
}

/** Reads ordered how-it-works steps from the message catalog. */
export function readHowItWorksSteps(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((step): step is string => typeof step === 'string' && step.length > 0);
}
