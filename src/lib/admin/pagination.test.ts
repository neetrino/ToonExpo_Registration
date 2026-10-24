import { describe, expect, it } from 'vitest';
import { ADMIN_PAGE_SIZE } from '@/lib/admin/constants';
import { getAdminPageCount, getAdminPageItems, getAdminPageRange } from '@/lib/admin/pagination';

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

  it('shows the first pages, including page 4, from the start of a long list', () => {
    expect(getAdminPageItems(1, 978)).toEqual([1, 2, 3, 4, 5, 6, 7, 'ellipsis', 978]);
    expect(getAdminPageItems(5, 978)).toEqual([1, 2, 3, 4, 5, 6, 7, 'ellipsis', 978]);
  });

  it('keeps a window around the current page and both ends', () => {
    expect(getAdminPageItems(100, 978)).toEqual([
      1,
      'ellipsis',
      98,
      99,
      100,
      101,
      102,
      'ellipsis',
      978,
    ]);
    expect(getAdminPageItems(978, 978)).toEqual([1, 'ellipsis', 972, 973, 974, 975, 976, 977, 978]);
  });

  it('lists every page when the list is short', () => {
    expect(getAdminPageItems(1, 1)).toEqual([1]);
    expect(getAdminPageItems(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('clamps a page number that is outside the list', () => {
    expect(getAdminPageItems(0, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getAdminPageItems(9, 5)).toEqual([1, 2, 3, 4, 5]);
  });
});
