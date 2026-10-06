'use client';

import type { ReactNode } from 'react';
import { scrollToSection } from '@/components/layout/scroll-to-section';

type SectionLinkProps = {
  sectionId: string;
  className?: string;
  children: ReactNode;
};

/** Same-page jump. The hash is not kept, so a refresh starts at the top. */
export function SectionLink({ sectionId, className, children }: SectionLinkProps) {
  return (
    <a
      href={`#${sectionId}`}
      className={className}
      onClick={(event) => scrollToSection(event, sectionId)}
    >
      {children}
    </a>
  );
}
