# Ticketing, delivery and Mootq integration

**Status:** partner v1 contract approved by Toon Expo 2026-08-18; awaiting Mootq sign-off; Dexatel SMS approved

## Owner notes (2026-08-18)

- Same email/phone may register multiple participants.
- Scanner format confirmed: `TE` or `MQ` prefix plus 11 uppercase alphanumeric characters (`^(TE|MQ)[A-Z0-9]{11}$`).
- Partner-facing contract: [`16-MOOTQ-INTEGRATION-CONTRACT.md`](./16-MOOTQ-INTEGRATION-CONTRACT.md). Cover: [`15-MOOTQ-HANDOFF.md`](./15-MOOTQ-HANDOFF.md). Document `14` is withdrawn.
- TE → Mootq: immediate full POST (identity + `locale` + flattened `answers` + optional UTM); max 5 req/s; outbox + retry.
- Mootq → TE: nightly full POST; Toon Expo stores only; no email/SMS to those visitors.
- Cursor feed and full sync remain internal recovery tools; they are not v1 partner obligations.
- Attendance inbound is not in v1.
- SMS via Dexatel is approved (`TOONEXPO` sender; API verified 2026-07-28) for Toon Expo-origin tickets only.
- Hosted ticket domain: `reg.toonexpo.com`. Resend from `hi@mail.toonexpo.com`.
- No block/ban/revoke product features.

## 1. Ticket ownership and registration source

| Registration form | Code issuer | Stored `sourceSystem` | Toon Expo behavior                    |
| ----------------- | ----------- | --------------------- | ------------------------------------- |
| Toon Expo         | Toon Expo   | `TOON_EXPO`           | Generate, store, display and deliver  |
| Mootq             | Mootq       | `MOOTQ`               | Validate and store unchanged; do not deliver |

All codes are exactly 13 ASCII characters: a 2-letter prefix (`TE` for Toon Expo, `MQ` for Mootq) plus 11 uppercase alphanumeric body characters matching `^(TE|MQ)[A-Z0-9]{11}$`. They are case-sensitive and compared exactly as issued. The prefix identifies the issuing system visually but is not a substitute for `sourceSystem`; origin is always stored and synchronized as the separate `sourceSystem` field.

Each issuer uses cryptographically secure randomness for registrations created on its own form. Toon Expo generates only `TE…` codes. Mootq generates only `MQ…` codes.

The Toon Expo generator samples uniformly from `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ` with Node.js cryptographic randomness such as `crypto.randomInt`; it never uses `Math.random`. Mootq may implement its generator independently but must produce the same external format.

`ticketCode` is:

- immutable;
- globally unique in Toon Expo PostgreSQL;
- the exact QR payload;
- the main cross-system reconciliation key;
- never replaced during import or retry.

`sourceSystem` is the canonical origin marker:

- public Toon Expo registration assigns `TOON_EXPO` server-side;
- the authenticated Mootq inbound endpoint assigns `MOOTQ` server-side;
- neither public nor partner request bodies may select or override it;
- admin metrics, filtering and synchronization use this field, never code parsing alone.

Toon Expo generation is protected by a unique database constraint and bounded regeneration after an insert collision. A supplied Mootq code that already belongs to another registration returns `409`; Toon Expo does not invent a replacement.

## 2. QR and hosted ticket

- Generate QR images in memory from the exact stored code.
- Use the scanner-tested dimensions, quiet zone and error-correction setting.
- Show QR and readable code immediately after a Toon Expo registration.
- Mootq renders its own QR from the same code on its frontend.
- Email renders the code as an inline QR image.
- SMS links to a private hosted-ticket page.
- The hosted page renders the same code and supports PNG download.
- QR image binaries are not stored in PostgreSQL.

The hosted page uses an independent long random `ticketViewToken`. This token is not sent to Mootq and is not encoded in the scanner QR.

## 3. Toon Expo registration transaction

In one short PostgreSQL transaction:

1. create the validated registration;
2. assign `sourceSystem=TOON_EXPO`;
3. generate/store a unique `TE…` ticket code;
4. generate/store the hosted-ticket token;
5. create EMAIL and SMS delivery jobs;
6. append one outbox row for Mootq push;
7. optionally record an internal fast-feed event (recovery only; not a partner obligation).

Commit before provider calls and before outbound push. Return the stored code to the Toon Expo browser for immediate display.

After the HTTP response, Toon Expo sends one full-body push per outbox row to Mootq, at most five requests per second. A cron retries unsent or failed outbox rows when `MOOTQ_PUSH_*` is configured (not scheduled until Mootq provides the endpoint).

## 4. Mootq registration import

Mootq creates and displays the QR on its own side. It sends each registration to Toon Expo in a nightly batch. Exact fields: [`16-MOOTQ-INTEGRATION-CONTRACT.md`](./16-MOOTQ-INTEGRATION-CONTRACT.md) §6.

