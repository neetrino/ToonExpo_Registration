# Mootq integration handoff (Toon Expo Registration)

**Date:** 2026-07-27  
**Audience:** Mootq engineering  
**Full contract:** [`14-MOOTQ-PARTNER-CONTRACT.md`](./14-MOOTQ-PARTNER-CONTRACT.md)

This one-pager summarizes what each side must build, configure, and test. Decisions are locked; field names may change only by mutual sign-off.

---

## What we need FROM you (checklist)

Provide Toon Expo with:

| Item | Env name (our side) | Notes |
| ---- | ------------------- | ----- |
| HTTPS POST URL for our outbound push | `MOOTQ_PUSH_URL` | One registration per request; placeholder shape: `https://<mootq-host>/api/.../registrations` |
| Bearer secret for push auth | `MOOTQ_PUSH_KEY` | Min 32 characters; we send `Authorization: Bearer <MOOTQ_PUSH_KEY>` |
| Full-export API (for rare manual sync) | `MOOTQ_FULL_EXPORT_BASE_URL`, `MOOTQ_FULL_EXPORT_KEY` | Paginated pull; details in contract §4–5 |
| Scanner confirmation | — | Production hardware accepts `TE…` and `MQ…` codes (uppercase, 13 chars) |

Confirm you will implement the **receiving API** described below (§ “What we will send to you”).

---

## Where YOU send to us (Mootq → Toon Expo)

**When:** After Mootq creates a registration and shows its QR.

```http
POST https://reg.toonexpo.com/api/v1/integrations/mootq/registrations
Authorization: Bearer <MOOTQ_WRITE_KEY>
Content-Type: application/json
```

We issue `MOOTQ_WRITE_KEY` (write scope). Separate `MOOTQ_READ_KEY` is for backup feed / full export only.

### Ticket code (Mootq origin)

- Format: `MQ` + 11 characters from `A-Z0-9` only  
- Regex: `^MQ[A-Z0-9]{11}$`  
- QR payload: exactly the ticket code (no URL, no PII)

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

| Field | Required |
| ----- | -------- |
| `sourceRegistrationId` | Yes — idempotency key |
| `ticketCode` | Yes — `^MQ[A-Z0-9]{11}$` |
| `firstName`, `lastName`, `email`, `phone` | Yes |
| `locale` | No — `hy` \| `en` \| `ru` |
| `createdAt` | No — ISO-8601 |

Do **not** send `sourceSystem`; we set `MOOTQ` server-side.

### Our responses

| Status | Meaning |
| ------ | ------- |
| `204` | Created, or identical replay of same `sourceRegistrationId` |
| `400` | Validation error |
| `401` | Missing/invalid bearer token |
| `409` | Same `sourceRegistrationId` with different payload, or `ticketCode` already used |
| `500` / `503` | Temporary failure — retry with backoff |

Error body: `{ "ok": false, "code": "...", "requestId": "..." }`

---

## What WE will send to you (Toon Expo → Mootq)

**When:** On every Toon Expo-origin registration, asynchronously after the visitor HTTP response. We retry on failure (outbox + minute cron safety net).

```http
POST <MOOTQ_PUSH_URL>
Authorization: Bearer <MOOTQ_PUSH_KEY>
Idempotency-Key: <sourceRegistrationId>
Content-Type: application/json
```

### Request body (locked minimum)

```json
{
  "sourceRegistrationId": "<te-registration-id>",
  "ticketCode": "TE7K4M2X9P3R8",
  "sourceSystem": "TOON_EXPO",
  "createdAt": "2026-07-27T10:15:30.000Z"
}
```

| Field | Notes |
| ----- | ----- |
| `ticketCode` | `^TE[A-Z0-9]{11}$` — we generate only `TE…` codes |
| `sourceSystem` | Always `TOON_EXPO` on this path |
| Header `Idempotency-Key` | Same value as `sourceRegistrationId` |

No email, phone, or name unless we agree later for scanner display.

### Your API must

| Requirement | Detail |
| ----------- | ------ |
| Throughput | Handle at least **10–20 requests/second** sustained |
| Idempotency | Same `Idempotency-Key` / `sourceRegistrationId` → no duplicate check-in records |
| Auth | Reject missing or wrong bearer with `401` |
| Success | Return **`200`**, **`201`**, or **`204`** when persisted |
| Conflict | Return **`409`** if `ticketCode` already belongs to another registration |
| Retryable | Return **`429`** or **`5xx`** (or time out) when we should retry; we backoff and retry |

Shared ticket format across both systems: `^(TE|MQ)[A-Z0-9]{11}$`.

---

## Smoke test checklist (joint)

Use non-production credentials first.

1. **Inbound:** Mootq `POST` one registration with valid `MQ…` code → we return `204`; duplicate identical body → `204`; changed body same `sourceRegistrationId` → `409`.
2. **Outbound push:** Toon Expo registers on our form → you receive push with `TE…` code, `sourceSystem: TOON_EXPO`, matching `Idempotency-Key`.
3. **Push idempotency:** Replay same push → your API returns success without duplicate side effects.
4. **Push conflict:** Send push with `ticketCode` that already exists under different id → you return `409`.
5. **Backup feed:** `GET …/registrations?after=<cursor>&limit=500` with read key → page of `TOON_EXPO` rows (catch-up if push missed).
6. **Scanner:** Scan sample `TE…` and `MQ…` on production Mootq hardware (uppercase).

---

## Open items

| Owner | Item |
| ----- | ---- |
| Toon Expo | Send this handoff + issue `MOOTQ_WRITE_KEY` and `MOOTQ_READ_KEY` |
| Mootq | Provide `MOOTQ_PUSH_URL` and `MOOTQ_PUSH_KEY` |
| Mootq | Provide full-export URL/auth for rare manual sync |
| Both | Joint smoke in staging, then production keys |
| Mootq | Confirm scanner accepts `TE…` / `MQ…` (uppercase) |

---

## Backup / rare paths (pointer only)

- **Backup catch-up:** Mootq may poll `GET /api/v1/integrations/mootq/registrations` (read bearer). Use when push failed or was unavailable.
- **Full reconciliation:** Manual only — export from Toon Expo and import from Mootq per contract §4–5. Not triggered by push or feed.

See [`14-MOOTQ-PARTNER-CONTRACT.md`](./14-MOOTQ-PARTNER-CONTRACT.md) for full semantics.
