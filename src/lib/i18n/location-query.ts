/** Query object accepted by next-intl navigation hrefs. */
export type LocationQuery = Record<string, string>;

/**
 * Turn a location search string into a next-intl query object.
 * An empty search stays absent so locale changes remain path-only.
 * Duplicate keys keep the last value, matching `URLSearchParams`.
 */
export function queryFromLocationSearch(search: string): LocationQuery | undefined {
  const entries = [...new URLSearchParams(search).entries()];
  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries);
}

/**
 * Locale-switch target that keeps the current query string, including UTM.
 */
export function localeSwitchHref(
  pathname: string,
  search: string,
): string | { pathname: string; query: LocationQuery } {
  const query = queryFromLocationSearch(search);
  if (!query) {
    return pathname;
  }

  return { pathname, query };
}
