# Mootq partner contract

**Status:** locked for partner handoff — transport names may change at sign-off; semantics below are normative

**Date:** 2026-07-27

**Audience:** Toon Expo + Mootq engineering

**Handoff one-pager:** [`15-MOOTQ-HANDOFF.md`](./15-MOOTQ-HANDOFF.md)

This is the single partner-facing contract for bidirectional fast exchange and rare full reconciliation. Two primary directions:

| Direction | Who calls | Purpose |
| --------- | --------- | ------- |
| **A. Mootq → Toon Expo** | Mootq | Deliver each Mootq-origin registration after QR is shown |
| **B. Toon Expo → Mootq** | Toon Expo | Push each Toon Expo-origin registration after visitor response |

Sections 3–5 cover backup feed and manual full sync only.

---

## Shared rules

| Rule | Value |
| ---- | ----- |
| Ticket code | Exactly 13 ASCII characters: 2-letter prefix + 11 uppercase alphanumeric body |
| Prefix | `TE` (Toon Expo) or `MQ` (Mootq) |
| Body alphabet | `A-Z0-9` only (uppercase) |
| Format regex | `^(TE\|MQ)[A-Z0-9]{11}$` |
| Case | Case-sensitive exact match; store and compare exactly as issued (uppercase) |
| QR payload | Exactly `ticketCode` (no URL, PII, JWT) |
| Origin field | `sourceSystem`: `TOON_EXPO` \| `MOOTQ` — never inferred from the prefix alone |
| Who assigns origin | Toon Expo server routes only (public form → `TOON_EXPO`; inbound API write → `MOOTQ`) |
| Who generates codes | Each system generates codes only for registrations created on its own form (`TE…` for Toon Expo, `MQ…` for Mootq) |
| Mootq code at Toon Expo | Stored unchanged; never replaced; never returned as a new code |
| Auth | Separate long bearer credentials: write key vs read/export key vs push-receive key |
| Contacts | Same email/phone may appear on multiple registrations |

Toon Expo and Mootq confirmed the prefixed format: `TE` or `MQ` plus 11 random uppercase alphanumeric characters.

---

## 1. Fast exchange — Mootq → Toon Expo (inbound, direction A)

After Mootq creates a registration and shows its QR, Mootq posts the minimum delivery record to Toon Expo.

```http
POST https://reg.toonexpo.com/api/v1/integrations/mootq/registrations
Authorization: Bearer <MOOTQ_WRITE_KEY>
Content-Type: application/json
```

Toon Expo issues `MOOTQ_WRITE_KEY` (write scope). A separate `MOOTQ_READ_KEY` is used only for the backup feed and full export (§3–4).

### Idempotency

| Key | Rule |
| --- | ---- |
| `sourceRegistrationId` | Transport idempotency key for Mootq-origin rows |
| Identical replay | Same `sourceRegistrationId` and identical payload → `204` (no duplicate row) |
| Conflict | Same `sourceRegistrationId` with different payload → `409` |
| Code collision | `ticketCode` already stored on another registration → `409` |

Mootq SHOULD retry `500` / `503` with exponential backoff. Do not retry `400` / `401` / `409`.

### Request body

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

| Field | Required | Notes |
| ----- | -------- | ----- |
| `sourceRegistrationId` | Yes | Stable Mootq registration ID; transport idempotency key |
| `ticketCode` | Yes | Exact Mootq-generated code matching `^MQ[A-Z0-9]{11}$` |
| `firstName` | Yes | Bounded string |
| `lastName` | Yes | Bounded string |
| `email` | Yes | Valid email |
| `phone` | Yes | E.164 preferred |
| `locale` | No | `hy` \| `en` \| `ru` if known |
| `createdAt` | No | ISO-8601; informational |

`sourceSystem` MUST NOT appear in the body. Toon Expo assigns `MOOTQ`.

### Responses

| Status | Meaning | Mootq action |
| ------ | ------- | ------------ |
| `204` | New registration persisted, or identical replay | Stop; success |
| `400` | Invalid JSON, fields, or `ticketCode` format | Fix payload; do not retry unchanged |
| `401` | Missing or invalid `Authorization: Bearer` | Fix credentials |
| `409` | Same `sourceRegistrationId` with conflicting content, or `ticketCode` already belongs to another registration | Resolve conflict; do not retry unchanged |
| `500` / `503` | Temporary server or dependency failure | Retry with backoff |

Error body shape:

