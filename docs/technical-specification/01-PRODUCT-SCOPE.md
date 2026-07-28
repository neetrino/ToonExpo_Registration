# Product scope

## Goal

Register up to 30,000 Toon Expo attendees, provide a scannable QR immediately, deliver the same ticket through email/SMS, and exchange the required data with Mootq without adding unnecessary infrastructure.

## Actors

### Toon Expo visitor

- Completes the multilingual Toon Expo form.
- Receives an immediate QR for the Toon Expo-origin registration.
- May reopen the same ticket from email or SMS.

### Mootq visitor

- Completes the Mootq form.
- Receives an immediate QR from Mootq.
- Receives the matching email/SMS from Toon Expo after the record arrives.

### Toon Expo administrator

- Uses the existing protected registration dashboard.
- Sees source, ticket and delivery status.
- Starts a manual full import from Mootq.
- Reviews full-sync history.

### External systems

- Mootq registration backend creates and sends Mootq-origin records.
- Mootq scanner system pulls new Toon Expo-origin records and owns attendance.
- Resend sends ticket email.
- Dexatel sends ticket-link SMS.
- Neon stores application data.
- Vercel runs the application and WAF.

## Included capabilities

### Public registration and ticket

- Existing Toon Expo questionnaire and validation.
- `TE…` ticket code creation and immediate QR display (`^(TE|MQ)[A-Z0-9]{11}$`).
- Readable code and PNG download.
- Private hosted-ticket page.

### Mootq registration intake

- Authenticated minimal POST.
- Exact Mootq-generated code stored unchanged.
- Trusted server-side `MOOTQ` source assignment.
- Source-ID idempotency and conflict handling.
- Email/SMS jobs after successful persistence.

### Delivery

- Inline QR email through Resend.
- Hosted-ticket link through email and Dexatel SMS.
- Small PostgreSQL retry mechanism.
- Basic pending/sent/failed visibility.

### Fast exchange

- Minimal ordered Toon Expo-origin cursor feed.
- Mootq-controlled polling frequency.
- Replay/catch-up behavior.

### Full reconciliation

- Manual Toon Expo import from Mootq.
- On-demand paginated Toon Expo export for Mootq.
- Match/upsert by `ticketCode`.
- Questionnaire/full approved fields.
- `NOT_VISITED`/`VISITED`.
- Stored run history.

### Administration

- Existing auth, list, search, detail and CSV export.
- Source/ticket/delivery columns.
- Manual full import action and run results.

## Out of scope

- Toon Expo scanners or admission UI.
- Detailed scan history.
- Automatic polling-mode switches.
- Automatic bilateral full-sync scheduling.
- NestJS, Redis, NATS, Kafka, RabbitMQ or BullMQ.
- Payments, attendee accounts, editing, capacity or waitlists.
- Marketing email/SMS.

## Success measures

- Stored, displayed, emailed, linked and scanned code values match.
- Mootq-supplied codes are never silently changed.
- Source counts use `sourceSystem`, never code parsing.
- Provider failures do not lose a ticket.
- Fast exchange catches up after temporary outages.
- Full synchronization can be rerun and has auditable results.
- Peak load passes without blocking shared venue traffic.
