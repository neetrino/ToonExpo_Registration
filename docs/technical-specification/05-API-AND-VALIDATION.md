# API and validation

Partner v1 request/response shapes: [`16-MOOTQ-INTEGRATION-CONTRACT.md`](./16-MOOTQ-INTEGRATION-CONTRACT.md). Sections below still describe the current implemented routes; adapt them after Mootq sign-off. Cursor feed and full export are internal recovery APIs, not partner v1 obligations.

## Public registration

```http
POST /api/registrations
Content-Type: application/json
```

Keep existing origin, honeypot, body-size, Zod, questionnaire and normalization checks. Remove the process-local IP rate limit.

Require a client idempotency key (header or body field) so accidental double-submit does not create a second registration. Intentional shared email/phone MUST succeed as separate registrations when keys differ.

Successful response adds the Toon Expo ticket result needed by the browser:

```json
{
  "ok": true,
  "registrationId": "...",
  "ticketCode": "7K4M2X9P3R8DQ",
  "ticketUrl": "/ticket/<private-token>"
}
```

The route sets `sourceSystem=TOON_EXPO` server-side. The strict request schema rejects any client-supplied source field. The raw private token must not be logged.

## Mootq inbound

```http
POST /api/v1/integrations/mootq/registrations
Authorization: Bearer <mootq-write-key>
Content-Type: application/json
```

Validate:

- bounded request size;
- `sourceRegistrationId` format/length;
- `ticketCode` matching `^MQ[A-Z0-9]{11}$`;
- name, email, phone;
- required `locale` (`hy` | `en` | `ru`);
- required `registeredAt`;
- optional `answers` object (unknown keys kept; nested object values dropped).

The authenticated route sets `sourceSystem=MOOTQ`. Success returns `204`. No email/SMS jobs. No ticket payload in the response.

## Fast Toon Expo-origin feed

```http
GET /api/v1/integrations/mootq/registrations?after=<cursor>&limit=500
Authorization: Bearer <mootq-read-key>
```

Rules:

- opaque cursor;
- bounded default/max page;
- ascending stable sequence;
- no-store response;
- no dynamic polling-frequency field;
- `hasMore` and `nextCursor`;
- only Toon Expo-origin records;
- explicit `sourceSystem: "TOON_EXPO"` on every item.

## Full export for Mootq

Create/log one run:

```http
POST /api/v1/integrations/mootq/full-sync-runs
Authorization: Bearer <mootq-read-key>
```

Response:

```json
{
  "runId": "...",
  "estimatedRecords": 30000
}
```

Download pages:

```http
GET /api/v1/integrations/mootq/full-sync-runs/<runId>/records?after=<cursor>&limit=500
```

The export includes the stored `sourceSystem` on every record and only approved registration/questionnaire fields. It may contain both origins. It excludes secrets, provider internals and job locks.

## Full import from Mootq

Started from an authenticated admin action. The Toon Expo worker consumes Mootq's agreed paginated API. It:

- resumes from stored cursor;
- validates every page/item;
- upserts by `ticketCode`;
- requires `sourceSystem` on every full record and checks it plus source ID for consistency;
- never changes the source of an existing code;
- may create a missing `MOOTQ` record when the full payload contains all required fields, while a missing `TOON_EXPO` record is reported for recovery instead of recreated from partner data;
- imports partner-owned registration fields only for `MOOTQ` records and attendance/check-in fields for both origins;
- records counts and bounded errors.

## Ticket routes

Hosted on `reg.toonexpo.com` (planned production host):

```text
GET /ticket/<ticketViewToken>
GET /ticket/<ticketViewToken>/qr.png
```

Both are dynamic, private/no-store/noindex. Invalid tokens return a generic not-found result.

## Delivery processing

Internal/cron-triggered processing requires server-only authorization. It claims due jobs in bounded batches and never accepts arbitrary recipient/message bodies from a public request.

## Response classes

- `200/201` — public ticket result.
- `204` — Mootq record accepted or identical replay.
- `400` — validation.
- `401/403` — authentication/authorization.
- `409` — immutable source/code conflict.
- `413` — oversized body where used.
- `429` — WAF/safety ceiling.
- `500/503` — temporary dependency failure.

Errors include a request ID but no secrets, full PII or ticket values.
