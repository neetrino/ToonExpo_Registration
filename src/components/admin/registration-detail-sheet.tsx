'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import type { AdminRegistrationDetail } from '@/lib/admin/get-registration';
import { RegistrationDetailCard } from '@/components/admin/registration-detail-card';

type RegistrationDetailSheetProps = {
  registration: AdminRegistrationDetail;
  closeHref: string;
};

export function RegistrationDetailSheet({ registration, closeHref }: RegistrationDetailSheetProps) {
  const router = useRouter();

  const close = useCallback(() => {
    router.push(closeHref);
  }, [router, closeHref]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        close();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [close]);

  const fullName = `${registration.firstName} ${registration.lastName}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close registration details"
        className="absolute inset-0 bg-[#00303D]/45"
        onClick={close}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-detail-title"
        className="admin-sheet-enter relative z-10 flex h-full w-full max-w-[480px] flex-col border-l border-border/80 bg-background shadow-[-8px_0_32px_rgba(0,48,61,0.08)]"
      >
        <RegistrationDetailCard
          registration={registration}
          onClose={close}
          closeHref={closeHref}
          titleId="registration-detail-title"
          fullName={fullName}
        />
      </aside>
    </div>
  );
}
