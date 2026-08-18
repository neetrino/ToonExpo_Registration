# Mootq integration — cover letter

**Date:** 2026-08-18  
**Audience:** Mootq engineering  
**Contract to approve:** [`16-MOOTQ-INTEGRATION-CONTRACT.md`](./16-MOOTQ-INTEGRATION-CONTRACT.md)

This is the email-ready summary. The previous Toon Expo draft (`14`) is withdrawn. We reviewed your `INTEGRATION-CONTRACT.en.md` (draft for approval, 2026-07-27) and accept it as the v1 base, with the decisions below already written into document `16`.

Please read `16` as the single contract and confirm sign-off.

---

## What we accept from your draft

- Immediate Toon Expo → Mootq `POST` after our registration; the visitor does not wait for you.
- Full body on that `POST`: name, email, phone, `locale`, `answers` — not a minimal code-only payload.
- `sourceRegistrationId` only in `Idempotency-Key` on Toon Expo → Mootq (not in the body).
- Nightly Mootq → Toon Expo `POST` (delay until the next night is accepted).
- Each party delivers the ticket only for visitors who registered on its own form. Toon Expo will not email or SMS Mootq-origin visitors.
- Uppercase `TE` / `MQ` + 11 characters `A-Z0-9`.
- One credential per event; no `eventId` in the body.
- Required `locale`: `hy` | `en` | `ru`.
- Maximum 5 requests/second Toon Expo → Mootq; overflow stays in our outbox.
- HTTPS `POST` only. No polling loop and no WebSocket.
- Attendance push to Toon Expo is **not** in v1.
- Cursor feed and full dump are **not** v1 partner obligations.

## What we add (please confirm)

1. **Answers catalog.** Toon Expo → Mootq uses form `2026-vis-reg-v1`. Keys are snake_case and flattened (no nested objects). Full list: contract Appendix A. Your inbound keys may differ; we will store unknown keys and still accept the ticket.
2. **UTM.** Optional top-level `utmSource`, `utmMedium`, `utmCampaign` on Toon Expo → Mootq only. Omit the key when not captured. Do not reject the request if these keys are present or absent.
3. **Our receive URL.**

```http
POST https://reg.toonexpo.com/api/v1/integrations/mootq/registrations
Authorization: Bearer <token-from-toon-expo>
```

---

## What we need from you

| Item | Notes |
| --- | --- |
| Production and non-production push URLs | Your receive path draft: `POST /api/v1/integrations/toon-expo/registrations` |
| Bearer credential for Toon Expo → Mootq | One per event; min 32 characters |
| Nightly window | Start time, batch size, concurrency |
| Timeout / max payload | So we can match retries |
| Your `answers` keys | If they are not Appendix A |
| Technical contact | For `409` / `4xx` diagnosis |

We will issue your write credential and the non-production receive URL when you are ready to rehearse.

---

## Smoke test (non-production first)

1. Toon Expo registers on our form → you receive a full `TE…` POST, return `204`, scanner accepts the code immediately. Replay same `Idempotency-Key` + same body → `204`. Same key, different body → `409`.
2. Optional UTM landing → push includes UTM keys. No UTM → those keys are omitted.
3. You `POST` one `MQ…` registration to our URL at night or in rehearsal → we return `204` and do not send email/SMS. Identical replay → `204`. Conflicting replay → `409`.
4. Scan sample `TE…` and `MQ…` on production hardware (uppercase).

---

## Related

- Contract: [`16-MOOTQ-INTEGRATION-CONTRACT.md`](./16-MOOTQ-INTEGRATION-CONTRACT.md)
- Withdrawn draft: [`14-MOOTQ-PARTNER-CONTRACT.md`](./14-MOOTQ-PARTNER-CONTRACT.md)
