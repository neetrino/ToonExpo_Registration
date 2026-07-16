# API and validation

## Public registration endpoint

`POST /api/registrations`

### Request body

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "locale": "hy | en | ru",
  "privacyConsent": true,
  "privacyPolicyVersion": "string",
  "website": "honeypot string, expected empty"
}
```

The client MUST NOT submit `eventId`. The server resolves the active event from trusted configuration/database state.

### Response classes

| Status | Meaning |
|---|---|
| `201` | Registration created |
| `400` | Malformed body or failed validation |
| `409` | Email already registered for active event |
| `429` | Vercel WAF/application login protection limit reached |
| `500`/`503` | Safe temporary server/provider failure |

Public error bodies use stable application codes and localized client messages. They MUST NOT include stack traces, SQL/provider details or participant data.

## Normalization

### Names

- Unicode-aware trim.
- Collapse unintended repeated whitespace.
- Preserve Armenian, Latin and Cyrillic characters and legitimate punctuation such as hyphen/apostrophe.
- Do not silently transliterate or change letter case.
- Enforce bounded minimum/maximum lengths in the Zod schema.

### Email

- Trim surrounding whitespace.
- Validate practical email syntax.
- Lowercase the complete value for `emailNormalized`.
- Do not apply provider-specific transformations such as removing dots or `+tags`.
- Bound the stored length to the database column and validation schema.

### Phone

- Use a maintained phone-number parser.
- Normalize to E.164 where the supplied number is valid.
- The UI SHOULD default to Armenia (`+374`) while allowing international numbers.
- Store a normalized searchable form and a safe display form.

### Locale and consent

- Locale must be exactly `hy`, `en` or `ru`.
- Consent must be literal `true`.
- Policy version must match a server-known published version, not an arbitrary client value.

## Concurrency and idempotency

- The `(eventId, emailNormalized)` unique constraint is the final duplicate guard.
- Implementation MUST NOT depend on `findFirst` followed by an unprotected insert.
- A unique-constraint race maps to the same `409` response as an ordinary duplicate.
- The client disables repeat submission for usability, but correctness remains server/database enforced.
- Optional request idempotency keys MAY be added if load tests expose a need; Redis is not required for this because the business uniqueness key already defines the desired result.

## Email behavior

1. Commit registration with `emailDeliveryStatus=PENDING`.
2. Attempt Resend outside the database transaction with a bounded timeout.
3. On success, set `SENT`, attempt time and provider message ID.
4. On failure, set `FAILED`, retain the registration and emit a redacted operational error.

Automated retry is not required for the first implementation unless an approved Vercel-compatible retry mechanism is added to the TECH_CARD. Failed records must remain identifiable for controlled operational retry.

## Admin endpoints

Exact internal URLs may follow Next.js Server Action conventions, but all operations require server-side admin authorization:

- list/search registrations with bounded pagination;
- retrieve total count;
- delete one registration with CSRF-safe mutation handling;
- export CSV with server-applied scope and formula neutralization.

Admin responses containing participant data MUST use `Cache-Control: private, no-store` or equivalent framework behavior.

## CSV safety

- UTF-8 encoding with a format verified in common spreadsheet applications.
- Escape delimiters, quotes and line breaks correctly.
- Prefix or neutralize values beginning with `=`, `+`, `-`, `@`, tab or carriage return.
- Use an allowlisted column set and deterministic headers.
- Do not export internal password, provider or request metadata.