```http
POST https://reg.toonexpo.com/api/v1/integrations/mootq/registrations
Authorization: Bearer <mootq-write-key>
Content-Type: application/json
```

Required behavior:

- require the event-bound write credential;
- validate body size and schema (`registeredAt` and `locale` required; `answers` optional);
- assign `sourceSystem=MOOTQ` from the authenticated route;
- reject any body field that attempts to choose the source;
- require `^MQ[A-Z0-9]{11}$`;
- make `sourceRegistrationId` idempotent;
- store the supplied code unchanged;
- accept unknown `answers` keys without rejecting the ticket;
- do not create EMAIL or SMS delivery jobs;
- return `204` with no ticket business payload.

Shared email/phone are allowed. Transport idempotency is `sourceRegistrationId`.

## 5. Toon Expo → Mootq push (primary)

Toon Expo pushes each Toon Expo-origin registration to Mootq after the visitor response completes. Body is the full contract payload (identity, `locale`, flattened `answers`, optional UTM). `sourceRegistrationId` is sent only as `Idempotency-Key`. Rate limit: maximum 5 requests/second. Details: contract §5 and Appendix A.

Mootq must provide `MOOTQ_PUSH_URL` and `MOOTQ_PUSH_KEY`. PostgreSQL outbox + `after()` is the first attempt; cron retries when those credentials exist.

There is no event-day mode switch. HTTP POST only; no WebSocket.

## 6. Internal recovery feed (not a partner obligation)

The authenticated cursor GET and full import/export endpoints may remain in the Toon Expo codebase for operator recovery. They are not v1 obligations on Mootq and must not be described as required in partner mail.

Email and SMS below apply only to `sourceSystem=TOON_EXPO`.

## 7. Ticket email

Resend email contains:

- localized subject and copy;
- inline CID QR generated from `ticketCode`;
- readable ticket code;
- absolute hosted-ticket link;
- approved event/support information.

The current Resend Pro plan provides 50,000 monthly emails. Production readiness requires verified sender-domain authentication, confirmation of pay-as-you-go status and monitoring of quota/rate responses.

## 8. Dexatel SMS

SMS contains a short localized message and the absolute hosted-ticket link.

Dexatel integration uses the existing Toon Expo account and alphanumeric sender `TOONEXPO`:

- API authentication via `X-Dexatel-Key` (`DEXATEL_API_KEY`);
- phone numbers as digits with country code (from E.164 `phoneNormalized`);
- `POST /v1/messages` channel `SMS`, `from=TOONEXPO`;
- retryable vs permanent errors from HTTP status (429/5xx vs 4xx);
- provider message ID stored on `DeliveryJob` when available.

Dexatel provider calls use the same PostgreSQL `DeliveryJob` mechanism as email.

## 9. Delivery jobs

`DeliveryJob` is not a general event bus. It exists only to avoid losing or synchronously blocking ticket messages.

Minimum fields:

- registration ID;
- channel `EMAIL` or `SMS`;
- status `PENDING`, `PROCESSING`, `SENT` or `FAILED`;
- attempt count and next-attempt time;
- provider message ID when available;
- last safe error category;
- timestamps.

Unique `(registrationId, channel, templateVersion)` prevents duplicate logical sends. Workers use bounded batches, timeouts, provider rate limits and capped retry.

## 10. Full reconciliation (internal)

Not a v1 partner obligation. Existing admin import/export may stay for operator recovery. Partner mail must not require Mootq to poll or expose a full dump.

## 11. Attendance

Shared field: `NOT_VISITED` | `VISITED`. Mootq owns it. v1 does not include an attendance POST to Toon Expo.

## 12. Field ownership

- Toon Expo owns registration/questionnaire data for `sourceSystem=TOON_EXPO` and email/SMS delivery for Toon Expo-origin tickets only.
- Mootq owns registration input for `sourceSystem=MOOTQ` and scanning/attendance for both origins.
- Neither side changes the other's ticket code or source ID.

## 13. Pending contract items

1. Send [`16-MOOTQ-INTEGRATION-CONTRACT.md`](./16-MOOTQ-INTEGRATION-CONTRACT.md) and [`15-MOOTQ-HANDOFF.md`](./15-MOOTQ-HANDOFF.md); get Mootq sign-off.
2. Mootq provision of `MOOTQ_PUSH_URL` and `MOOTQ_PUSH_KEY`.
3. Adapt Toon Expo push/inbound implementation to contract `16` after sign-off (code still matches the withdrawn draft).
4. Final marketing email/SMS copy (interim designed template acceptable).
5. DNS confirmation for `reg.toonexpo.com`.

Closed: repeated email/phone allowed; scanner format uppercase `TE`/`MQ`; Resend/Dexatel approved; no block/ban/revoke; each party delivers only its own tickets; full POST body; nightly Mootq → TE; feed/full-sync/attendance inbound not in v1.