```json
{ "ok": false, "code": "VALIDATION_ERROR", "requestId": "..." }
```

Success (`204`) returns no response body and no replacement ticket code. Toon Expo stores the supplied `MQ…` code unchanged and queues EMAIL and SMS delivery.

---

## 2. Fast exchange — Toon Expo → Mootq (outbound push, direction B)

Toon Expo pushes each new Toon Expo-origin registration to Mootq individually as soon as the visitor HTTP response completes. **Mootq MUST implement a receiving HTTPS API** for this path. Push is the primary fast path; the cursor feed (§3) is backup only.

### What Mootq must provide

| Item | Env on Toon Expo | Requirement |
| ---- | ---------------- | ----------- |
| Push endpoint URL | `MOOTQ_PUSH_URL` | HTTPS; one registration per `POST`; example shape: `https://<mootq-host>/api/.../registrations` |
| Push bearer secret | `MOOTQ_PUSH_KEY` | Min 32 characters; Toon Expo sends `Authorization: Bearer <MOOTQ_PUSH_KEY>` |

### Toon Expo send behavior

1. Persist the registration and append one outbox row in the same PostgreSQL transaction.
2. Return the ticket to the browser.
3. After the HTTP response (`after()`), send one push per outbox row.
4. A minute cron retries outbox rows that failed or were not yet sent (safety net only).

There is no event-day mode switch on either side. Toon Expo may retry the same push after `429`, `5xx`, or request timeout.

```http
POST <MOOTQ_PUSH_URL>
Authorization: Bearer <MOOTQ_PUSH_KEY>
Idempotency-Key: <sourceRegistrationId>
Content-Type: application/json
```

### Request body (locked minimum)

```json
{
  "sourceRegistrationId": "te-registration-id",
  "ticketCode": "TE7K4M2X9P3R8",
  "sourceSystem": "TOON_EXPO",
  "createdAt": "2026-07-27T10:15:30.000Z"
}
```

| Field | Required | Notes |
| ----- | -------- | ----- |
| `sourceRegistrationId` | Yes | Toon Expo registration ID; also sent as `Idempotency-Key` header |
| `ticketCode` | Yes | Exact Toon Expo-generated code matching `^TE[A-Z0-9]{11}$` |
| `sourceSystem` | Yes | Always `TOON_EXPO` for this path |
| `createdAt` | Yes | ISO-8601 registration creation time |
| `eventId` | No | Include only if Mootq documents multi-event support |

This push payload intentionally excludes email, phone and name. Name fields may be added later only if Mootq requests them for scanner display.

### Required Mootq endpoint behavior

Mootq's receiving API MUST meet all of the following:

| Requirement | Normative behavior |
| ----------- | ------------------ |
| Throughput | Accept at least **10–20 requests per second** sustained during registration peaks |
| Scope | Accept Toon Expo-origin registrations only on this endpoint (`sourceSystem: TOON_EXPO`, `ticketCode` matching `^TE[A-Z0-9]{11}$`) |
| Auth | Reject missing or invalid bearer with **`401`** |
| Idempotency | Treat **`Idempotency-Key`** header and body **`sourceRegistrationId`** as the same idempotency key; replays MUST NOT create duplicate check-in records |
| Success | Return **`200`**, **`201`**, or **`204`** when the registration is persisted (empty body acceptable) |
| Ticket conflict | Return **`409`** when `ticketCode` is already bound to a different registration |
| Retryable failure | Return **`429`** or **`5xx`**, or allow client timeout, when Toon Expo should retry with backoff |
| Permanent rejection | Return **`400`** or other **`4xx`** (except `409`) when retry will not help |

Toon Expo treats any `2xx` as successful delivery and stops retrying that outbox row. Error response JSON shape is Mootq-defined; include a stable machine-readable `code` if possible.

Shared ticket format for both directions: `^(TE|MQ)[A-Z0-9]{11}$` (case-sensitive uppercase).

---

## 3. Fast exchange — Toon Expo → Mootq (cursor feed, backup)

**Role:** backup catch-up only — not the primary path.

Mootq MAY poll for Toon Expo-origin registrations that were missed by push (§2). Polling frequency is controlled only by Mootq. Toon Expo has no mode switch.

```http
GET /api/v1/integrations/mootq/registrations?after=<cursor>&limit=500
Authorization: Bearer <mootq-read-key>
Cache-Control: no-store
```

### Response body (draft fields)

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

