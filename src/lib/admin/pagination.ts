import { ADMIN_PAGE_SIZE } from '@/lib/admin/constants';

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
