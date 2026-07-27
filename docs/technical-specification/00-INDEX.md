# Toon Expo Registration — technical specification

**Version:** 2.2

**Date:** 2026-07-27

**Status:** working scope agreed; duplicate-email rule and exact external contracts pending

## Document map

| Document                                                                   | Purpose                                            |
| -------------------------------------------------------------------------- | -------------------------------------------------- |
| [`01-PRODUCT-SCOPE.md`](./01-PRODUCT-SCOPE.md)                             | Actors, responsibility boundary and exclusions     |
| [`02-FUNCTIONAL-REQUIREMENTS.md`](./02-FUNCTIONAL-REQUIREMENTS.md)         | Testable product and integration requirements      |
| [`03-USER-FLOWS.md`](./03-USER-FLOWS.md)                                   | Toon Expo, Mootq, delivery and sync flows          |
| [`04-DATA-MODEL.md`](./04-DATA-MODEL.md)                                   | Minimal schema additions and migration boundary    |
| [`05-API-AND-VALIDATION.md`](./05-API-AND-VALIDATION.md)                   | Public, fast and full exchange contracts           |
| [`06-ADMIN-PANEL.md`](./06-ADMIN-PANEL.md)                                 | Existing admin plus delivery and sync operations   |
| [`07-SECURITY-AND-PRIVACY.md`](./07-SECURITY-AND-PRIVACY.md)               | PII, ticket links, partner access and logging      |
| [`08-NON-FUNCTIONAL-REQUIREMENTS.md`](./08-NON-FUNCTIONAL-REQUIREMENTS.md) | Scale, reliability and operability                 |
| [`09-ACCEPTANCE-CRITERIA.md`](./09-ACCEPTANCE-CRITERIA.md)                 | Release definition of done                         |
| [`10-IMPLEMENTATION-PLAN.md`](./10-IMPLEMENTATION-PLAN.md)                 | Minimal safe delivery order                        |
| [`11-VERCEL-PRODUCTION-CHECKLIST.md`](./11-VERCEL-PRODUCTION-CHECKLIST.md) | Owner-operated production checklist                |
| [`12-DESIGN-DIRECTION.md`](./12-DESIGN-DIRECTION.md)                       | Public, ticket and admin visual direction          |
| [`13-TICKETING-AND-INTEGRATIONS.md`](./13-TICKETING-AND-INTEGRATIONS.md)   | Detailed QR, delivery, fast exchange and full sync |

## Confirmed decisions

- Keep project size A and the existing Next.js/Vercel/Neon stack.
- Each system generates codes for registrations created on its own form.
- Every code is exactly 13 ASCII alphanumeric characters with no prefix or embedded source meaning.
- Toon Expo stores a Mootq-supplied code unchanged and does not return a replacement.
- Registration origin is the separate trusted `sourceSystem = TOON_EXPO | MOOTQ` field.
- Toon Expo delivers the stored code through Resend email and Peleka SMS for both sources.
- QR payload is exactly `ticketCode`; hosted links use a separate private token.
- Fast exchange contains minimum operational data.
- Mootq independently controls fast-feed polling frequency.
- Full exchange is manual, paginated and independently initiated by each company.
- Initial attendance is only `NOT_VISITED` or `VISITED`.
- PostgreSQL delivery jobs provide retry; no Redis, NATS or external broker is added.

## Open decisions

| Decision/input                                    | Impact                                                                |
| ------------------------------------------------- | --------------------------------------------------------------------- |
| Repeated intentional registrations with one email | Database constraint, public retry semantics and cross-source handling |
| Mootq fast/full API field names and URLs          | Final integration code and fixtures                                   |
| Prefixless 13-character scanner sample            | Final scanner fixture                                                 |
| Peleka API contract                               | SMS adapter and retry categories                                      |
| Resend pay-as-you-go/domain setup                 | Production email readiness                                            |
| Data sharing, retention and deletion              | Privacy and admin behavior                                            |

Pending decisions must stay marked as pending; implementation must not guess them.

## Requirement language

- **MUST** — required for release.
- **SHOULD** — expected unless evidence supports another choice.
- **MAY** — optional.

## Change control

NestJS, Redis, an external queue, detailed check-in history, automated bilateral synchronization, capacity management or attendee accounts require an explicit scope review.
