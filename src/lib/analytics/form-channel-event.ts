const FORM_CHANNEL_EVENT_KEY = 'toon-expo-form-channel';

export type AnalyticsFormChannel = 'general' | 'spyurk_rf';

export function rememberAnalyticsFormChannel(channel: AnalyticsFormChannel): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(FORM_CHANNEL_EVENT_KEY, channel);
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function consumeAnalyticsFormChannel(): AnalyticsFormChannel | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const value = window.sessionStorage.getItem(FORM_CHANNEL_EVENT_KEY);
    window.sessionStorage.removeItem(FORM_CHANNEL_EVENT_KEY);
    return value === 'spyurk_rf' || value === 'general' ? value : undefined;
  } catch {
    return undefined;
  }
}
