/**
 * True when the pathname is an admin route that requires an authenticated session.
 */
export function isProtectedAdminPath(pathname: string): boolean {
  if (!pathname.startsWith('/admin')) {
    return false;
  }

  return pathname !== '/admin/login' && !pathname.startsWith('/admin/login/');
}
