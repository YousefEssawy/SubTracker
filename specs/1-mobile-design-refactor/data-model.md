# Data Model & Interfaces: Mobile Design Refactor

No new external integrations, storage changes, or complex data models are included.

## Interface Constraints

- **Sidebar State Management**: The `IsMenuOpen` boolean piece of state controls the slide-out menu visibility on mobile devices.
- **Window Dimensions**: Minimal viewport target is defined as `320px`. The interface dictates zero horizontal scrolling `<html class="overflow-x-hidden">`.
- **Sidebar Layout Contract**:
  - Desktop: Permanent block element (e.g. `w-64 fixed inset-y-0 left-0 hidden md:block`).
  - Mobile: Overlay/drawer that toggles state on hamburger menu click.

## Routing Alterations (Internal API)

- `GET /`: Resolved to `<LandingPage>` if logged out, or `<Navigate to="/dashboard">` if logged in.
- `GET /dashboard`: Original `GET /` logic when authenticated.
