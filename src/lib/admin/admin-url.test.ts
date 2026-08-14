import { describe, expect, it } from 'vitest';
import { buildAdminHref } from '@/lib/admin/admin-url';

describe('buildAdminHref', () => {
  it('returns the dashboard root when filters are empty', () => {
    expect(buildAdminHref()).toBe('/admin');
  });

  it('omits page=1 so a new search always loads the first page', () => {
    expect(buildAdminHref({ q: 'sipan', page: 1 })).toBe('/admin?q=sipan');
  });

  it('keeps page only when it is greater than 1', () => {
    expect(buildAdminHref({ q: 'sipan', page: 2 })).toBe('/admin?q=sipan&page=2');
  });
});
