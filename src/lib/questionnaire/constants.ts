/** Active visitor registration questionnaire version. */
export const FORM_VERSION = '2026-vis-reg-v1' as const;

export type FormVersion = typeof FORM_VERSION;

/** Max length for free-text "other" answers. */
export const OTHER_TEXT_MAX_LENGTH = 200;

/** Max selections for market-research interests (Q7). */
export const MARKET_INTERESTS_MAX = 3;
