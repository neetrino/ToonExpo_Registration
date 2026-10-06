import type { ReactNode } from 'react';

type IconProps = {
  className?: string;
};

function IconFrame({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
    </IconFrame>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 8v4.5l3 2" />
    </IconFrame>
  );
}

export function PinIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
      <circle cx="12" cy="11" r="2" />
    </IconFrame>
  );
}

export function TicketIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M4.5 8.2A2.2 2.2 0 0 1 6.7 6h10.6a2.2 2.2 0 0 1 2.2 2.2v1.1a1.8 1.8 0 0 0 0 3.4v1.1a2.2 2.2 0 0 1-2.2 2.2H6.7a2.2 2.2 0 0 1-2.2-2.2v-1.1a1.8 1.8 0 0 0 0-3.4V8.2z" />
      <path d="M12 8.2v7.6" />
    </IconFrame>
  );
}

export function ProjectsIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M4 20.5h16" />
      <path d="M6.5 20.5V6.8A1.3 1.3 0 0 1 7.8 5.5h4.4a1.3 1.3 0 0 1 1.3 1.3v13.7" />
      <path d="M13.5 11h2.7a1.3 1.3 0 0 1 1.3 1.3v8.2" />
      <path d="M8.8 9h2M8.8 12.5h2M8.8 16h2" />
    </IconFrame>
  );
}

export function OfferIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M12.2 4.8h5.1a1 1 0 0 1 1 1v5.1a1 1 0 0 1-.3.7l-7.4 7.4a1.4 1.4 0 0 1-2 0l-4.4-4.4a1.4 1.4 0 0 1 0-2l7.4-7.4a1 1 0 0 1 .6-.4z" />
      <circle cx="16.1" cy="8.2" r="0.9" />
    </IconFrame>
  );
}

export function DevelopersIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="9" cy="9" r="2.4" />
      <circle cx="16" cy="10" r="1.9" />
      <path d="M4.6 18.4c.6-2.3 2.3-3.6 4.4-3.6s3.8 1.3 4.4 3.6" />
      <path d="M13.6 14.9c1.1-.4 2.3-.3 3.3.4.9.6 1.5 1.7 1.8 3.1" />
    </IconFrame>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M6 16.4h12l-1.2-1.5V11a4.8 4.8 0 0 0-9.6 0v3.9L6 16.4z" />
      <path d="M10 16.4a2 2 0 0 0 4 0" />
    </IconFrame>
  );
}
