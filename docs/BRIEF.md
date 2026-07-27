# Toon Expo Registration — brief

**Status:** owner decisions recorded 2026-07-27; Mootq partner contract draft in review; Peleka SMS deferred

**Updated:** 2026-07-27

## Product

Toon Expo Registration is the main registration and ticket-delivery application for Toon Expo. It accepts registrations on the Toon Expo form, creates a QR ticket, shows it immediately, and sends the same ticket through email (SMS later via Peleka).

Mootq operates a second registration form for roughly 10% of attendees and owns the scanning/check-in system. Mootq creates its own ticket codes in the shared 13-character format and shows them on its frontend. Toon Expo receives those registrations, stores the supplied code unchanged, and sends the matching QR through email (and later SMS).

## Responsibility boundary

| Capability                            | Toon Expo                                | Mootq                             |
| ------------------------------------- | ---------------------------------------- | --------------------------------- |
| Main public registration              | Owns                                     | No                                |
| Partner registration form             | No                                       | Owns                              |
| Code generation for own registrations | Owns                                     | Owns                              |
| Registration-source assignment        | Server assigns `TOON_EXPO`               | Toon Expo API assigns `MOOTQ`     |
| QR shown after Toon Expo registration | Owns                                     | No                                |
| QR shown after Mootq registration     | No                                       | Owns                              |
| Ticket email                          | Owns for both sources                    | Supplies recipient data           |
| Ticket SMS                            | Deferred (Peleka); planned for both      | Supplies recipient data           |
| Scanner/check-in                      | No                                       | Owns                              |
| Fast Toon Expo registration feed      | Exposes                                  | Polls                             |
| Full reconciliation data              | Exposes and imports independently        | Exposes and imports independently |

## Confirmed operating model

- Approximately 30,000 attendees over three event days.
- Planning peak: 1,000 registrations in ten minutes.
- Approximately 90% of registrations originate on Toon Expo and 10% on Mootq.
- The stack remains Next.js on Vercel with Neon PostgreSQL.
- No NestJS migration, Redis, NATS, Kafka, RabbitMQ or dedicated worker service is required for this scope.
- A ticket code is exactly 13 ASCII alphanumeric characters (`A-Z`, `a-z`, `0-9`).
- The code has no prefix and contains no registration-source information.
- Mootq confirmed the shared format: random 13 characters.
- Each source generates codes for its own registrations with cryptographically secure randomness.
- The raw QR payload is exactly `ticketCode`.
- `ticketCode` is globally unique and immutable in the Toon Expo database.
- A unique database constraint and bounded retry protect Toon Expo generation from collisions.
- Registration origin is stored separately as `sourceSystem = TOON_EXPO | MOOTQ`; it is never inferred from the code.
- QR PNG/SVG output is generated from the code and is not stored as a database blob.
- A separate long private token protects the hosted ticket link used by email and SMS.
- The same email and the same phone MAY be used for multiple intentional registrations (multiple participants / tickets). Accidental double-submit protection MUST use an idempotency key, not email or phone uniqueness.
- Product scope is registration and ticket delivery. No visitor block/ban, revoke, or soft-delete lifecycle is in scope.

## Registration flows

### Toon Expo source

1. Toon Expo validates and saves the registration.
2. Toon Expo generates and stores a unique 13-character ticket code and assigns `sourceSystem=TOON_EXPO`.
3. The success page shows the QR immediately.
4. Email delivery jobs are saved (SMS jobs when Peleka is enabled).
5. Mootq later pulls the minimal Toon Expo-origin registration through the fast cursor feed.

### Mootq source

1. Mootq validates its form, generates a 13-character ticket code and shows its QR.
2. Mootq sends the exact code plus the minimum recipient data to Toon Expo.
3. The authenticated Mootq endpoint assigns `sourceSystem=MOOTQ` and stores the supplied code unchanged.
4. Toon Expo creates email delivery jobs for the same code (SMS when Peleka is enabled).
5. Toon Expo acknowledges persistence with an HTTP status; it does not issue or return a replacement ticket code.

## Ticket delivery

- The success page is immediate and does not wait for email/SMS providers.
- Email uses Resend Pro with pay-as-you-go included; production sender is `hi@mail.toonexpo.com` on verified domain `mail.toonexpo.com`.
- Email contains an inline QR image, readable code and a link to the hosted ticket page.
- Hosted ticket pages use production domain `reg.toonexpo.com` (planned).
- Interim email copy may use a polished designed template until final marketing copy is approved; SMS copy will be short when SMS ships.
- SMS through Peleka is deferred; implementation continues without SMS until the Peleka contract is ready.
- Provider failures do not remove the registration or ticket.
- A small PostgreSQL delivery-job table provides durable retry; no external queue is introduced.
- The process-local `5 / 10 minutes / IP` registration limiter is removed; public abuse protection relies on honeypot, origin/body validation and Vercel WAF.

## Partner data exchange

### Fast operational exchange

- Mootq posts each Mootq-origin registration to Toon Expo after its own registration succeeds.
- Mootq polls Toon Expo's incremental Toon Expo-origin feed at a frequency controlled entirely by Mootq.
- Expected polling may be rare before the event and approximately every three seconds during the event.
- Toon Expo has no environment variable or admin switch for the partner's polling frequency.
- Fast payloads contain only stable IDs, ticket code, first/last name, email and phone.
- Implementation starts from the draft contract in [`technical-specification/14-MOOTQ-PARTNER-CONTRACT.md`](./technical-specification/14-MOOTQ-PARTNER-CONTRACT.md); field names/URLs are finalized with Mootq from that single document.

### Full reconciliation

- Each company starts its own full synchronization independently.
- Toon Expo has a manual admin action to import full data from Mootq.
- Mootq may request a paginated full export from Toon Expo whenever it chooses.
- Every full record carries its stored `sourceSystem`; full exchange may contain records from both origins.
- Full records are matched primarily by immutable `ticketCode`, with explicit `sourceSystem` and source/external IDs retained for ownership, idempotency and diagnostics.
- Full synchronization may include questionnaire data and the minimal attendance status `NOT_VISITED` or `VISITED`.
- Every full import/export run has a stored history with direction, status, counts, cursor and a bounded error summary.
- A full synchronization is required after the event; additional runs are allowed when needed.
- Full sync also starts from the same partner contract draft and is adjusted after Mootq sign-off.

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
- Peleka SMS in the first implementation slice (deferred, not cancelled).

## Remaining inputs

1. Mootq sign-off on the single partner contract draft (fast + full field names, URLs, auth).
2. Peleka API contract when SMS is unblocked.
3. Final marketing email/SMS copy (interim designed email template is acceptable to ship).
4. Confirm production DNS for `reg.toonexpo.com` points at the app for hosted tickets.
