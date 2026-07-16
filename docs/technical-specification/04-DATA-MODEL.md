# Data model

This document describes logical data. Exact Prisma types, index syntax and migration SQL are finalized during implementation using the safe database migration workflow.

## Event

| Field | Purpose |
|---|---|
| `id` | Internal stable identifier |
| `slug` | Stable public/internal event key, unique |
| `name` | Event name |
| `startsAt` | Confirmed start date/time, nullable until supplied in non-production |
| `venueName` | Confirmed venue, nullable until supplied in non-production |
| `venueAddress` | Confirmed address, nullable until supplied in non-production |
| `isActive` | Selects the event accepting registrations |
| `createdAt`, `updatedAt` | Audit timestamps |

MVP operates one active event. The database MUST prevent ambiguous active-event behavior through application validation and, where practical, a database constraint.

## Registration

| Field | Purpose |
|---|---|
| `id` | Non-sequential public-safe identifier, preferably UUID/CUID |
| `eventId` | Owning event |
| `firstName` | Trimmed participant first name |
| `lastName` | Trimmed participant surname |
| `email` | Original/trimmed email for communication |
| `emailNormalized` | Lowercased normalized email used for uniqueness/search |
| `phone` | Display form of normalized phone |
| `phoneNormalized` | International normalized form used for search |
| `locale` | `hy`, `en` or `ru` |
| `consentAcceptedAt` | Server-recorded consent time |
| `privacyPolicyVersion` | Version accepted by participant |
| `emailDeliveryStatus` | Technical state: `PENDING`, `SENT` or `FAILED` |
| `emailLastAttemptAt` | Last Resend attempt timestamp |
| `emailProviderMessageId` | Provider ID when available; not exposed publicly |
| `createdAt`, `updatedAt` | Audit timestamps |

### Constraints and indexes

- Unique: `(eventId, emailNormalized)`.
- Index: `(eventId, createdAt, id)` for stable list ordering.
- Index/search support for `emailNormalized` and `phoneNormalized` scoped by event.
- Name search strategy must be tested with Armenian, Latin and Cyrillic input before choosing additional indexes.
- Phone is intentionally not unique.

## Admin

| Field | Purpose |
|---|---|
| `id` | Administrator identifier |
| `email` | Unique normalized login identity |
| `passwordHash` | Argon2id hash |
| `role` | Fixed `ADMIN` |
| `isActive` | Emergency access disable switch |
| `createdAt`, `updatedAt` | Audit timestamps |

Only one active administrator is supported by product scope. The seed/activation flow must not commit a real password or hash tied to production credentials.

## Relationship overview

```text
Event 1 ─────── * Registration

Admin           (independent authentication principal)
```

## Deletion policy decision

Before migration approval, the owner must choose one of these policies:

1. Hard delete: remove an erroneous registration immediately.
2. Soft delete: retain a minimal audit marker with `deletedAt`, exclude it from normal counts/exports, and purge it according to retention policy.

No hidden retention of full participant data is permitted without an approved purpose and disclosed policy.

## Future questionnaire extension

Not included in the MVP migration:

```text
Event 1 ── * FormVersion 1 ── * Question 1 ── * QuestionOption
Registration 1 ── * RegistrationAnswer * ── 1 Question
```

Versioning prevents later question edits from changing the meaning of previously submitted answers.
