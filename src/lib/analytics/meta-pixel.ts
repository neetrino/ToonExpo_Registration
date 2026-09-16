export const DEFAULT_META_PIXEL_ID = '1774204670579132';
export const META_COMPLETE_REGISTRATION_EVENT = 'CompleteRegistration';

const META_PIXEL_ID_PATTERN = /^\d{12,20}$/;

/** Returns a valid Meta Pixel id, or null when empty/invalid. */
export function parseMetaPixelId(value: string | undefined): string | null {
  if (value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  return META_PIXEL_ID_PATTERN.test(trimmed) ? trimmed : null;
}

/**
 * Resolves the Meta Pixel id.
 * Unset env uses the client pixel. An empty or invalid value disables the pixel.
 */
export function resolveMetaPixelId(
  envValue: string | undefined = process.env.NEXT_PUBLIC_META_PIXEL_ID,
): string | null {
  if (envValue === undefined) {
    return DEFAULT_META_PIXEL_ID;
  }

  return parseMetaPixelId(envValue);
}

/** Official Meta Pixel loader + first PageView. `pixelId` must already be validated. */
export function buildMetaPixelSnippet(pixelId: string): string {
  const id = parseMetaPixelId(pixelId);
  if (!id) {
    return '';
  }

  return `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${id}');
fbq('track', 'PageView');`;
}

export function trackMetaPageView(): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    return;
  }

  window.fbq('track', 'PageView');
}

export function trackMetaRegistrationComplete(): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    return;
  }

  window.fbq('track', META_COMPLETE_REGISTRATION_EVENT);
}
