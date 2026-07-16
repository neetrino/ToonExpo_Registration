# Toon Expo Registration — technical specification

**Version:** 1.0

**Date:** 2026-07-16

**Status:** approved baseline; content inputs pending

## Document map

| Document | Purpose |
|---|---|
| [`01-PRODUCT-SCOPE.md`](./01-PRODUCT-SCOPE.md) | Product goal, audience, MVP and exclusions |
| [`02-FUNCTIONAL-REQUIREMENTS.md`](./02-FUNCTIONAL-REQUIREMENTS.md) | Testable public and administrator requirements |
| [`03-USER-FLOWS.md`](./03-USER-FLOWS.md) | Visitor and administrator flows |
| [`04-DATA-MODEL.md`](./04-DATA-MODEL.md) | Entities, constraints and future questionnaire path |
| [`05-API-AND-VALIDATION.md`](./05-API-AND-VALIDATION.md) | API contract, normalization, errors and idempotency |
| [`06-ADMIN-PANEL.md`](./06-ADMIN-PANEL.md) | Single-admin dashboard specification |
| [`07-SECURITY-AND-PRIVACY.md`](./07-SECURITY-AND-PRIVACY.md) | Security controls and personal-data handling |
| [`08-NON-FUNCTIONAL-REQUIREMENTS.md`](./08-NON-FUNCTIONAL-REQUIREMENTS.md) | Performance, reliability, accessibility and observability |
| [`09-ACCEPTANCE-CRITERIA.md`](./09-ACCEPTANCE-CRITERIA.md) | Definition of done for MVP |
| [`10-IMPLEMENTATION-PLAN.md`](./10-IMPLEMENTATION-PLAN.md) | Authorized delivery sequence |
| [`11-VERCEL-PRODUCTION-CHECKLIST.md`](./11-VERCEL-PRODUCTION-CHECKLIST.md) | Short list of manual production actions |
| [`12-DESIGN-DIRECTION.md`](./12-DESIGN-DIRECTION.md) | Visual direction for the public landing page and admin panel |

## Confirmed decisions

- Product name: Toon Expo.
- Public languages: Armenian, English and Russian.
- Project size A.
- Full-stack Next.js on Vercel with Neon PostgreSQL.
- Email confirmation through Resend.
- One administrator; no participant editing.
- No capacity limit, waiting list or registration statuses.
- No Redis in MVP.
- Vercel CDN for public static content and Vercel WAF for registration rate limiting.

## Pending owner inputs

| Input | Impact |
|---|---|
| Exact event date/time | Landing content and confirmation email |
| Confirmed venue name/address/map link | Landing content and email |
| Final copy in all three languages | Content acceptance |
| Approved brand asset source files | Visual implementation |
| Privacy text and data-controller details | Legal acceptance |
| Hard-delete or audited soft-delete policy | Database migration and privacy behavior |
| Administrator interface language | Admin UI content |
| Production domain | Vercel, Auth.js, email links and SEO |
| Resend sender domain/address | Email production readiness |
| Initial administrator email/password handoff method | Admin activation |

Pending content must use explicit placeholders in development and must never be silently invented.

## Requirement language

- **MUST** means required for MVP acceptance.
- **SHOULD** means expected unless implementation evidence justifies an alternative.
- **MAY** means optional and non-blocking.

## Change control

Any addition of payments, attendee accounts, ticketing, capacity management, survey construction, additional administrator roles or a separate backend requires scope review and an update to the TECH_CARD before implementation.
