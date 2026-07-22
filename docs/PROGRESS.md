# Toon Expo Registration — current progress and implementation plan

**Updated:** 2026-07-23

**Status:** plan approved in principle; implementation not started

**Scope authority:** the decisions recorded here supersede older project documents where they require email delivery or exclude QR codes and partner synchronization. Those documents must be aligned during implementation.

## 1. Current baseline

The repository already contains the multilingual registration wizard, server-side validation, PostgreSQL persistence through Prisma/Neon, administrator authentication and registration management, CSV export, confirmation-email code, and baseline request/security checks.

No production deployment or production database migration is authorized by this plan.

## 2. Approved target scope

- Keep the existing Next.js modular monolith on Vercel with PostgreSQL on Neon.
- Keep the current visitor registration form and database persistence.
- Retain the confirmation-email implementation, but disable it by default so it performs no provider request and no post-registration database update.
- Generate one stable, opaque, globally unique 12-character `ticketCode` for every registration.
- Persist `ticketCode` as text in PostgreSQL. Do not persist the rendered QR image.
- Encode exactly `ticketCode` in the visitor's QR code; do not encode PII, an internal registration ID, a URL, or a JWT unless the partner contract later explicitly requires a different payload.
- Show the QR and human-readable code immediately after registration and allow the visitor to download it or save a screenshot.
- Expose an authenticated incremental feed that the external check-in company can poll every three seconds.
- Remove the process-local public-registration rate limiter. Keep a deliberately high Vercel WAF emergency ceiling, initially in Log mode, so shared Wi-Fi/NAT traffic is not rejected.
- Do not add NestJS, Redis, a message broker, containers, or Kubernetes for this scope.

## 3. Ticket code and QR contract

`ticketCode` is the public ticket identifier shared by three systems:

```text
Toon Expo PostgreSQL
        │
        ├── registration response ──> visitor success page ──> QR(ticketCode)
        │
        └── incremental partner API ──> partner database ──> scanner comparison
```

The code is not an API authentication token. The partner feed uses a separate secret API credential.

### Required properties

- Exactly 12 uppercase ASCII characters from a partner-approved alphabet.
- Generated with a cryptographically secure random source on the server.
- Globally unique in the application database and immutable after creation.
- Created in the same database transaction as the registration and partner-feed event.
- Returned to the browser only after the transaction commits.
- Represented in the QR exactly as stored, with no whitespace or case conversion.
- Displayed below the QR as a manual fallback.

A random 12-character code is appropriate for the partner's lookup-based validation model. It does not need to be a signed JWT: the partner accepts a scan only when the exact code exists in its synchronized allowlist. Database uniqueness prevents collisions; randomness makes guessing impractical. Reuse or one-time admission is the partner's check-in responsibility unless a later contract adds status callbacks.

### Database shape

Target registration field:

```prisma
ticketCode String @unique @db.VarChar(12)
```

The database stores only the code. The success page renders an SVG/canvas QR in the browser and can produce a downloadable PNG without object storage or another server request.

## 4. Partner synchronization design

The partner must not download the complete registration list every three seconds. At 30,000 attendees that would repeatedly transfer unchanged PII and create unnecessary origin/database work. The API will expose an ordered, replayable change feed.

### Draft endpoint

```http
GET /api/v1/integrations/check-in/registration-events?after=<cursor>&limit=500
Authorization: Bearer <partner-api-key>
Cache-Control: no-store
```

Draft response:

```json
{
  "items": [
    {
      "sequence": "12451",
      "type": "UPSERT",
      "ticketCode": "7M4K8T2PX9QD",
      "firstName": "Example",
      "lastName": "Visitor",
      "registeredAt": "2026-07-23T10:15:30.000Z"
    }
  ],
  "nextCursor": "12451",
  "hasMore": false,
  "serverTime": "2026-07-23T10:15:32.000Z"
}
```

The final participant fields remain subject to explicit data-minimization approval. Email, phone and questionnaire answers are excluded unless the partner documents a necessary use.

