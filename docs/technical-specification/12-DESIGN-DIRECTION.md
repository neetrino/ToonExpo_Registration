# Design direction

## Design goal

The public landing page and administrator panel must feel modern, creative and professionally designed while remaining minimal, clear and easy to use. The product must not look like a generic template or an undecorated collection of UI components.

## Core principles

- Modern minimalism with a strong visual hierarchy.
- Creative composition achieved through typography, spacing, proportions, grid, shapes and deliberate asymmetry.
- Flat solid colors only: **gradients are not allowed**.
- Toon Expo branding must remain recognizable without visual overload.
- Every decorative decision must support the event identity or improve comprehension.
- Mobile and desktop layouts must feel intentionally designed, not merely resized.

## Visual language

### Color

- Use the approved Toon Expo palette as the starting point: deep teal, secondary teal, accent teal, yellow accent, black, white and controlled neutral tones.
- Use solid color blocks and clear contrast instead of gradients.
- Yellow and bright teal are accents, not large default backgrounds.
- Avoid excessive colors, neon glow, multicolor effects and low-contrast tinted text.
- Public and admin surfaces may use different proportions of the same palette while remaining one product.

### Typography

- Typography is a primary creative element.
- Use a modern type system with a distinctive display treatment for event headlines and a highly readable interface face for forms and admin data.
- Establish clear levels for hero text, section titles, body copy, labels, metrics and table content.
- Avoid oversized text that damages mobile usability or pushes the registration action out of context.
- Verify Armenian, English and Russian glyph quality, line height and text wrapping before approving fonts.

### Layout and shape

- Use a disciplined responsive grid, generous negative space and intentional alignment.
- Creative asymmetry may be used in hero and marketing sections, but form controls and admin data remain predictable.
- Use solid geometric areas, cropped brand artwork, editorial framing and subtle layering where appropriate.
- Rounded corners must be consistent and restrained; not every element should be a pill or floating card.
- Borders and small tonal differences are preferred over heavy shadows.
- Shadows, if used, must be subtle, sparse and functional.

### Imagery and icons

- Use approved Toon Expo logo, artwork and event imagery.
- Do not copy unrelated imagery or content from the previous website without approved source assets.
- Icons must share one visual family and support comprehension.
- Avoid generic stock imagery when brand or architectural/event imagery is available.

### Motion

- Motion is optional and restrained.
- Use short transitions for hover, focus, form feedback and intentional section reveals.
- Avoid looping decorative animation, parallax that harms usability and exaggerated motion.
- Respect `prefers-reduced-motion`.

## Public landing page

### Desired impression

The landing page should feel like a contemporary event identity: confident, editorial, spacious and memorable. It must communicate Toon Expo before presenting the registration form, while keeping registration as the unmistakable primary action.

### Composition

- Strong branded hero with event name, confirmed date/place and primary registration call to action.
- A creative but concise content rhythm using solid color sections, typography and approved imagery.
- Registration section visually distinguished without looking detached from the landing page.
- Form width, field grouping and spacing optimized for quick completion.
- Language switcher visible and understandable without dominating navigation.
- Success, duplicate, validation, rate-limit and service-error states receive the same design care as the default form.
- Footer includes only approved organizer, legal and social information.

### Registration form

- Inputs must look modern but remain familiar and immediately usable.
- Labels remain visible; placeholders are supplementary.
- Focus, error, success, disabled and loading states are explicit.
- The main submit button has strong solid-color contrast and one clear hierarchy.
- Avoid glassmorphism, gradient borders, decorative input animations and excessive card nesting.

## Administrator panel

### Desired impression

The admin panel must be clean, calm and efficient, but not look like a default scaffold. It should use the same Toon Expo design language in a more restrained, data-oriented form.

### Dashboard

- Clear page title, event context and total registration metric.
- Search, export and table actions arranged by operational priority.
- Participant table optimized for scanning with deliberate column widths, alignment and typography.
- Use solid surfaces, subtle borders and restrained accent color for selected/interactive states.
- Empty, loading, no-results and failure states are designed components, not raw text.
- Destructive actions use a clear warning color and confirmation dialog without dominating normal usage.
- Mobile admin layout may transform rows into structured records/cards when a table no longer remains readable.

### Admin exclusions

- No decorative dashboard charts without an approved analytical need.
- No gradient metric cards.
- No dense sidebar full of unused navigation.
- No excessive badges, pills, glass panels or floating widgets.
- No participant data exposed for visual decoration or examples.

## Accessibility and usability

- Meet WCAG 2.2 AA contrast and interaction expectations for critical flows.
- Keyboard focus must be clearly visible and stylistically consistent.
- Color is never the only indicator of status or error.
- Touch targets are appropriate for mobile use.
- Layout must support zoom, long translations and validation messages without overlap.
- Creative layout choices must never reduce form completion or admin efficiency.

## Responsive checkpoints

Design and verify at minimum:

- compact mobile from 320 CSS pixels;
- common mobile widths;
- tablet portrait/landscape;
- laptop;
- wide desktop.

The implementation should interpolate naturally between checkpoints rather than target only fixed screenshots.

## Design acceptance criteria

- [ ] No gradients are present in public or admin UI.
- [ ] Landing and admin clearly belong to the same Toon Expo product.
- [ ] The result does not resemble an uncustomized shadcn/ui or dashboard template.
- [ ] Public registration remains the strongest and clearest action.
- [ ] All form and admin states are intentionally styled.
- [ ] Armenian, English and Russian typography/layout are verified.
- [ ] Mobile and desktop compositions both feel intentional.
- [ ] Contrast, keyboard focus and reduced-motion behavior are verified.
- [ ] Decorative elements do not reduce performance, accessibility or clarity.
