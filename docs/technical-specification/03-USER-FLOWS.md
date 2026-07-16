# User flows

## Visitor registration

```text
Open locale landing page
  → review event information
  → choose/change language if needed
  → open registration section
  → enter name, surname, email and phone
  → accept privacy policy
  → submit
  → see pending state
  → server validates and stores registration
  → see localized success state
  → receive localized confirmation email
```

### Validation branch

1. Invalid client-side fields are identified next to the relevant input.
2. The form focuses the first invalid field and exposes an accessible error summary when useful.
3. Server-side validation may still reject the request.
4. No registration or email attempt occurs for an invalid request.

### Duplicate branch

1. The visitor submits an email already registered for the event.
2. The database uniqueness constraint prevents a second row, including during concurrent requests.
3. The user receives a localized, non-technical message explaining that the email is already registered.
4. The response must not expose other participant information.

### Email failure branch

1. The registration is stored successfully.
2. Resend times out or rejects the request.
3. The system records the failed delivery attempt.
4. The visitor still sees that registration succeeded; the message may note that email delivery can be delayed.
5. Operations can identify the failure without reading sensitive values from application logs.

### Rate-limit branch

1. A source exceeds the Vercel WAF threshold for the registration endpoint.
2. Vercel returns `429` before the mutation reaches application/database work.
3. The UI shows a localized retry-later message when it receives `429`.
4. Already stored registrations remain unaffected.

## Administrator login

```text
Open /admin
  → unauthenticated visitor is redirected to /admin/login
  → enter administrator credentials
  → Auth.js validates credentials and throttle state
  → valid session opens dashboard
```

Invalid credentials never disclose whether the email or password was incorrect.

## Review registrations

```text
Open dashboard
  → see total count and newest registrations
  → paginate or search
  → inspect participant information
```

Search and page state SHOULD be represented in the URL so refresh/back navigation behaves predictably.

## Delete registration

```text
Select delete
  → confirmation dialog names the target safely
  → cancel leaves data unchanged
  → confirm sends authorized mutation
  → server deletes or marks deleted according to final privacy policy
  → list and count refresh
```

The implementation must select hard delete versus audited soft delete before the database migration is finalized. The MVP UI presents no general registration status workflow.

## Export registrations

```text
Choose Export CSV
  → server verifies administrator session
  → server applies event/filter scope
  → server generates formula-safe UTF-8 CSV
  → browser downloads timestamped file
```

The CSV endpoint must never be accessible through a copied unauthenticated URL.
