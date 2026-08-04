# Mootq integration handoff (Toon Expo Registration)

**Date:** 2026-07-27  
**Updated:** 2026-08-04  
**Audience:** Mootq engineering  
**Full contract:** [`14-MOOTQ-PARTNER-CONTRACT.md`](./14-MOOTQ-PARTNER-CONTRACT.md)

This one-pager summarizes what each side must build, configure, and test. Decisions are locked; field names may change only by mutual sign-off.

---

## Contract update — 2026-08-04: marketing UTM attribution

**TOON EXPO** uses per-platform marketing links with standard UTM query parameters on the registration site. Example landing URL:

`https://reg.toonexpo.com?utm_source=facebook&utm_medium=video&utm_campaign=tey26`

When a visitor completes registration, we persist those values and include them on **Toon Expo → Mootq** payloads so Mootq can report, after the expo, how many registrations (and, on your side, visits/check-ins if you store them) came from each acquisition source.

| Topic | Rule |
| ----- | ---- |
| Compatibility | **Additive and backward compatible.** All three fields are optional. Existing integrations that ignore extra JSON keys keep working. |
| Outbound push | If a value was not captured, we **omit** that key from the JSON body (we do **not** send `"utmSource": null`, etc.). |
| Backup feed & full export | Same field names; values may appear as JSON **`null`** when absent (see contract §3–4). |

**Field names (camelCase, locked):**

| Mootq / API field | Captured from landing URL |
| ----------------- | ------------------------- |
| `utmSource` | `utm_source` |
| `utmMedium` | `utm_medium` |
| `utmCampaign` | `utm_campaign` |

**Where these fields appear:** outbound push (§ “What we will send to you”), backup cursor feed items, and full-export records.

**What Mootq should do:**

1. Accept unknown or optional fields without rejecting the push request (**minimum**).
2. Preferably **persist** `utmSource`, `utmMedium`, and `utmCampaign` with each registration/ticket.
3. Prefer using them for **post-event reporting** (registrations and visits by source).
4. **Confirm acknowledgment** to TOON EXPO when your side is ready to receive and store them.

Inbound **Mootq → Toon Expo** registration POSTs are unchanged; we do not require UTM on that path.

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

**When:** On every Toon Expo-origin registration, asynchronously after the visitor HTTP response. We retry on failure (outbox + cron safety net once `MOOTQ_PUSH_*` is configured).

```http
POST <MOOTQ_PUSH_URL>
Authorization: Bearer <MOOTQ_PUSH_KEY>
Idempotency-Key: <sourceRegistrationId>
Content-Type: application/json
```

### Request body (locked minimum)

When no UTM was captured, the body contains only the required fields:

```json
{
  "sourceRegistrationId": "<te-registration-id>",
  "ticketCode": "TE7K4M2X9P3R8",
  "sourceSystem": "TOON_EXPO",
  "createdAt": "2026-07-27T10:15:30.000Z"
}
```

When UTM was captured from the landing URL (example: Facebook video campaign `tey26`), the same payload may include:

```json
{
  "sourceRegistrationId": "<te-registration-id>",
  "ticketCode": "TE7K4M2X9P3R8",
  "sourceSystem": "TOON_EXPO",
  "createdAt": "2026-07-27T10:15:30.000Z",
  "utmSource": "facebook",
  "utmMedium": "video",
  "utmCampaign": "tey26"
}
```

Partial capture is allowed (only keys with values are sent; omitted keys are not sent as `null`).

| Field | Notes |
| ----- | ----- |
| `ticketCode` | `^TE[A-Z0-9]{11}$` — we generate only `TE…` codes |
| `sourceSystem` | Always `TOON_EXPO` on this path |
| Header `Idempotency-Key` | Same value as `sourceRegistrationId` |
| `utmSource` / `utmMedium` / `utmCampaign` | Optional; present only when captured from the visitor landing URL; see § “Contract update — 2026-08-04” |

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
3. **UTM attribution:** Register via a UTM landing link (e.g. `utm_source=facebook&utm_medium=video&utm_campaign=tey26`) → outbound push includes matching `utmSource` / `utmMedium` / `utmCampaign`; backup feed item for the same registration shows the same values (or `null` for absent params). Register without UTM → push omits UTM keys entirely.
4. **Push idempotency:** Replay same push → your API returns success without duplicate side effects.
5. **Push conflict:** Send push with `ticketCode` that already exists under different id → you return `409`.
6. **Backup feed:** `GET …/registrations?after=<cursor>&limit=500` with read key → page of `TOON_EXPO` rows (catch-up if push missed).
7. **Scanner:** Scan sample `TE…` and `MQ…` on production Mootq hardware (uppercase).

---

## Open items

| Owner | Item |
| ----- | ---- |
| Toon Expo | Send this handoff + issue `MOOTQ_WRITE_KEY` and `MOOTQ_READ_KEY` |
| Mootq | Provide `MOOTQ_PUSH_URL` and `MOOTQ_PUSH_KEY` |
| Mootq | Provide full-export URL/auth for rare manual sync |
| Both | Joint smoke in staging, then production keys |
| Mootq | Confirm scanner accepts `TE…` / `MQ…` (uppercase) |
| Mootq | Acknowledge UTM fields (`utmSource`, `utmMedium`, `utmCampaign`) on push/feed/export — see § “Contract update — 2026-08-04” |

---

## Backup / rare paths (pointer only)

- **Backup catch-up:** Mootq may poll `GET /api/v1/integrations/mootq/registrations` (read bearer). Use when push failed or was unavailable.
- **Full reconciliation:** Manual only — export from Toon Expo and import from Mootq per contract §4–5. Not triggered by push or feed.

See [`14-MOOTQ-PARTNER-CONTRACT.md`](./14-MOOTQ-PARTNER-CONTRACT.md) for full semantics.
