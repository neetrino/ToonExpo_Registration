import { redirect } from 'next/navigation';
import { getPrisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getAdminSession, type AdminSession } from '@/lib/auth/guards';

/**
 * Thrown by `requireAdminSession` when `redirectOnFailure` is not set and no
 * valid (and, when requested, active) admin session exists.
 */
export class AdminSessionError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AdminSessionError';
  }
}

export type RequireAdminSessionOptions = {
  /**
   * Re-check in the database that the admin account still exists and is
   * `isActive`. Required for mutating entry points (server actions, delete,
   * export) so a deactivated admin cannot act on a still-valid JWT before
   * the session naturally expires. Skip for read-only page loaders to avoid
   * an extra query on every render.
   */
  verifyActiveInDb?: boolean;
  /**
   * Redirect to `/admin/login` instead of throwing. Use for page entry
   * points (Server Components); use the default (throw) for server actions
   * and route handlers so callers can convert it into a typed error result.
   */
  redirectOnFailure?: boolean;
};

/**
 * Defense-in-depth session guard for admin entry points.
 *
 * Middleware already blocks unauthenticated requests to `/admin/*`, but each
 * entry point (page, server action, route handler) must independently
 * verify the session instead of relying solely on middleware. Call this at
 * the top of every admin page, server action, and route handler.
 */
export async function requireAdminSession(
  options: RequireAdminSessionOptions = {},
): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    return failOrThrow(options);
  }

  if (options.verifyActiveInDb) {
    const prisma = getPrisma();
    const admin = await prisma.admin.findUnique({
      where: { id: session.userId },
      select: { isActive: true },
    });

    if (!admin?.isActive) {
      logger.warn('Admin session rejected: account inactive or deleted', {
        adminId: session.userId,
      });
      return failOrThrow(options);
    }
  }

  return session;
}

function failOrThrow(options: RequireAdminSessionOptions): never {
  if (options.redirectOnFailure) {
    redirect('/admin/login');
  }
  throw new AdminSessionError();
}
