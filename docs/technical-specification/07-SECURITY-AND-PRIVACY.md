# Security and privacy

## Threat focus

- automated public submissions;
- shared venue NAT false positives;
- partner credential misuse/replay;
- guessed or leaked ticket links;
- duplicate delivery;
- PII leakage through logs/exports/full sync;
- unsafe admin deletion of synchronized tickets.

## Public registration

- Preserve server-side schema validation, body bounds, origin check and honeypot.
- Remove the process-local `5 / 10 minutes / IP` limiter.
- Use a high shared-NAT-safe Vercel WAF emergency ceiling, first in Log mode.
- Do not treat frontend steps/checklists as bot protection.

## Mootq APIs

- TLS only.
- Separate long bearer credentials for write and read/export scopes.
- Store secrets only in server environment configuration.
- Validate every body/page/item with bounded schemas.
- Use source ID and code uniqueness for idempotent retries.
- Apply a generous malfunction ceiling, not a normal business throttle.
- Rotate credentials with a documented overlap procedure.

## Ticket security

- QR contains only the prefixless 13-character alphanumeric code and no PII.
- Hosted page uses a separate high-entropy token.
- Ticket/PNG responses are private/no-store/noindex.
- Use a restrictive referrer policy and keep ticket routes out of analytics.
- Do not log codes, tokens or full URLs.
- Screenshots can be forwarded; admission/duplicate-scan enforcement belongs to Mootq.

## Email/SMS

- Use a unique logical-send business key.
- Provider calls have timeouts and bounded retries.
- Never include secrets in message content.
- Verify provider callbacks if callback-based delivery receipts are implemented.
- Treat callback delivery as at-least-once and idempotent.

## Full synchronization

- Export only contract-approved fields.
- Exclude password/auth/session, provider, job-lock and secret data.
- Record who initiated each run.
- Bound pages and error summaries.
- Validate field ownership before update.
- Keep attendance ownership with Mootq.
- Define retention for run metadata and imported PII before production.

## Administrator

- Preserve server-side authorization on every page/action/API.
- Secure HTTP-only SameSite cookies.
- Generic login errors and conservative login throttle.
- Explicit confirmation for import and destructive actions.

## Logging

Allowed:

- request ID;
- route/source;
- safe internal registration/job/run ID;
- status/count/duration;
- cursor count and lag;
- provider name/channel and safe error category.

Forbidden:

- full email/phone/name;
- ticket code or hosted-token URL;
- partner/provider authorization;
- raw inbound/full-sync/provider payload;
- password/session material.

## Data decision still open

The repeated-email rule affects data minimization and deduplication. Until confirmed, do not add new cross-system identity matching based on email or phone.
