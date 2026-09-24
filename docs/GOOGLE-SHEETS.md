# Google Sheets — Apps Script webhook (no Google Cloud)

Online copy of **TOON EXPO** registrations for the team. Neon remains the source of truth; the Sheet is a readable mirror. Append stays the normal path. One live-test phone (`+37495426165`) is removed from Neon and from the matching tab 30 minutes after registration.

Admin CSV export stays available as a backup / offline dump.

---

## Why not a public share link

A view-only link cannot accept rows. Sheets API without a service account also cannot write.

**Chosen path (same as ToonExpo Feedback):** Apps Script inside the spreadsheet + one secret webhook URL. No Google Cloud Console, no JSON key.

```
Registration API  →  INSERT Neon + SheetsPushDelivery(pending)
                  →  after() / cron POST webhook
                  →  Apps Script appendRow
```

---

## One-time Sheet setup

1. Create a Google Spreadsheet for registrations.
2. Tabs `Ընդհանուր` and `Սփյուռք ՌԴ` are created (or renamed from `General` / `Spyurk RF`) on the first write.
3. Extensions → Apps Script.
4. Paste [`docs/apps-script/Code.gs`](./apps-script/Code.gs).
5. Set `WEBHOOK_SECRET` to a long random string (same value as `SHEETS_WEBHOOK_SECRET`).
6. Deploy → New deployment → **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone** (so Vercel can call it)
7. Copy the `/exec` URL into env as `SHEETS_WEBHOOK_URL`.
8. After any script edit: Deploy → Manage deployments → pencil → **New version**.

Do **not** enable “Anyone with the link can edit” on the spreadsheet itself. Editors get normal Google sharing.

---

## Environment

```text
SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/.../exec"
SHEETS_WEBHOOK_SECRET="same-as-WEBHOOK_SECRET-in-Apps-Script"
SHEETS_PUSH_CRON_ENABLED="false"
```

`CRON_SECRET` (already used for delivery) also protects `GET/POST /api/internal/sheets-push/process`.

Set `SHEETS_PUSH_CRON_ENABLED=true` in production when the webhook is live.

---

## Behaviour

1. Public registration commits to Neon and enqueues `SheetsPushDelivery` (`PENDING`).
2. HTTP `201` returns to the visitor immediately.
3. `after()` tries one append (when webhook env is set).
4. Hourly cron retries `PENDING` / backoff failures when `SHEETS_PUSH_CRON_ENABLED=true`.
5. Only `sourceSystem = TOON_EXPO` rows are synced. Channel selects the tab:
   - `GENERAL` → `Ընդհանուր`
   - `SPYURK_RF` → `Սփյուռք ՌԴ`
6. Column headers and status fields use Armenian operator labels; questionnaire answers use the visitor's registration locale. Raw codes stay in Neon.

Success from Apps Script is **body** `{ "ok": true }` (HTTP is often always 200).

---

## Columns

Armenian short headers for operators. Each tab only includes relevant questionnaire columns:

- `Ընդհանուր` — general form
- `Սփյուռք ՌԴ` — Spyurk RF form

Questionnaire answers are written in the visitor's registration locale (`hy` / `en` / `ru`), matching the public form and CSV export. Status fields stay Armenian for operators (`Այցելել է`, `Ուղարկված`, …).

Legacy English tab names `General` / `Spyurk RF` are renamed on the first successful write after updating Apps Script.

---

## Failure

If the webhook is down, the registration is still saved. Fix the script / env, then cron (or a manual Bearer call to the internal process route) retries pending rows.

---

## Live-test phone

`+37495426165` only. General and Spyurk registrations with that normalized number are deleted 30 minutes after `createdAt`.

Set `EPHEMERAL_TEST_PHONE_PURGE_ENABLED=true`. Vercel Cron `* * * * *` calls `GET /api/internal/ephemeral-test-phone/purge` with `CRON_SECRET`. When the flag is off, the route returns `DISABLED` and does not open Neon. The job asks Apps Script `action: "deleteByRegistrationId"` on the registration's tab (`Ընդհանուր` or `Սփյուռք ՌԴ`), then deletes the Neon row. Other phones are not selected.

After updating [`docs/apps-script/Code.gs`](./apps-script/Code.gs), deploy a **new Apps Script version**. Until that version is live, a failed sheet delete keeps the Neon row so the next minute can retry.
