import { auth } from '@/lib/auth/auth';

export type AdminSession = {
  userId: string;
  email: string;
  role: 'ADMIN';
};

/**
 * Returns the active admin session or null when unauthenticated / inactive role.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await auth();
  const user = session?.user;

  if (!user?.id || user.role !== 'ADMIN' || !user.email) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    role: 'ADMIN',
  };
}
