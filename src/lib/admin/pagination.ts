import { ADMIN_PAGE_SIZE } from '@/lib/admin/constants';

/** Pages kept on each side of the current page. First and last pages stay visible. */
const ADMIN_PAGE_NEIGHBOR_COUNT = 2;

const ADMIN_PAGE_EDGE_COUNT = 1;

export type AdminPageItem = number | 'ellipsis';

export function getAdminPageCount(totalItems: number, pageSize: number = ADMIN_PAGE_SIZE): number {
  if (totalItems <= 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function getAdminPageRange(
  page: number,
  totalItems: number,
  pageSize: number = ADMIN_PAGE_SIZE,
): { from: number; to: number } {
  if (totalItems <= 0) {
    return { from: 0, to: 0 };
  }

  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, totalItems);
  return { from, to };
}

function pageNumbers(start: number, end: number): number[] {
  if (end < start) {
    return [];
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

/**
 * Page controls for a long admin list.
 * Always includes the first page, the last page, and a short window around
 * the current page so an operator can open a nearby page in one click.
 */
export function getAdminPageItems(page: number, totalPages: number): AdminPageItem[] {
  const count = Number.isFinite(totalPages) ? Math.max(1, Math.floor(totalPages)) : 1;
  const current = Number.isFinite(page) ? Math.min(Math.max(1, Math.floor(page)), count) : 1;
  const siblingCount = ADMIN_PAGE_NEIGHBOR_COUNT;
  const boundaryCount = ADMIN_PAGE_EDGE_COUNT;
  const startPages = pageNumbers(1, Math.min(boundaryCount, count));
  const endPages = pageNumbers(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);
  const siblingsStart = Math.max(
    Math.min(current - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages[0] !== undefined ? endPages[0] - 2 : count - 1,
  );
  const leadingGap: AdminPageItem[] =
    siblingsStart > boundaryCount + 2
      ? ['ellipsis']
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : [];
  const trailingGap: AdminPageItem[] =
    siblingsEnd < count - boundaryCount - 1
      ? ['ellipsis']
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : [];

  return [
    ...startPages,
    ...leadingGap,
    ...pageNumbers(siblingsStart, siblingsEnd),
    ...trailingGap,
    ...endPages,
  ];
}
