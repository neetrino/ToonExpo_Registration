import type { Metadata } from 'next';
import { ToonExpoLogo } from '@/components/brand/toon-expo-logo';
import { AdminLoginForm } from '@/components/admin/admin-login-form';

export const metadata: Metadata = {
  title: 'Admin login — TOON EXPO Registration',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-primary px-4 py-10">
      <div className="admin-login-enter w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <ToonExpoLogo size={36} inverted priority className="shrink-0" />
          <span className="font-display text-base font-bold tracking-tight text-white sm:text-lg">
            TOON EXPO
          </span>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-[0_8px_32px_rgba(0,48,61,0.12)] md:p-10">
          <div className="mb-8 text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              Admin
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-primary">Sign in</h1>
          </div>
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
