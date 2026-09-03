export const DEFAULT_GTM_CONTAINER_ID = 'GTM-NJZV2NL3';
export const REGISTRATION_COMPLETE_EVENT = 'registration_complete';

const GTM_CONTAINER_ID_PATTERN = /^GTM-[A-Z0-9]+$/;

/** Returns a valid GTM container id, or null when the value is empty/invalid. */
export function parseGtmContainerId(value: string | undefined): string | null {
  if (value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  return GTM_CONTAINER_ID_PATTERN.test(trimmed) ? trimmed : null;
}

/**
 * Resolves the GTM container id.
 * Unset env uses the client container. An empty or invalid value disables GTM.
 */
export function resolveGtmContainerId(
  envValue: string | undefined = process.env.NEXT_PUBLIC_GTM_ID,
): string | null {
  if (envValue === undefined) {
    return DEFAULT_GTM_CONTAINER_ID;
  }

  return parseGtmContainerId(envValue);
}

export function pushRegistrationCompleteEvent(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: REGISTRATION_COMPLETE_EVENT,
    page_path: window.location.pathname,
  });
}
