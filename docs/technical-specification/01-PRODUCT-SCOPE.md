# Product scope

## Goal

Create a polished Toon Expo landing page that makes event registration fast and trustworthy, stores each valid registration reliably, sends a localized confirmation email and gives one administrator an accurate operational view of participants.

## Users

### Visitor

A visitor discovers event information, chooses one of three languages and registers using a mobile or desktop browser. No account is created.

### Administrator

One authorized operator signs in to review the total and detailed registration list, search participants, delete an erroneous entry and export the current dataset.

## MVP

### Public landing

- Toon Expo branded hero section.
- Event summary, date, venue and relevant supporting sections once content is supplied.
- Prominent registration call to action.
- Armenian, English and Russian routes and content.
- Registration form embedded on or linked from the landing page.
- Privacy-policy link and required consent.
- Localized success, validation, duplicate and temporary-failure states.
- Responsive design, SEO metadata and social sharing metadata.

### Registration service

- Validate and normalize all fields on the server.
- Persist one registration per normalized email per event.
- Remain correct during concurrent duplicate submissions.
- Attempt a localized confirmation email after persistence.
- Track email delivery outcome independently of registration validity.
- Protect the mutation endpoint from abuse.

### Administration

- Protected login for one administrator.
- Total registration count.
- Paginated participant list.
- Search by name, email or phone.
- Stable ordering by registration date.
- Participant detail view if the table does not display every required field.
- Confirmed deletion.
- CSV export.
- Logout.

## Out of scope

- Participant accounts or sign-in.
- Participant data editing by the administrator.
- Capacity limits, waiting lists, approval or registration status workflows.
- Payments, tickets, QR codes, badges and on-site check-in.
- SMS or messaging integrations.
- Questionnaire fields in the first release.
- Multiple administrator roles.
- Content management system.
- Redis or application queues.
- Production deployment performed automatically by the agent.

## Future-compatible decisions

- Registrations belong to an `Event`, even though the MVP operates one active event.
- Locale is stored with each registration for email and later communications.
- Questionnaire tables can be added later without modifying core identity fields.
- Infrastructure remains a single application until product complexity, not traffic alone, justifies separation.

## Success measures

- A normal visitor can complete registration without assistance on a current mobile device.
- A valid registration is never lost because email delivery fails.
- Concurrent attempts cannot create duplicate registrations for the same event/email.
- The administrator can obtain an accurate CSV without direct database access.
- The application remains healthy during the agreed burst test.
