/** Active visitor registration questionnaire version. */
export const FORM_VERSION = '2026-vis-reg-v2' as const;

export type FormVersion = typeof FORM_VERSION;

/** Max length for free-text "other" answers. */
export const OTHER_TEXT_MAX_LENGTH = 200;

/** Max selections for market-research interests. */
export const MARKET_INTERESTS_MAX = 3;

/** Max location leaves (districts + regions + countries) for seek questions. */
export const LOCATION_CHOICE_MAX = 3;
