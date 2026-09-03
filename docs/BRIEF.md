# Toon Expo Registration — brief

**Status:** owner decisions recorded 2026-07-28; Mootq v1 contract signed off 2026-08-31; Dexatel SMS approved

**Updated:** 2026-08-18

## Product

Toon Expo Registration is the main registration and ticket-delivery application for Toon Expo. It accepts registrations on the Toon Expo form, creates a QR ticket, shows it immediately, and sends the same ticket through email and Dexatel SMS.

Mootq operates a second registration form for roughly 10% of attendees and owns the scanning/check-in system. Mootq creates its own `MQ…` ticket codes in the shared prefixed format, shows them on its frontend, and delivers those tickets. Toon Expo receives those registrations nightly, stores the supplied code unchanged, and does not email or SMS those visitors.

## Responsibility boundary

| Capability                            | Toon Expo                                | Mootq                             |
| ------------------------------------- | ---------------------------------------- | --------------------------------- |
| Main public registration              | Owns                                     | No                                |
| Partner registration form             | No                                       | Owns                              |
| Code generation for own registrations | Owns                                     | Owns                              |
| Registration-source assignment        | Server assigns `TOON_EXPO`               | Toon Expo API assigns `MOOTQ`     |
| QR shown after Toon Expo registration | Owns                                     | No                                |
| QR shown after Mootq registration     | No                                       | Owns                              |
| Ticket email                          | Owns for Toon Expo-origin only           | Owns for Mootq-origin only        |
| Ticket SMS                            | Owns for Toon Expo-origin only (Dexatel) | Owns for Mootq-origin only        |
| Scanner/check-in                      | No                                       | Owns                              |
| Toon Expo registration push           | Immediate full POST after registration   | Receives at Mootq URL             |
| Mootq registration delivery           | Stores nightly POST                      | Sends nightly                     |
| Cursor feed / full dump               | Internal recovery only                   | Not a v1 obligation               |

## Confirmed operating model

- Approximately 30,000 attendees over three event days.
- Planning peak: 1,000 registrations in ten minutes.
- Approximately 90% of registrations originate on Toon Expo and 10% on Mootq.
- The stack remains Next.js on Vercel with Neon PostgreSQL.
- No NestJS migration, Redis, NATS, Kafka, RabbitMQ or dedicated worker service is required for this scope.
- A ticket code is exactly 13 ASCII characters: `TE` (Toon Expo) or `MQ` (Mootq) plus 11 uppercase alphanumeric body characters (`A-Z0-9`).
- Format regex: `^(TE|MQ)[A-Z0-9]{11}$`; case-sensitive exact match (uppercase).
- Toon Expo generates only `TE…` codes; Mootq generates only `MQ…` codes.
- Each source generates codes for its own registrations with cryptographically secure randomness.
- The raw QR payload is exactly `ticketCode`.
- `ticketCode` is globally unique and immutable in the Toon Expo database.
- A unique database constraint and bounded retry protect Toon Expo generation from collisions.
- Registration origin is stored separately as `sourceSystem = TOON_EXPO | MOOTQ`; it is never inferred from the prefix alone.
- QR PNG/SVG output is generated from the code and is not stored as a database blob.
- A separate long private token protects the hosted ticket link used by email and SMS.
- The same email and the same phone MAY be used for multiple intentional registrations (multiple participants / tickets). Accidental double-submit protection MUST use an idempotency key, not email or phone uniqueness.
- Product scope is registration and ticket delivery. No visitor block/ban, revoke, or soft-delete lifecycle is in scope.

## Registration flows

### Toon Expo source

1. Toon Expo validates and saves the registration.
2. Toon Expo generates and stores a unique `TE…` ticket code and assigns `sourceSystem=TOON_EXPO`.
3. The success page shows the QR immediately.
4. Email and SMS delivery jobs are saved when providers are configured.
5. Toon Expo pushes the full registration to Mootq after the HTTP response (identity, locale, answers, optional UTM).

### Mootq source

1. Mootq validates its form, generates an `MQ…` ticket code and shows its QR.
2. Mootq delivers that ticket to the visitor.
3. A nightly job POSTs the full record to Toon Expo.
4. The authenticated endpoint assigns `sourceSystem=MOOTQ` and stores the supplied code unchanged.
5. Toon Expo acknowledges persistence with `204` and does not send email, SMS, or a replacement ticket code.

## Ticket delivery

- The success page is immediate and does not wait for email/SMS providers.
- Email uses Resend Pro with pay-as-you-go included; production sender is `hi@mail.toonexpo.com` on verified domain `mail.toonexpo.com`.
- Email contains an inline QR image, readable code and a link to the hosted ticket page.
- Hosted ticket pages use production domain `reg.toonexpo.com` (planned).
- Interim email copy may use a polished designed template until final marketing copy is approved; SMS copy is short and localized.
- SMS uses Dexatel (`TOONEXPO` sender) with the hosted-ticket link; API verified 2026-07-28.
- Provider failures do not remove the registration or ticket.
- A small PostgreSQL delivery-job table provides durable retry; no external queue is introduced.
- The process-local `5 / 10 minutes / IP` registration limiter is removed; public abuse protection relies on honeypot, origin/body validation and Vercel WAF.

## Partner data exchange

### Partner exchange (v1)

Normative document: [`technical-specification/16-MOOTQ-INTEGRATION-CONTRACT.md`](./technical-specification/16-MOOTQ-INTEGRATION-CONTRACT.md). Cover letter: [`technical-specification/15-MOOTQ-HANDOFF.md`](./technical-specification/15-MOOTQ-HANDOFF.md).

- Toon Expo pushes each Toon Expo-origin registration to Mootq immediately after the visitor HTTP response. Body is full (name, email, phone, `locale`, flattened `answers`, optional UTM). Header `Idempotency-Key` is the Toon Expo registration id. Maximum 5 requests/second.
- Mootq posts each Mootq-origin registration to Toon Expo in a nightly batch.
- Toon Expo has no event-day mode switch and does not use WebSocket or continuous polling.
- Cursor feed and full dump stay as internal recovery tools. They are not v1 partner obligations.
- Attendance inbound is not in v1.

## Explicit exclusions

- Toon Expo-operated scanning/check-in UI.
- Detailed scan-event history in the first release.
- Automatic cross-system scheduling of full synchronization.
- A partner polling-frequency switch in Toon Expo admin or environment variables.
- Payments, attendee accounts, capacity limits and waiting lists.
- Participant self-service editing.
- Visitor block/ban, ticket revoke/cancellation workflow, or soft-delete lifecycle.
- External message brokers or a separate backend service.
- Storing QR image binaries in PostgreSQL.

## Remaining inputs

1. Mootq provision of `MOOTQ_PUSH_URL` and `MOOTQ_PUSH_KEY`.
2. Final marketing email/SMS copy (interim designed email template is acceptable to ship).
3. Confirm production DNS for `reg.toonexpo.com` points at the app for hosted tickets.