### Delivery semantics

- The partner starts with `after=0` for the initial import and then polls using the last durably stored cursor.
- The partner writes a page to its database before advancing its cursor.
- Repeating the same request is safe; the partner upserts by `ticketCode` and handles events idempotently.
- Empty polls return an empty `items` array and an unchanged cursor.
- If more than one page accumulated, the partner follows `hasMore` immediately rather than waiting three seconds between catch-up pages.
- A normal new registration should become visible on the next poll, normally within approximately three seconds plus request and persistence latency.

### Change-feed persistence

Use a small PostgreSQL change-feed/outbox table with a monotonically increasing sequence. Insert the registration and its `UPSERT` event in one transaction. This prevents the partner from missing a committed registration if the application fails between separate writes.

The event record contains only the immutable code and the explicitly approved integration snapshot. If an issued ticket can be deleted or revoked, the same feed must emit a `REVOKE` event before/with the state change. The current hard-delete behavior must not silently remove a ticket already copied to the partner.

### Partner API protection

- A dedicated high-entropy API key stored only in Vercel and the partner's secret store.
- Constant-time credential comparison and generic `401` responses.
- Optional IP allowlist when the partner supplies stable egress addresses.
- Separate API key rotation path with an overlap window for old/new credentials.
- No credentials, ticket lists or participant PII in application logs.
- A partner-specific request ceiling above the expected 20 polls per minute, used only to stop a malfunctioning client.

## 5. Email behavior

Add a default-off feature flag:

```env
CONFIRMATION_EMAIL_ENABLED=false
```

When disabled:

- registration commits without calling Resend;
- the response does not wait for email work;
- Resend environment variables are not required;
- the delivery state is `NOT_REQUESTED`, not misleadingly `PENDING`;
- existing sender code and tests remain available.

When explicitly enabled in the future, the existing confirmation path may be reactivated after its production configuration is reviewed.

## 6. Registration traffic protection

- Delete the current process-local limit of five requests per ten minutes.
- Retain body-size, origin, honeypot, Zod validation and database uniqueness checks.
- Configure the Vercel WAF registration rule in Log mode first.
- Initial emergency-ceiling hypothesis: 5,000 registration POST requests per ten minutes per IP, five times the stated shared-IP peak. Adjust only from rehearsal/production evidence.
- Treat WAF as a safety fuse, not attendee flow control. A bot can call the API directly without completing browser wizard screens.

## 7. Safe database migration plan

**Framework:** Prisma 7 migrations on PostgreSQL/Neon

**Risk:** MEDIUM because the final unique required code needs a backfill for existing registrations; adding nullable fields and an independent feed table is LOW risk.

**Production execution:** manual owner action after Preview validation and backup/PITR confirmation.

Use expand-and-contract sequencing:

1. Add nullable `ticketCode`, the `NOT_REQUESTED` email state, and the independent partner change-feed table.
2. Deploy code able to read legacy rows and generate codes for new registrations.
3. Backfill every existing registration with a unique code using bounded batches; create corresponding initial feed events or a controlled initial snapshot.
4. Validate exact length/alphabet and verify zero nulls/duplicates.
5. Add the unique index/constraint and make `ticketCode` required in a later compatible migration.
6. Deploy code that assumes every registration has a code.
7. Do not remove email columns or sender code in this scope.

Rollback before the required constraint is a forward fix: stop new QR issuance, repair/backfill invalid rows, and redeploy. Never roll back the production database blindly after partner systems have consumed issued codes.

## 8. Implementation phases

### Phase 0 — partner contract and fixtures

- [ ] Receive the partner's allowed 12-character alphabet and case-sensitivity rules.
- [ ] Confirm that the scanned QR payload must be the raw 12-character value.
- [ ] Confirm the minimum participant fields they require.
- [ ] Confirm `UPSERT`/`REVOKE`, cursor, batching and retry semantics.
- [ ] Receive stable egress IPs if available and agree on API-key delivery/rotation.
- [ ] Obtain a partner test environment/device and at least one accepted QR fixture.

