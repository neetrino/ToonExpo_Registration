# Ticketing, delivery and Mootq integration

**Status:** working contract draft for Mootq sign-off; Peleka SMS deferred

## Owner notes (2026-07-27)

- Same email/phone may register multiple participants.
- Scanner format confirmed by Mootq: random 13 characters.
- Implement fast + full from this family of docs; single partner-facing draft is `14-MOOTQ-PARTNER-CONTRACT.md`.
- SMS via Peleka is deferred; EMAIL delivery ships first.
- Hosted ticket domain: `reg.toonexpo.com`. Resend from `hi@mail.toonexpo.com`.
- No block/ban/revoke product features.

## 1. Ticket ownership and registration source

| Registration form | Code issuer | Stored `sourceSystem` | Toon Expo behavior                    |
| ----------------- | ----------- | --------------------- | ------------------------------------- |
| Toon Expo         | Toon Expo   | `TOON_EXPO`           | Generate, store, display and deliver  |
| Mootq             | Mootq       | `MOOTQ`               | Validate, store unchanged and deliver |

All codes are exactly 13 ASCII alphanumeric characters matching `^[A-Za-z0-9]{13}$`. They have no prefix, separator or embedded registration-source meaning and are case-sensitive. Each issuer uses cryptographically secure randomness for registrations created on its own form.

Codes are compared and transported exactly as issued. Toon Expo does not trim, uppercase, lowercase or otherwise normalize a valid partner code.

The Toon Expo generator samples uniformly from `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz` with Node.js cryptographic randomness such as `crypto.randomInt`; it never uses `Math.random`. Mootq may implement its generator independently but must produce the same external format.

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
- admin metrics, filtering and synchronization use this field, never code parsing.

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
3. generate/store a unique 13-character code;
4. generate/store the hosted-ticket token;
5. create EMAIL and SMS delivery jobs;
6. create one minimal Toon Expo-origin fast-feed event.

Commit before provider calls. Return the stored code to the Toon Expo browser for immediate display.

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
  "ticketCode": "8D6N4T7C2X9PL",
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
- require the exact prefixless 13-character alphanumeric format;
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

## 5. Fast Toon Expo-origin feed

Mootq pulls minimal Toon Expo-origin records:

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
      "ticketCode": "7K4M2X9P3R8DQ",
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

## 6. Ticket email

Resend email contains:

- localized subject and copy;
- inline CID QR generated from `ticketCode`;
- readable ticket code;
- absolute hosted-ticket link;
- approved event/support information.

The current Resend Pro plan provides 50,000 monthly emails. Production readiness requires verified sender-domain authentication, confirmation of pay-as-you-go status and monitoring of quota/rate responses.

## 7. Peleka SMS (deferred)

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

## 8. Delivery jobs

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

## 9. Full reconciliation

Full exchange is independent in each direction.

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

## 10. Attendance

The initial shared attendance field is:

```text
NOT_VISITED | VISITED
```

Mootq owns this value. Detailed per-day/per-scan history is excluded. A future `CheckInEvent` table may be added without changing the initial fast exchange.

## 11. Field ownership

- Toon Expo owns registration/questionnaire data for `sourceSystem=TOON_EXPO` and delivery state for both origins.
- Mootq owns registration input for `sourceSystem=MOOTQ` and scanning/attendance status for both origins.
- Neither side changes the other's ticket code or source ID.
- Full synchronization does not overwrite provider secrets, job locks or internal authentication fields.
- Conflicting immutable IDs are reported, not silently replaced.

## 12. Pending contract items

1. Mootq sign-off on [`14-MOOTQ-PARTNER-CONTRACT.md`](./14-MOOTQ-PARTNER-CONTRACT.md) (field names, URLs, auth).
2. Peleka API details when SMS is unblocked.
3. Final marketing email copy (interim designed template acceptable).
4. DNS confirmation for `reg.toonexpo.com`.

Closed: repeated email/phone allowed; scanner format confirmed as random 13 characters; Resend sender/domain confirmed; no block/ban/revoke product scope.
