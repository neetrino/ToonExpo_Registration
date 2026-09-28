import { describe, expect, it } from 'vitest';
import {
  adminListFiltersLabel,
  buildAdminHref,
  parseAdminListFilters,
  toggleAdminListFilter,
} from '@/lib/admin/admin-url';

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

  it('builds a next-page href without a search query', () => {
    expect(buildAdminHref({ page: 2 })).toBe('/admin?page=2');
  });

  it('keeps the form-channel filter across list and detail links', () => {
    expect(buildAdminHref({ channels: ['SPYURK_RF'] })).toBe('/admin?channel=SPYURK_RF');
    expect(buildAdminHref({ q: 'sipan', page: 2, channels: ['GENERAL'] })).toBe(
      '/admin?q=sipan&channel=GENERAL&page=2',
    );
  });

  it('keeps several filters selected at once', () => {
    expect(buildAdminHref({ channels: ['MOOTQ', 'SPYURK_RF'] })).toBe(
      '/admin?channel=SPYURK_RF&channel=MOOTQ',
    );
    expect(parseAdminListFilters(['MOOTQ', 'SPYURK_RF', 'NOPE'])).toEqual(['SPYURK_RF', 'MOOTQ']);
    expect(toggleAdminListFilter(['MOOTQ'], 'SPYURK_RF')).toEqual(['SPYURK_RF', 'MOOTQ']);
    expect(toggleAdminListFilter(['SPYURK_RF', 'MOOTQ'], 'MOOTQ')).toEqual(['SPYURK_RF']);
    expect(adminListFiltersLabel(['SPYURK_RF', 'MOOTQ'])).toBe('Spyurk RF, Mootq');
  });
});
