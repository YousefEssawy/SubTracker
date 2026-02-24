# Research: Mobile Design Refactor

## Routing Strategy for Authenticated vs Unauthenticated Users

**Decision**: Modify `App.jsx` to render `<LandingPage />` at the `/` route for `user === null` instead of purely redirecting unauthenticated users to `/login`. For authenticated users, `/` should either display the `<DashboardPage />` or explicitly redirect them to `/dashboard`. This complies with FR-006 (redirect authenticated users from public page).

**Rationale**: The current `App.jsx` requires all non-auth routes to be protected. The refactoring needs a public landing page. Redefining `/` allows the landing page to act as the primary marketing material.

**Alternatives considered**: Setting a different URL (like `/home`) for the landing page. It's less professional than serving at root `/`.

## Side Menu Animation and Interactivity

**Decision**: Use `framer-motion` for the side menu drawer opening/closing on small screens. Use standard CSS media queries (`sm:`, `md:`, `lg:`) via Tailwind classes to conditionally switch the sidebar from fixed left position to an off-screen drawer on mobile.

**Rationale**: `framer-motion` is already installed as a dependency and provides 60fps polished animations. Tailwind can easily accomplish the responsiveness.

**Alternatives considered**: Using plain CSS transitions (viable but less capable of orchestrating complex staggering if needed, though sufficient).

## Layout Re-architecture

**Decision**: Extract the `Layout.jsx` container away from managing the bottom navigation, delete bottom nav, and import a standalone `Sidebar.jsx`.

**Rationale**: Conforms identically with the requirements dictating the removal of the bottom navigation bar and the standardization of side-nav.

**Alternatives considered**: Modifying `Header.jsx` to manage the sidebar toggle event and passing state down (requires context or prop-drilling).
