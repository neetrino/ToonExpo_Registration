# Mootq partner contract (draft for sign-off)

**Status:** draft — implement from this document; adjust field names/URLs only after Mootq sign-off

**Date:** 2026-07-27

**Audience:** Toon Expo + Mootq engineering

This is the single partner-facing contract for fast exchange and full reconciliation. Behavior below is normative for Toon Expo. Exact path/field renames may change during review without changing semantics.

---

## Shared rules

| Rule | Value |
| ---- | ----- |
| Ticket code | Exactly 13 ASCII alphanumeric characters: `^[A-Za-z0-9]{13}$` |
| Prefix | None |
| Case | Case-sensitive; store and compare exactly as issued |
| QR payload | Exactly `ticketCode` (no URL, PII, JWT) |
| Origin field | `sourceSystem`: `TOON_EXPO` \| `MOOTQ` — never inferred from the code |
| Who assigns origin | Toon Expo server routes only (public form → `TOON_EXPO`; this API write → `MOOTQ`) |
| Who generates codes | Each system generates codes only for registrations created on its own form |
| Mootq code at Toon Expo | Stored unchanged; never replaced; never returned as a new code |
| Auth | Separate long bearer credentials: write key vs read/export key |
| Contacts | Same email/phone may appear on multiple registrations |

Mootq confirmed the code format: random 13 characters.

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
  "ticketCode": "8D6N4T7C2X9PL",
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
| `ticketCode` | Yes | Exact Mootq-generated 13-character code |
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

## 2. Fast exchange — Toon Expo → Mootq (cursor feed)

Mootq polls for new Toon Expo-origin registrations. Polling frequency is controlled only by Mootq (e.g. rare pre-event, ~every 3s live). Toon Expo has no mode switch.

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

| Rule | Behavior |
| ---- | -------- |
| Scope | Only `sourceSystem=TOON_EXPO` |
| Order | Monotonic `sequence` / cursor |
| Replay | Safe from a previous cursor |
| Catch-up | If `hasMore=true`, fetch next page immediately |
| Fields | Minimum operational identity/contact only |

For Toon Expo-origin rows, `sourceRegistrationId` is Toon Expo's registration id.

---

## 3. Full reconciliation — export from Toon Expo

Mootq starts this independently whenever needed (including after the event).

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

## 4. Full reconciliation — import into Toon Expo

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

## 5. Attendance

Shared initial field only:

```text
NOT_VISITED | VISITED
```

Mootq owns attendance. No detailed per-scan history in this contract.

---

## 6. Out of scope for this contract

- Toon Expo scanning UI
- Polling-frequency control on Toon Expo
- Ticket revoke/block/ban feeds
- Automatic bilateral full-sync scheduling
- SMS provider details

---

## 7. Sign-off checklist for Mootq

- [ ] Confirm inbound POST path and JSON field names
- [ ] Confirm write bearer auth mechanism
- [ ] Confirm fast-feed path, cursor param names, `limit` max
- [ ] Confirm read bearer auth mechanism
- [ ] Confirm full-export run + page endpoints (or equivalent)
- [ ] Provide Mootq full-export URL/auth/pagination for Toon Expo import
- [ ] Confirm sample codes scan on production Mootq hardware
- [ ] Exchange non-production credentials for rehearsal

---

## Related internal docs

- [`13-TICKETING-AND-INTEGRATIONS.md`](./13-TICKETING-AND-INTEGRATIONS.md)
- [`05-API-AND-VALIDATION.md`](./05-API-AND-VALIDATION.md)
- [`04-DATA-MODEL.md`](./04-DATA-MODEL.md)
