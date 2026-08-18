# Toon Expo Registration — technical specification

**Version:** 2.4

**Date:** 2026-08-18

**Status:** owner decisions recorded; Mootq v1 contract approved by Toon Expo, awaiting partner sign-off; Dexatel SMS approved

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
| [`13-TICKETING-AND-INTEGRATIONS.md`](./13-TICKETING-AND-INTEGRATIONS.md)   | Detailed QR, delivery, and internal recovery tools |
| [`14-MOOTQ-PARTNER-CONTRACT.md`](./14-MOOTQ-PARTNER-CONTRACT.md)           | Withdrawn — do not send                            |
| [`15-MOOTQ-HANDOFF.md`](./15-MOOTQ-HANDOFF.md)                             | Cover letter for Mootq                             |
| [`16-MOOTQ-INTEGRATION-CONTRACT.md`](./16-MOOTQ-INTEGRATION-CONTRACT.md)   | Partner-facing v1 contract (send this)             |

## Confirmed decisions

- Keep project size A and the existing Next.js/Vercel/Neon stack.
- Each system generates codes for registrations created on its own form.
- Every code is exactly 13 ASCII characters: `TE` or `MQ` prefix plus 11 uppercase alphanumeric body (`^(TE|MQ)[A-Z0-9]{11}$`).
- Toon Expo stores a Mootq-supplied code unchanged and does not return a replacement.
- Registration origin is the separate trusted `sourceSystem = TOON_EXPO | MOOTQ` field.
- Toon Expo delivers Resend email and Dexatel SMS only for `sourceSystem=TOON_EXPO`.
- Mootq delivers tickets for Mootq-origin visitors; Toon Expo only stores those records.
- QR payload is exactly `ticketCode`; hosted links use a separate private token.
- Partner v1 exchange is one full idempotent POST per registration (immediate TE → Mootq, nightly Mootq → TE).
- Cursor feed and full dump are internal recovery tools, not Mootq v1 obligations.
- Initial attendance is only `NOT_VISITED` or `VISITED`.
- PostgreSQL delivery jobs provide retry; no Redis, NATS or external broker is added.
- Same email and same phone MAY register multiple participants; accidental retries use an idempotency key.
- Hosted tickets use `reg.toonexpo.com`; Resend sender is `hi@mail.toonexpo.com`.
- Dexatel SMS is approved (`TOONEXPO` sender; API verified 2026-07-28).
- No visitor block/ban/revoke product workflow.

## Closed owner decisions (2026-07-27)

| Decision/input                                    | Resolution                                                                 |
| ------------------------------------------------- | -------------------------------------------------------------------------- |
| Repeated intentional registrations with one email | Allowed; also same phone allowed                                           |
| Email uniqueness DB constraint                    | Remove `(eventId, emailNormalized)` unique                                 |
| Accidental double-submit                          | Idempotency key                                                            |
| Mootq partner API                                 | [`16-MOOTQ-INTEGRATION-CONTRACT.md`](./16-MOOTQ-INTEGRATION-CONTRACT.md); await Mootq sign-off |
| `TE`/`MQ` prefixed scanner format (`^(TE\|MQ)[A-Z0-9]{11}$`) | Confirmed by Mootq with Toon Expo                                     |
| Dexatel SMS API                                   | Approved; existing Toon Expo account (`TOONEXPO`)                      |
| Resend pay-as-you-go/domain                       | Pro includes pay-as-you-go; `mail.toonexpo.com` verified; from `hi@mail.toonexpo.com` |
| Email/SMS copy and ticket domain                  | Interim designed email OK; SMS short localized; domain `reg.toonexpo.com` |
| Block/ban/deletion product features               | Out of scope — registration and ticket delivery only                       |
| Mootq v1 contract (2026-08-18)                    | Accept Mootq draft as base: full immediate TE→MQ POST, nightly MQ→TE, own-form ticket delivery only, ≤5 req/s, no feed/full-sync/attendance/WebSocket in v1. Send [`16`](./16-MOOTQ-INTEGRATION-CONTRACT.md). |

## Remaining inputs

| Input                                             | Impact                                      |
| ------------------------------------------------- | ------------------------------------------- |
| Mootq sign-off on [`16-MOOTQ-INTEGRATION-CONTRACT.md`](./16-MOOTQ-INTEGRATION-CONTRACT.md) | Push URL, credentials, nightly window |
| Final marketing email/SMS copy                    | Replace interim templates                   |
| DNS for `reg.toonexpo.com` at release             | Hosted ticket production URL                |

Pending partner field renames must not invent product behavior; adjust only transport naming after sign-off.

## Requirement language

- **MUST** — required for release.
- **SHOULD** — expected unless evidence supports another choice.
- **MAY** — optional.

## Change control

NestJS, Redis, an external queue, detailed check-in history, automated bilateral synchronization, capacity management or attendee accounts require an explicit scope review.
