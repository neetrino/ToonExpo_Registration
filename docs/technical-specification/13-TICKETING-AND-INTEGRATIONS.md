# Ticketing, delivery and Mootq integration

**Status:** working contract draft for Mootq sign-off; Peleka SMS deferred

## Owner notes (2026-07-27)

- Same email/phone may register multiple participants.
- Scanner format confirmed: `TE` or `MQ` prefix plus 11 uppercase alphanumeric characters (`^(TE|MQ)[A-Z0-9]{11}$`).
- Implement fast + full from this family of docs; single partner-facing draft is `14-MOOTQ-PARTNER-CONTRACT.md`.
- Fast Toon Expo → Mootq: outbound push is primary; cursor GET feed is backup.
- SMS via Peleka is deferred; EMAIL delivery ships first.
- Hosted ticket domain: `reg.toonexpo.com`. Resend from `hi@mail.toonexpo.com`.
- No block/ban/revoke product features.

## 1. Ticket ownership and registration source

| Registration form | Code issuer | Stored `sourceSystem` | Toon Expo behavior                    |
| ----------------- | ----------- | --------------------- | ------------------------------------- |
| Toon Expo         | Toon Expo   | `TOON_EXPO`           | Generate, store, display and deliver  |
| Mootq             | Mootq       | `MOOTQ`               | Validate, store unchanged and deliver |

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
7. create one minimal Toon Expo-origin fast-feed event (backup cursor feed).

Commit before provider calls and before outbound push. Return the stored code to the Toon Expo browser for immediate display.

After the HTTP response, Toon Expo sends one push per outbox row to Mootq. A minute cron retries unsent or failed outbox rows.

## 4. Mootq registration import

Mootq creates and displays the QR on its own side, then sends the minimum delivery record:

```http
POST /api/v1/integrations/mootq/registrations
Authorization: Bearer <mootq-write-key>
Content-Type: application/json
```

```json
{
  "sourceRegistrationId": "mq-98231",
  "ticketCode": "MQ8D6N4T7C2X9",
  "firstName": "Example",
  "lastName": "Visitor",
  "email": "visitor@example.com",
  "phone": "+37400000000",
  "locale": "hy",
  "createdAt": "2026-07-27T10:15:00.000Z"
}
```

Required behavior:

- require the scoped write credential;
- validate body size and exact schema;
- assign `sourceSystem=MOOTQ` from the authenticated route;
- reject any body field that attempts to choose the source;
- require the exact `^MQ[A-Z0-9]{11}$` format;
- make `sourceRegistrationId` idempotent;
- store the supplied code unchanged;
- generate only the Toon Expo hosted-ticket token;
- create EMAIL and SMS delivery jobs atomically;
- return no ticket business payload.

Responses:

- `204` for a new or identical replay safely persisted;
- `400` for invalid fields/code;
- `401`/`403` for authentication failure;
- `409` when the same source ID has conflicting content or the code belongs to another record;
- `500`/`503` for a temporary server dependency failure.

The open repeated-email decision is closed: shared email/phone are allowed. Transport idempotency remains `sourceRegistrationId` and is independent of contact fields.

## 5. Fast Toon Expo-origin push (primary)

Toon Expo pushes each new Toon Expo-origin registration individually to Mootq after the visitor response completes.

Mootq must provide `MOOTQ_PUSH_URL` and `MOOTQ_PUSH_KEY`. Toon Expo stores pending pushes in a PostgreSQL outbox table, sends one registration per HTTP request, and uses a minute cron only as a retry safety net.

```http
POST <MOOTQ_PUSH_URL>
Authorization: Bearer <MOOTQ_PUSH_KEY>
Idempotency-Key: <sourceRegistrationId>
Content-Type: application/json
```

```json
{
  "sourceRegistrationId": "te-registration-id",
  "ticketCode": "TE7K4M2X9P3R8",
  "sourceSystem": "TOON_EXPO",
  "createdAt": "2026-07-27T10:15:30.000Z"
}
```

The push body excludes email, phone and name unless Mootq later requests name fields. Optional `eventId` is included only if documented as supported by Mootq.

There is no event-day mode switch. Push is the primary fast path.

## 6. Fast Toon Expo-origin feed (backup)

Mootq MAY poll minimal Toon Expo-origin records when push missed or failed:

```http
GET /api/v1/integrations/mootq/registrations?after=<cursor>&limit=500
Authorization: Bearer <mootq-read-key>
Cache-Control: no-store
```

