# Research: Responsive and RTL Revision

## Recharts RTL Support

- **Decision**: Use the `reversed` prop on `XAxis` and `orientation="right"` on `YAxis` when `document.documentElement.dir === 'rtl'`.
- **Rationale**: Recharts doesn't automatically detect direction. Manual prop injection based on the `i18n.language` or `dir` attribute is the most robust way.
- **Alternatives**: Using CSS `transform: scaleX(-1)` on the container was rejected because it mirrors text and makes labels unreadable.

## Tailwind Table-to-Card Transformation

- **Decision**: Use a hidden-on-mobile `<thead>` and a `grid` or `flex-col` layout for `<tr>` on mobile screens (`max-md:`).
- **Rationale**: Modern responsive tables often hide the header and show "label: value" pairs in card format for better readability on narrow screens.
- **Implementation**:
  - `<thead>` hidden at `max-md`.
  - `<tr>` becomes `flex flex-col` or `grid` with padding/border to look like a card.
  - `<td>` uses `:before` content or a small `<span class="md:hidden">Label: </span>` to provide context.

## Navigation Sidebar & Drawer

- **Decision**: Use `Framer Motion`'s `AnimatePresence` and `motion.div` for the sidebar.
- **Rationale**: Provides smooth entry/exit animations for the mobile drawer.
- **Pattern**:
  - Desktop: Static sidebar (fixed width).
  - Mobile: Hamburger menu toggles a `fixed inset-0` overlay/drawer.
  - Sync with `react-router-dom` to close drawer on navigation.
