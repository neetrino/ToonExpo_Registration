# Mootq partner contract (draft for sign-off)

**Status:** draft — implement from this document; adjust field names/URLs only after Mootq sign-off

**Date:** 2026-07-27

**Audience:** Toon Expo + Mootq engineering

This is the single partner-facing contract for fast exchange and full reconciliation. Behavior below is normative for Toon Expo. Exact path/field renames may change during review without changing semantics.

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

## 1. Fast exchange — Mootq → Toon Expo (inbound)

After Mootq creates a registration and shows its QR, Mootq posts the minimum delivery record.

```http
POST /api/v1/integrations/mootq/registrations
Authorization: Bearer <mootq-write-key>
Content-Type: application/json
```

### Request body (draft fields)

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

| Status | Meaning |
| ------ | ------- |
| `204` | New or identical replay persisted |
| `400` | Invalid fields/code |
| `401` / `403` | Auth failure |
| `409` | Same `sourceRegistrationId` with conflicting content, or `ticketCode` already belongs to another registration |
| `500` / `503` | Temporary server/dependency failure — retry later |

Success returns no ticket business payload. Toon Expo creates EMAIL delivery for the stored code (SMS later).

---

## 2. Fast exchange — Toon Expo → Mootq (outbound push, primary)

Toon Expo pushes each new Toon Expo-origin registration to Mootq individually as soon as the visitor HTTP response completes. This is the primary fast path.

Mootq MUST provide:

- `MOOTQ_PUSH_URL` — HTTPS endpoint that accepts one registration per request
- `MOOTQ_PUSH_KEY` — bearer secret for Toon Expo to authenticate outbound pushes

Toon Expo implementation:

1. Persist the registration and append one outbox row in the same PostgreSQL transaction.
2. Return the ticket to the browser.
3. After the HTTP response (`after()`), send one push per outbox row.
4. A minute cron retries any outbox rows that failed or were not yet sent (safety net only).

There is no event-day mode switch on either side.

```http
POST <MOOTQ_PUSH_URL>
Authorization: Bearer <MOOTQ_PUSH_KEY>
Idempotency-Key: <sourceRegistrationId>
Content-Type: application/json
```

### Request body (Toon Expo proposes)

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

### Expected Mootq behavior

| Rule | Behavior |
| ---- | -------- |
| Idempotency | Same `Idempotency-Key` / `sourceRegistrationId` MUST be safe to replay |
| Scope | Accept only Toon Expo-origin registrations on this endpoint |
| Auth | Reject missing or invalid bearer token |
| Response | Return `2xx` when persisted; `4xx` for permanent rejection; `5xx` for retryable failure |

Exact HTTP status codes and error body shape are finalized at sign-off.

---

## 3. Fast exchange — Toon Expo → Mootq (cursor feed, backup)

Mootq MAY poll for Toon Expo-origin registrations that were missed by push. Polling frequency is controlled only by Mootq. Toon Expo has no mode switch.

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

## 4. Full reconciliation — export from Toon Expo

Mootq starts this independently whenever needed (including after the event). Full sync is manual on both sides; it is not triggered by fast push or the cursor feed.

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
- SMS provider details

---

## 8. Sign-off checklist for Mootq

- [ ] Confirm inbound POST path and JSON field names
- [ ] Confirm write bearer auth mechanism
- [ ] Provide `MOOTQ_PUSH_URL` and `MOOTQ_PUSH_KEY` for outbound push
- [ ] Confirm push accepts proposed minimal body and `Idempotency-Key` header
- [ ] Confirm fast-feed path, cursor param names, `limit` max (backup)
- [ ] Confirm read bearer auth mechanism
- [ ] Confirm full-export run + page endpoints (or equivalent)
- [ ] Provide Mootq full-export URL/auth/pagination for Toon Expo import
- [ ] Confirm sample `TE…` and `MQ…` codes scan on production Mootq hardware
- [ ] Exchange non-production credentials for rehearsal

---

## Related internal docs

- [`13-TICKETING-AND-INTEGRATIONS.md`](./13-TICKETING-AND-INTEGRATIONS.md)
- [`05-API-AND-VALIDATION.md`](./05-API-AND-VALIDATION.md)
- [`04-DATA-MODEL.md`](./04-DATA-MODEL.md)
