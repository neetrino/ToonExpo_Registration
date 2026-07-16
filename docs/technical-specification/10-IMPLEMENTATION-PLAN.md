# Implementation plan

No production deployment or production database migration is authorized by this plan. Each phase is verified before the next begins.

## Phase 0 — content and design intake

- Obtain confirmed date, venue, address and time zone.
- Obtain approved logo/hero/social assets and permission/source copies.
- Obtain final privacy/controller/retention text.
- Prepare Armenian, English and Russian copy matrix.
- Approve landing wireframe/design direction.

## Phase 1 — project foundation

- Scaffold approved Next.js/pnpm/TypeScript/Tailwind stack.
- Configure shadcn/ui theme and Toon Expo design tokens.
- Add locale routing and translation validation.
- Establish environment schema and `.env.example`.
- Configure format, lint, typecheck, tests and CI baseline.

## Phase 2 — database and server core

- Finalize hard/soft deletion policy.
- Create Prisma schema and reviewed migration using the safe database migration workflow.
- Configure Neon pooled runtime access and separate migration/runtime roles.
- Implement normalization, validation and registration service.
- Add concurrency/duplicate integration tests.

## Phase 3 — landing and registration UX

- Implement responsive localized landing sections.
- Implement accessible registration form and error/success states.
- Add privacy page/link, metadata and social sharing.
- Verify zero DB work for static page rendering.

## Phase 4 — email

- Build localized Resend templates.
- Persist delivery state outside registration validity.
- Implement timeout/failure behavior and redacted logging.
- Test with Resend non-production configuration.

## Phase 5 — administrator

- Seed one administrator safely.
- Implement Auth.js session and protected routes.
- Build total, search, pagination and newest-first table.
- Implement confirmed deletion and formula-safe CSV export.
- Test authorization on pages and endpoints.

## Phase 6 — hardening and verification

- Apply security headers and server boundaries.
- Perform accessibility and responsive checks in all languages.
- Run unit/integration/E2E suites and production build.
- Run authorized Preview burst test; record Vercel/Neon evidence.
- Review logs for PII leakage.

## Phase 7 — owner-operated production preparation

- Complete [`11-VERCEL-PRODUCTION-CHECKLIST.md`](./11-VERCEL-PRODUCTION-CHECKLIST.md).
- Configure Neon and Resend production resources.
- Add Vercel Production secrets and domain.
- Publish and verify WAF rule.
- Apply reviewed production migration through the approved release process.
- Perform smoke test, alert check and rollback readiness review.

## Phase 8 — launch observation

- Monitor registration errors, latency, WAF activity, Neon connections and email delivery.
- Compare admin count with database and Resend observations.
- Adjust WAF threshold only from evidence and record the change.
- Capture post-launch issues without expanding MVP scope silently.
