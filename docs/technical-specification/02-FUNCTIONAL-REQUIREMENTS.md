# Functional requirements

## Public Toon Expo registration

| ID     | Requirement                                                                          |
| ------ | ------------------------------------------------------------------------------------ |
| PUB-01 | The existing localized form MUST continue to validate on client and server.          |
| PUB-02 | An accepted Toon Expo registration MUST assign `sourceSystem=TOON_EXPO` server-side. |
| PUB-03 | It MUST receive one unique `TE…` ticket code matching `^(TE\|MQ)[A-Z0-9]{11}$`.     |
| PUB-04 | Success MUST show the stored QR and readable code immediately.                       |
| PUB-05 | Success MUST NOT wait for Resend or Peleka.                                          |
| PUB-06 | The current `5 / 10 minutes / IP` process-local limiter MUST be removed.             |
| PUB-07 | The same email and phone MAY create multiple intentional registrations.              |
| PUB-08 | Accidental double-submit MUST be protected by an idempotency key, not email/phone uniqueness. |

## Mootq registration intake

| ID    | Requirement                                                                         |
| ----- | ----------------------------------------------------------------------------------- |
| MQ-01 | The endpoint MUST require scoped server-to-server authentication.                   |
| MQ-02 | It MUST accept the exact Mootq source ID, code and agreed recipient fields.         |
| MQ-03 | It MUST validate the `^(TE\|MQ)[A-Z0-9]{11}$` format (Mootq supplies `MQ…` codes).   |
| MQ-04 | It MUST assign `sourceSystem=MOOTQ` from the authenticated route, not request data. |
| MQ-05 | It MUST persist the supplied code unchanged.                                        |
| MQ-06 | Identical source-ID retries MUST be safe.                                           |
| MQ-07 | Conflicting source-ID/code reuse MUST return a conflict.                            |
| MQ-08 | Success MUST use an HTTP acknowledgement and MUST NOT issue a replacement code.     |

## Ticket and QR

| ID     | Requirement                                                                       |
| ------ | --------------------------------------------------------------------------------- |
| TKT-01 | `ticketCode` MUST be globally unique and immutable in Toon Expo.                  |
| TKT-02 | It MUST be exactly 13 ASCII characters: `TE` or `MQ` plus 11 uppercase alphanumeric body (`^(TE\|MQ)[A-Z0-9]{11}$`). |
| TKT-03 | QR payload MUST be exactly `ticketCode`.                                          |
| TKT-04 | QR MUST contain no PII, URL or JWT.                                               |
| TKT-05 | Hosted-ticket URLs MUST use a separate long private token.                        |
| TKT-06 | QR images MUST be generated on demand, not stored as DB blobs.                    |
| TKT-07 | Representative codes from both generators MUST scan on Mootq's real device.       |
| TKT-08 | Registration source MUST NOT be inferred from `ticketCode`.                       |

## Email and SMS

| ID     | Requirement                                                          |
| ------ | -------------------------------------------------------------------- |
| DEL-01 | Registration/import and EMAIL jobs MUST be committed atomically.     |
| DEL-02 | Email MUST contain inline QR, readable code and hosted-ticket link.  |
| DEL-03 | SMS MUST contain the hosted-ticket link when Peleka is enabled.      |
| DEL-04 | Both channels MUST use the stored code for the registration.         |
| DEL-05 | Provider failures MUST NOT roll back the registration.               |
| DEL-06 | Logical sends MUST be idempotent and retries bounded.                |
| DEL-07 | Admin/operations MUST see pending and terminal failures.             |
| DEL-08 | Peleka SMS is deferred; first delivery slice is EMAIL-only.          |

## Fast exchange

| ID      | Requirement                                                                    |
| ------- | ------------------------------------------------------------------------------ |
| FAST-01 | The outbound fast feed MUST contain only Toon Expo-origin operational records. |
| FAST-02 | It MUST be ordered, cursor-based, bounded and replay-safe.                     |
| FAST-03 | It MUST expose only contract-approved minimum fields.                          |
| FAST-04 | Mootq MUST control polling frequency.                                          |
| FAST-05 | Toon Expo MUST NOT implement a pre-event/live polling switch.                  |
| FAST-06 | `hasMore=true` MUST support immediate catch-up pages.                          |
| FAST-07 | Every outbound item MUST explicitly carry `sourceSystem=TOON_EXPO`.            |

## Full reconciliation

| ID      | Requirement                                                                |
| ------- | -------------------------------------------------------------------------- |
| FULL-01 | Toon Expo admin MUST be able to start a full import from Mootq.            |
| FULL-02 | Mootq MUST be able to request a paginated Toon Expo full export.           |
| FULL-03 | Each direction MUST run independently.                                     |
| FULL-04 | Records MUST match primarily by `ticketCode` and verify source/source IDs. |
| FULL-05 | Rerunning a full sync MUST be idempotent.                                  |
| FULL-06 | A run MUST store direction, status, timestamps, cursor and result counts.  |
| FULL-07 | Attendance MUST initially support `NOT_VISITED` and `VISITED`.             |
| FULL-08 | A post-event full synchronization MUST be operationally required.          |
| FULL-09 | Every full-sync record MUST carry its stored `sourceSystem`.               |
| FULL-10 | Existing code/source mismatches MUST be conflicts, never reclassification. |

## Administrator

| ID     | Requirement                                                      |
| ------ | ---------------------------------------------------------------- |
| ADM-01 | Existing authentication and authorization MUST remain.           |
| ADM-02 | List/detail MUST show source, ticket and delivery states.        |
| ADM-03 | Admin MUST show full-sync history and last result.               |
| ADM-04 | Admin MUST NOT show ticket-view tokens or secrets.               |
| ADM-05 | No polling-frequency control MUST be added.                      |
| ADM-06 | Source filters/counts MUST use `sourceSystem`, not code parsing. |

## Duplicate contact rule

Same email and same phone MAY register multiple participants. The unique `(eventId, emailNormalized)` constraint MUST be removed. Accidental public retries MUST use an idempotency key. Mootq transport idempotency remains `sourceRegistrationId`. No automatic cross-source merge by email or phone.
