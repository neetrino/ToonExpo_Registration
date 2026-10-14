import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { RegistrationCompleteTracker } from '@/components/analytics/registration-complete-tracker';
import { SuccessTicketCard } from '@/components/registration/success-ticket-card';

type SuccessPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SuccessPage({ params }: SuccessPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-4 md:py-6">
      <RegistrationCompleteTracker />
      <div className="success-card-enter my-auto w-full max-w-md">
        <div
          role="status"
          className="flex flex-col items-center rounded-2xl border border-border/80 bg-card px-5 py-4 text-center shadow-[0_8px_32px_rgba(0,48,61,0.12)] md:px-8 md:py-6"
        >
          <div
            className="success-check-enter flex size-11 items-center justify-center rounded-full bg-success/15 md:size-14"
            aria-hidden="true"
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-success md:size-10">
              <svg
                viewBox="0 0 24 24"
                className="size-5 text-white md:size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12.5 9.5 17 19 7.5" />
              </svg>
            </div>
          </div>

          <Suspense fallback={null}>
            <SuccessTicketCard />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