```json
{
  "items": [
    {
      "sequence": "12451",
      "sourceRegistrationId": "te-registration-id",
      "sourceSystem": "TOON_EXPO",
      "ticketCode": "TE7K4M2X9P3R8",
      "firstName": "Example",
      "lastName": "Visitor",
      "email": "visitor@example.com",
      "phone": "+37400000000",
      "createdAt": "2026-07-27T10:15:30.000Z"
    }
  ],
  "nextCursor": "12451",
  "hasMore": false
}
```

The feed contains only Toon Expo-origin rows and repeats the explicit source on every item. It is ordered, bounded, incremental and replay-safe. Mootq:

1. requests from its last committed cursor;
2. upserts the page;
3. saves `nextCursor`;
4. fetches immediately while `hasMore=true`;
5. otherwise waits for its own chosen interval.

Toon Expo does not expose or store a pre-event/live polling mode.

## 7. Ticket email

Resend email contains:

- localized subject and copy;
- inline CID QR generated from `ticketCode`;
- readable ticket code;
- absolute hosted-ticket link;
- approved event/support information.

The current Resend Pro plan provides 50,000 monthly emails. Production readiness requires verified sender-domain authentication, confirmation of pay-as-you-go status and monitoring of quota/rate responses.

## 8. Peleka SMS (deferred)

SMS will contain a short localized message and the absolute hosted-ticket link.

Peleka integration is deferred. When unblocked, define:

- API authentication;
- supported phone normalization;
- request idempotency;
- accepted/failed response semantics;
- retryable vs permanent errors;
- throughput and Unicode segment behavior;
- delivery receipt handling if used.

Peleka provider calls will use the same PostgreSQL `DeliveryJob` mechanism as email.

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

## 10. Full reconciliation

Full exchange is independent in each direction and remains manual. It is not triggered by fast push or the cursor feed.

### Toon Expo imports Mootq

- An administrator presses `Import full data from Mootq`.
- Toon Expo creates one `IMPORT_FROM_MQ` run and pulls partner pages.
- Full pages may contain both origins, so every record must include its stored `sourceSystem`.
- The import upserts by `ticketCode` and requires the incoming source/source ID to agree with immutable stored values.
- A code/source mismatch is a conflict and never changes ownership.
- It may create a missing `MOOTQ` source record when the fast import was missed and the full payload contains all required delivery fields.
- A missing `TOON_EXPO` source record is reported for recovery instead of recreated from partner-owned data.
- It imports partner-owned questionnaire/registration fields for `MOOTQ` records and `attendanceStatus` for both origins.

### Mootq exports from Toon Expo

- Mootq initiates from its own system whenever required.
- Mootq creates an authenticated `EXPORT_TO_MQ` run and pulls bounded pages.
- Every exported record explicitly contains its stored `sourceSystem`; the full dataset may include both origins.
- Toon Expo does not push or schedule this full export.

Minimum full-sync run states:

- `RUNNING`;
- `SUCCEEDED`;
- `PARTIAL`;
- `FAILED`.

Minimum history:

- direction;
- initiator;
- start/finish time;
- last cursor;
- read/created/updated/skipped/conflict/error counts;
- bounded safe error summary.

Full synchronization is idempotent and safe to rerun. It is expected only a small number of times and is required after the event.

## 11. Attendance

The initial shared attendance field is:

```text
NOT_VISITED | VISITED
```

Mootq owns this value. Detailed per-day/per-scan history is excluded. A future `CheckInEvent` table may be added without changing the initial fast exchange.

## 12. Field ownership

- Toon Expo owns registration/questionnaire data for `sourceSystem=TOON_EXPO` and delivery state for both origins.
- Mootq owns registration input for `sourceSystem=MOOTQ` and scanning/attendance status for both origins.
- Neither side changes the other's ticket code or source ID.
- Full synchronization does not overwrite provider secrets, job locks or internal authentication fields.
- Conflicting immutable IDs are reported, not silently replaced.

## 13. Pending contract items

1. Mootq sign-off on [`14-MOOTQ-PARTNER-CONTRACT.md`](./14-MOOTQ-PARTNER-CONTRACT.md) (field names, URLs, auth, push endpoint).
2. Mootq provision of `MOOTQ_PUSH_URL` and `MOOTQ_PUSH_KEY`.
3. Peleka API details when SMS is unblocked.
4. Final marketing email copy (interim designed template acceptable).
5. DNS confirmation for `reg.toonexpo.com`.

Closed: repeated email/phone allowed; scanner format confirmed as `TE`/`MQ` + 11 uppercase alphanumeric; Resend sender/domain confirmed; no block/ban/revoke product scope; outbound push is primary fast path with GET feed as backup.