### Phase 1 — email and traffic controls

- [ ] Add the default-off email feature flag and conditional environment validation.
- [ ] Add `NOT_REQUESTED` without deleting email functionality.
- [ ] Remove the public in-memory registration limiter and update its tests/docs.
- [ ] Document the WAF Log-mode rehearsal and emergency ceiling.

### Phase 2 — schema and ticket generation

- [ ] Create and inspect the expand migration.
- [ ] Implement secure 12-character generation and collision retry.
- [ ] Write registration and feed event atomically.
- [ ] Backfill and validate existing non-production data.
- [ ] Add the unique/required constraint only after validation.

### Phase 3 — success experience

- [ ] Return `ticketCode` from the successful registration API response.
- [ ] Carry it to the localized success page without a database lookup.
- [ ] Render a high-contrast QR containing exactly the raw code.
- [ ] Show the readable code and localized screenshot/download instructions.
- [ ] Provide PNG download and preserve the code across a page refresh.
- [ ] Do not include success-page ticket values in analytics or logs.

### Phase 4 — partner feed

- [ ] Implement the authenticated cursor endpoint and bounded page size.
- [ ] Select only approved fields and return `Cache-Control: no-store`.
- [ ] Implement replay/idempotency and deletion/revocation behavior.
- [ ] Add safe structured observability: request ID, result count, cursor and latency only.
- [ ] Publish a concise partner-facing API contract and example requests/responses.

### Phase 5 — verification and rehearsal

- [ ] Unit-test code format, entropy source, collision retry and immutability.
- [ ] Migration-test legacy-row backfill and unique/required constraints.
- [ ] Integration-test registration transaction, no-email path and partner event creation.
- [ ] Test API authentication, cursor replay, pagination, empty polls and catch-up after outage.
- [ ] Scan generated QR files on the partner's actual device/system.
- [ ] Rehearse 1,000 registrations over ten minutes, including a shared source IP.
- [ ] Run short higher bursts and monitor Vercel errors/latency plus Neon CPU, queries and pooled connections.
- [ ] Confirm the partner receives every committed code exactly once logically, despite transport retries.

### Phase 6 — controlled release

- [ ] Align `TECH_CARD`, architecture, technical specification, privacy disclosures and production checklist with this approved scope.
- [ ] Configure Vercel Pro, a paid Neon production compute, pooled connection and colocated regions.
- [ ] Disable Neon scale-to-zero for the event window and confirm backup/PITR readiness.
- [ ] Apply reviewed production migrations manually with the migration role.
- [ ] Exchange the production API key through an approved secure channel.
- [ ] Run end-to-end smoke tests, then enable partner polling.
- [ ] Monitor the registration endpoint and synchronization throughout the event.

## 9. Acceptance criteria

- A valid registration commits once and returns one immutable 12-character code.
- The stored value, visible text, QR payload and partner value are byte-for-byte identical.
- Email-disabled registration performs no Resend call and requires no Resend secrets.
- A visitor can show, screenshot and download a scannable QR immediately.
- The partner can start from zero, poll every three seconds, resume after downtime and replay safely without missing registrations.
- Revoked/deleted tickets cannot remain silently valid in the partner database.
- Shared-IP peak traffic is not blocked by application or WAF limits.
- The measured registration and synchronization paths meet the agreed latency/error targets under rehearsal load.

## 10. Inputs still required before implementation is complete

1. Partner QR/code specification: allowed characters, case, raw payload confirmation and any QR error-correction/size requirements.
2. Exact fields the partner is legally and operationally allowed to receive.
3. Whether registrations can be corrected, deleted or revoked after synchronization.
4. Partner authentication preference, stable IPs, maximum batch size and timeout/retry expectations.
5. Test endpoint/device access and the responsible technical contact for the joint rehearsal.
