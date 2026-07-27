'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { deleteRegistration } from '@/lib/admin';
import { AdminSessionError, requireAdminSession, signIn, signOut } from '@/lib/auth';
import { startFullImportFromMootq } from '@/lib/integrations/mootq/full-import';
import { logger } from '@/lib/logger';
import { createRequestId } from '@/lib/security';

const GENERIC_AUTH_ERROR = 'Invalid email or password.';

export type LoginActionResult = { ok: true } | { ok: false; error: string };

/**
 * Credentials sign-in for the single administrator. Errors are intentionally generic.
 * Relies on Next.js Server Action origin checks (CSRF-safe) plus Auth.js CSRF on
 * `/api/auth/*` when credentials flow through Auth.js handlers.
 */
export async function loginAdminAction(formData: FormData): Promise<LoginActionResult> {
  const requestId = createRequestId();
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/admin',
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      logger.warn('Admin login failed', { requestId });
      return { ok: false, error: GENERIC_AUTH_ERROR };
    }
    throw error;
  }

  redirect('/admin');
}

/**
 * End the administrator session and return to login.
 */
export async function logoutAdminAction(): Promise<void> {
  await signOut({ redirectTo: '/admin/login' });
}

export type DeleteActionResult = { ok: true } | { ok: false; error: string };

/**
 * Hard-delete one registration after server-side session check.
 * Protected by Next.js Server Action CSRF/origin checks and session RBAC.
 */
export async function deleteRegistrationAction(
  registrationId: string,
): Promise<DeleteActionResult> {
  const requestId = createRequestId();

  try {
    await requireAdminSession({ verifyActiveInDb: true });
  } catch (error: unknown) {
    if (error instanceof AdminSessionError) {
      return { ok: false, error: 'Unauthorized.' };
    }
    throw error;
  }

  if (!registrationId || registrationId.length > 64) {
    return { ok: false, error: 'Invalid registration.' };
  }

  const result = await deleteRegistration(registrationId);
  if (!result.ok) {
    return { ok: false, error: 'Could not delete registration. It may already be gone.' };
  }

  logger.info('Admin deleted registration', { requestId, registrationId });
  return { ok: true };
}

export type ImportMootqActionResult =
  | { ok: true; runId: string; status: string }
  | { ok: false; error: string };

/**
 * Start a manual full import from Mootq when partner export credentials are configured.
 */
export async function importFullDataFromMootqAction(): Promise<ImportMootqActionResult> {
  const requestId = createRequestId();

  let adminEmail = 'admin';
  try {
    const session = await requireAdminSession({ verifyActiveInDb: true });
    adminEmail = session.email;
  } catch (error: unknown) {
    if (error instanceof AdminSessionError) {
      return { ok: false, error: 'Unauthorized.' };
    }
    throw error;
  }

  const result = await startFullImportFromMootq(adminEmail);
  if (!result.ok) {
    logger.info('Admin full import blocked or unavailable', { requestId });
    return { ok: false, error: result.error };
  }

  logger.info('Admin full import finished', {
    requestId,
    runId: result.runId,
    status: result.status,
  });
  return { ok: true, runId: result.runId, status: result.status };
}
