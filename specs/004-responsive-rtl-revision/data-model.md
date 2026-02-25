# UI Data Model: Responsive & RTL State

## Viewport State

- **isMobile**: boolean (breakpoint < 768px).
- **isDrawerOpen**: boolean (toggled by hamburger menu).

## Theme State

- **direction**: 'rtl' | 'ltr' (derived from `i18n.language`).
- **theme**: 'dark' | 'light' (existing).

## Components Mapping

- **Sidebar**:
  - Desktop: `w-64`, persistent.
  - Mobile: `w-full` drawer, absolute/fixed.
- **DataTable**:
  - Desktop: Standard HTML Table.
  - Mobile: Stacked Card list.
- **Chart**:
  - Desktop: Default Recharts.
  - Mobile: Reduced margin, hidden secondary labels.
