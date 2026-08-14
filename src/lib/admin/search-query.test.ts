import { describe, expect, it } from 'vitest';
import { ADMIN_SEARCH_MAX_LENGTH } from '@/lib/admin/constants';
import { buildAdminSearchHref, normalizeAdminSearchQuery } from '@/lib/admin/search-query';

describe('normalizeAdminSearchQuery', () => {
  it('returns undefined for empty or whitespace-only input', () => {
    expect(normalizeAdminSearchQuery(undefined)).toBeUndefined();
    expect(normalizeAdminSearchQuery('')).toBeUndefined();
    expect(normalizeAdminSearchQuery('   ')).toBeUndefined();
  });

  it('trims and keeps a live-search query', () => {
    expect(normalizeAdminSearchQuery('  sipan  ')).toBe('sipan');
  });

  it('caps query length', () => {
    const long = 'a'.repeat(ADMIN_SEARCH_MAX_LENGTH + 20);
    expect(normalizeAdminSearchQuery(long)?.length).toBe(ADMIN_SEARCH_MAX_LENGTH);
  });
});

describe('buildAdminSearchHref', () => {
  it('writes the query into q and omits page so results start at page 1', () => {
    expect(buildAdminSearchHref('sipan')).toBe('/admin?q=sipan');
  });

  it('clears search back to /admin without enter-only submit', () => {
    expect(buildAdminSearchHref('   ')).toBe('/admin');
  });

  it('does not keep a previous view or page in the live-search href', () => {
    expect(buildAdminSearchHref('TEHV6TUGERFQB')).toBe('/admin?q=TEHV6TUGERFQB');
    expect(buildAdminSearchHref('TEHV6TUGERFQB')).not.toContain('page=');
    expect(buildAdminSearchHref('TEHV6TUGERFQB')).not.toContain('view=');
  });
});
