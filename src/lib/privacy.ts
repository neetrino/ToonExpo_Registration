/** Published privacy policy version sent by the current form. */
export const PRIVACY_POLICY_VERSION = '2026-10-16';

/**
 * Previous publish. Tabs opened before the latest deploy still submit this value.
 * Accepting it keeps an in-progress registration from failing at the last step.
 */
export const PREVIOUS_PRIVACY_POLICY_VERSION = '2026-07-28';

/** Versions the registration API accepts. Current publish is first. */
export const ACCEPTED_PRIVACY_POLICY_VERSIONS = [
  PRIVACY_POLICY_VERSION,
  PREVIOUS_PRIVACY_POLICY_VERSION,
] as const;

/** Policy version shown to visitors as day/month/year. */
export const PRIVACY_POLICY_VERSION_LABEL = PRIVACY_POLICY_VERSION.split('-').reverse().join('/');
