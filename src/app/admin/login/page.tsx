import type { Metadata } from 'next';
import { AdminLoginForm } from '@/components/admin/admin-login-form';

export const metadata: Metadata = {
  title: 'Admin login — Toon Expo Registration',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return (
    <section className="mx-auto max-w-md rounded-lg border border-border bg-background p-6">
      <h1 className="text-2xl font-bold text-primary">Admin login</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in with the seeded administrator account.
      </p>
      <AdminLoginForm />
    </section>
  );
}
