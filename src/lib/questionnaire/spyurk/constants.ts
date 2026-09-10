/** Active Spyurk / RF visitor registration questionnaire version. */
export const SPYURK_FORM_VERSION = '2026-vis-reg-spyurk-v1' as const;

export type SpyurkFormVersion = typeof SPYURK_FORM_VERSION;

/** Default phone country for the RF diaspora form. */
export const SPYURK_DEFAULT_PHONE_COUNTRY = 'RU' as const;

/** Max length for RF city / region free text. */
export const SPYURK_RESIDENCE_TEXT_MAX_LENGTH = 100;

/** Max selections for purchase motives and multi-interest questions. */
export const SPYURK_MULTI_SELECT_MAX = 3;
