import { describe, expect, it } from 'vitest';
import { ADMIN_PAGE_SIZE } from '@/lib/admin/constants';
import { getAdminPageCount, getAdminPageRange } from '@/lib/admin/pagination';

describe('admin list pagination', () => {
  it('shows 20 registrations per page', () => {
    expect(ADMIN_PAGE_SIZE).toBe(20);
  });

  it('puts leftover rows on the next page', () => {
    expect(getAdminPageCount(20)).toBe(1);
    expect(getAdminPageCount(21)).toBe(2);
    expect(getAdminPageCount(40)).toBe(2);
    expect(getAdminPageCount(41)).toBe(3);
  });

  it('describes the visible range on each page', () => {
    expect(getAdminPageRange(1, 47)).toEqual({ from: 1, to: 20 });
    expect(getAdminPageRange(2, 47)).toEqual({ from: 21, to: 40 });
    expect(getAdminPageRange(3, 47)).toEqual({ from: 41, to: 47 });
  });

  it('returns an empty range when there are no rows', () => {
    expect(getAdminPageCount(0)).toBe(1);
    expect(getAdminPageRange(1, 0)).toEqual({ from: 0, to: 0 });
  });
});
