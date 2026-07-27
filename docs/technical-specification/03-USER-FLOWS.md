# User and system flows

## Toon Expo visitor

1. Visitor completes the existing localized form.
2. Server validates and normalizes the payload.
3. A database transaction assigns `sourceSystem=TOON_EXPO` and stores the registration, 13-character code, ticket token, two delivery jobs and one fast-feed event.
4. Browser receives the code and opens the success/ticket state.
5. QR and readable code appear immediately.
6. Delivery processing sends email and SMS asynchronously.
7. Mootq later pulls the Toon Expo-origin fast-feed item with explicit source.

## Mootq visitor

1. Visitor completes the Mootq form.
2. Mootq creates a prefixless 13-character code and shows its QR.
3. Mootq backend posts the same code plus minimum recipient data to Toon Expo.
4. Toon Expo authenticates the partner route, assigns `sourceSystem=MOOTQ`, validates and stores the code unchanged.
5. Toon Expo stores EMAIL/SMS jobs and responds with `204`.
6. Toon Expo sends the matching QR/link asynchronously.

### Mootq retry

- Same source ID and same logical payload: return `204`, no second registration/send.
- Same source ID with different content: return `409`.
- Same ticket code belonging to another record: return `409`.
- Temporary failure: return `500/503`; Mootq retries with the same source ID/code.

## Hosted ticket

1. Email/SMS link contains a long private token.
2. Server resolves the registration and generates QR from stored `ticketCode`.
3. Page shows QR, readable code and PNG download.
4. Response is private/no-store/noindex.

## Delivery retry

1. Dispatcher claims a bounded batch of due jobs.
2. It sends through Resend or Peleka with timeout/idempotency.
3. Success marks the job sent.
4. Retryable failure schedules another attempt.
5. Permanent/max-attempt failure becomes visible to operations.

## Fast Toon Expo-origin feed

1. Mootq requests after its saved cursor.
2. Toon Expo returns a bounded ordered page.
3. Mootq upserts and saves the cursor.
4. Mootq immediately requests another page while `hasMore=true`.
5. Otherwise Mootq waits for its own chosen interval.

Toon Expo does not know or control whether the interval is one day or three seconds.

## Full import from Mootq

1. Admin presses `Import full data from Mootq`.
2. Toon Expo creates an `IMPORT_FROM_MQ` run.
3. Worker pulls Mootq pages and upserts by `ticketCode`.
4. It imports approved full fields and attendance.
5. Progress/counts are stored.
6. Run finishes as succeeded, partial or failed and can be rerun.

## Full export to Mootq

1. Mootq independently creates an authenticated export run.
2. Toon Expo records `EXPORT_TO_MQ`.
3. Mootq pulls bounded pages until complete.
4. Toon Expo stores completion/progress information available from requests.

## Open repeated-email branch

The product owner is awaiting an answer:

- if email is unique, the existing duplicate behavior remains;
- if one email may intentionally register multiple people, each intended submission needs its own idempotency key and email cannot be used for deduplication.

No implementation phase should guess this branch.
