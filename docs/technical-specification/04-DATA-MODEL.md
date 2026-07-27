# Data model

This document defines the smallest planned additions. It does not authorize a migration.

## Existing entities

Keep existing `Event`, `Registration` and `Admin` entities and questionnaire JSON storage.

## Registration additions

| Field                  | Purpose                                                  |
| ---------------------- | -------------------------------------------------------- |
| `sourceSystem`         | Canonical origin: `TOON_EXPO` or `MOOTQ`                 |
| `sourceRegistrationId` | Stable source-owned ID; required for Mootq               |
| `ticketCode`           | Unique immutable scanner value: `TE` or `MQ` + 11 uppercase alphanumeric (`^(TE\|MQ)[A-Z0-9]{11}$`) |
| `ticketViewToken`      | Long private hosted-ticket credential                    |
| `attendanceStatus`     | `NOT_VISITED` or `VISITED`                               |

Constraints after backfill:

- unique `ticketCode`;
- unique `(sourceSystem, sourceRegistrationId)` when source ID is present;
- index `(eventId, sourceSystem)` for admin filtering and source counts;
- exact alphanumeric length validated in application and reviewed DB checks where practical;
- unique `(eventId, emailNormalized)` is removed: same email and phone MAY register multiple participants;
- keep non-unique indexes useful for admin email/phone search;
- accidental public retries use an application idempotency key, not contact uniqueness.

`sourceSystem` is independent of `ticketCode`. Public Toon Expo registration assigns `TOON_EXPO` server-side; the authenticated Mootq route assigns `MOOTQ` server-side. Public and partner request bodies cannot select or override the source. Existing rows are Toon Expo-origin unless migration validation proves otherwise. After backfill the field is required and has no permanent database default, so every write path must assign it explicitly.

For Toon Expo-origin rows, the existing `Registration.id` is the source-owned identifier and is exposed as `sourceRegistrationId` in partner payloads; no duplicate column value is required. For Mootq-origin rows, the separate `sourceRegistrationId` stores Mootq's stable ID and provides transport idempotency.

## DeliveryJob

One small table for EMAIL/SMS reliability:

| Field               | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `id`                | Internal job ID                           |
| `registrationId`    | Ticket recipient                          |
| `channel`           | `EMAIL` or `SMS`                          |
| `templateVersion`   | Logical-send version                      |
| `status`            | `PENDING`, `PROCESSING`, `SENT`, `FAILED` |
| `attemptCount`      | Retry count                               |
| `nextAttemptAt`     | Due time                                  |
| `providerMessageId` | Optional provider reference               |
| `lastErrorCode`     | Safe non-PII category                     |
| timestamps          | Creation/claim/send/update                |

Unique `(registrationId, channel, templateVersion)` prevents duplicate logical sends.

## PartnerFeedEvent

A purpose-specific table for ordered Toon Expo-origin fast exchange:

| Field            | Purpose                                                       |
| ---------------- | ------------------------------------------------------------- |
| `sequence`       | Monotonic cursor                                              |
| `registrationId` | Toon Expo registration                                        |
| `type`           | Initially `UPSERT`; `REVOKE` only if cancellation is approved |
| `createdAt`      | Feed ordering/operations                                      |

The API joins only the minimum approved identity/contact fields. A general event bus is not introduced.

## IntegrationSyncRun

| Field          | Purpose                                       |
| -------------- | --------------------------------------------- |
| `id`           | Run/session ID                                |
| `direction`    | `IMPORT_FROM_MQ` or `EXPORT_TO_MQ`            |
| `status`       | `RUNNING`, `SUCCEEDED`, `PARTIAL`, `FAILED`   |
| `initiatedBy`  | Admin or partner credential identity          |
| `lastCursor`   | Resume/progress                               |
| result counts  | read/created/updated/skipped/conflicts/errors |
| `errorSummary` | Bounded safe JSON summary                     |
| timestamps     | started/finished/updated                      |

Detailed per-item issue storage is deferred unless integration testing proves it necessary.

## Relationships

```text
Event 1 ─── * Registration
Registration 1 ─── * DeliveryJob
Registration 1 ─── 0..* PartnerFeedEvent
IntegrationSyncRun (independent operational history)
```

## Data ownership

- Toon Expo owns registration/questionnaire data for `sourceSystem=TOON_EXPO` and delivery state for both origins.
- Mootq owns registration input for `sourceSystem=MOOTQ` and attendance for both origins.
- Immutable IDs are never silently overwritten.
- Full sync does not import provider secrets or internal job fields.

## Migration risk

**LOW:** add nullable columns and independent tables.

**MEDIUM–HIGH:** backfill ticket codes/tokens and add unique/non-null constraints.

Sequence:

1. Expand with nullable fields/tables.
2. Deploy compatible reads/writes.
3. Backfill existing rows in bounded batches with `sourceSystem=TOON_EXPO`, `TE…` ticket codes and tokens.
4. Validate nulls, format, uniqueness and relations.
5. Add constraints later.

The repeated-email decision is closed: drop the email uniqueness constraint during expansion and keep search indexes. Accidental retries use an idempotency key.