| Rule | Behavior |
| ---- | -------- |
| Role | Backup catch-up when push failed or was unavailable |
| Scope | Only `sourceSystem=TOON_EXPO` |
| Order | Monotonic `sequence` / cursor |
| Replay | Safe from a previous cursor |
| Catch-up | If `hasMore=true`, fetch next page immediately |
| Fields | Minimum operational identity/contact only |

For Toon Expo-origin rows, `sourceRegistrationId` is Toon Expo's registration id.

---

## 4. Full reconciliation — export from Toon Expo (rare / manual)

**Role:** rare manual reconciliation — not triggered by push or feed.

Mootq starts this independently whenever needed (including after the event). Full sync is manual on both sides.

```http
POST /api/v1/integrations/mootq/full-sync-runs
Authorization: Bearer <mootq-read-key>
```

Creates an `EXPORT_TO_MQ` run, then:

```http
GET /api/v1/integrations/mootq/full-sync-runs/<runId>/records?after=<cursor>&limit=500
Authorization: Bearer <mootq-read-key>
```

### Export record rules

- Every record includes stored `sourceSystem` (`TOON_EXPO` or `MOOTQ`).
- Dataset may contain both origins.
- Match key: `ticketCode`.
- Includes approved registration/questionnaire fields and `attendanceStatus` when present.
- Excludes secrets, ticket-view tokens, provider internals, delivery locks.

Exact page JSON field list is finalized at sign-off; semantics above stay fixed.

---

## 5. Full reconciliation — import into Toon Expo

Toon Expo admin starts `Import full data from Mootq`. Toon Expo pulls Mootq's paginated full-export API (URL/auth provided by Mootq at sign-off).

### Import rules

| Rule | Behavior |
| ---- | -------- |
| Match | Primary key `ticketCode` |
| Origin | Every record MUST include `sourceSystem` |
| Immutable checks | Incoming source + source ID must agree with stored values |
| Conflict | Code/source mismatch → report, never reclassify |
| Missing `MOOTQ` | May create if full payload has required delivery fields |
| Missing `TOON_EXPO` | Report for recovery; do not recreate from partner-owned data |
| Attendance | Import `NOT_VISITED` \| `VISITED` for both origins |
| Ownership | Do not overwrite Toon Expo delivery/provider internals |

Mootq must provide: base URL, auth, pagination (`after`/`limit` or equivalent), and update/cursor semantics.

---

## 6. Attendance

Shared initial field only:

```text
NOT_VISITED | VISITED
```

Mootq owns attendance. No detailed per-scan history in this contract.

---

## 7. Out of scope for this contract

- Toon Expo scanning UI
- Polling-frequency control on Toon Expo
- Event-day mode switch
- Ticket revoke/block/ban feeds
- Automatic bilateral full-sync scheduling
- SMS provider details (Toon Expo owns Dexatel; not a Mootq contract item)

---

## 8. Sign-off checklist for Mootq

- [ ] Confirm inbound POST path and JSON field names (direction A)
- [ ] Receive `MOOTQ_WRITE_KEY` and `MOOTQ_READ_KEY` from Toon Expo
- [ ] Provide `MOOTQ_PUSH_URL` and `MOOTQ_PUSH_KEY` (direction B receiving API)
- [ ] Implement push endpoint: idempotency, `2xx` / `409` / retryable `429`/`5xx`, 10–20 req/s
- [ ] Confirm push accepts locked minimal body and `Idempotency-Key` header
- [ ] Confirm backup feed path, cursor param names, `limit` max (§3)
- [ ] Confirm full-export run + page endpoints (or equivalent) for rare sync (§4–5)
- [ ] Provide Mootq full-export URL/auth/pagination for Toon Expo import
- [ ] Confirm sample `TE…` and `MQ…` codes scan on production Mootq hardware
- [ ] Complete joint smoke test per [`15-MOOTQ-HANDOFF.md`](./15-MOOTQ-HANDOFF.md)
- [ ] Exchange non-production credentials for rehearsal

---

## Related docs

- [`15-MOOTQ-HANDOFF.md`](./15-MOOTQ-HANDOFF.md) — email-ready one-pager for Mootq
- [`13-TICKETING-AND-INTEGRATIONS.md`](./13-TICKETING-AND-INTEGRATIONS.md)
- [`05-API-AND-VALIDATION.md`](./05-API-AND-VALIDATION.md)
- [`04-DATA-MODEL.md`](./04-DATA-MODEL.md)
