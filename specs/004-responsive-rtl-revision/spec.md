# Feature Specification: Responsive and RTL Revision

**Feature Branch**: `004-responsive-rtl-revision`  
**Created**: 2026-02-25  
**Status**: Draft  
**Input**: User description: "revise the rtl, Itr, and the mobile design"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Flawless RTL Mirroring (Priority: P1)

As an Arabic user, I want the entire interface to mirror correctly (Right-to-Left) so that the navigation, icons, and text alignment follow my natural reading patterns.

**Why this priority**: RTL support is critical for the usability of the Arabic localization. Improper mirroring makes the app feel "broken" or "translated poorly".

**Independent Test**: Switch language to Arabic and verify that the sidebar moves to the right, text aligns to the right, and "next/back" arrows point in the correct direction.

**Acceptance Scenarios**:

1. **Given** the language is set to Arabic, **When** I view the Dashboard, **Then** the sidebar must be on the right side and the main content on the left.
2. **Given** a directional icon (e.g., an arrow indicating "Back"), **When** in RTL mode, **Then** it must point in the opposite direction compared to LTR.

---

### User Story 2 - Mobile First Optimization (Priority: P1)

As a mobile user, I want a seamless experience where charts, tables, and cards adapt to my screen size without horizontal scrolling or cramped elements.

**Why this priority**: A large portion of users access the system via mobile. Current components (like the expense chart) may have overflow issues.

**Independent Test**: Use Chrome DevTools (set to 360px width) and navigate through all pages to ensure no elements break out of the viewport.

**Acceptance Scenarios**:

1. **Given** a mobile screen (width < 640px), **When** I view the transactions table, **Then** it must transform into individual cards where labels and values are stacked vertically.
2. **Given** the balance chart, **When** viewed on mobile, **Then** the axes and labels must remain legible without overlapping.

---

### User Story 3 - LTR Regression Safety (Priority: P2)

As an English user, I want the standard LTR layout to remain unaffected by any RTL or mobile changes.

**Why this priority**: Enhancements for one mode must not break the other.

**Independent Test**: Run a regression test on the English/Desktop view after implementing RTL/Mobile changes.

**Acceptance Scenarios**:

1. **Given** the language is English, **When** I view the system on a Desktop, **Then** the layout must remain exactly as originally designed (Left-to-Right).

---

### Edge Cases

- **Mixed Content**: How does the system handle an English name within an Arabic layout? (Should maintain LTR for that specific string if possible, while the container remains RTL).
- **Small Screens (Foldables)**: Ensure layout doesn't break at extremely narrow widths (under 300px).

## Clarifications

### Session 2026-02-25

- Q: How should charts behave in RTL mode? → A: Enable native library RTL support (mirrored axes and legends, readable text).
- Q: How should larger tables behave on mobile? → A: Transform rows into cards (stacked layout).
- Q: Which mobile navigation pattern should be used? → A: Hamburger menu with a sliding drawer (Overlay/Push).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST support automatic layout switching based on the current locale's direction (dir="rtl" or dir="ltr").
- **FR-002**: System MUST use CSS logical properties or Tailwind `rtl:`/`ltr:` utilities for spacing and positioning.
- **FR-003**: All charts MUST be responsive and support native RTL mirroring (axes and legends) while maintaining readable text labels.
- **FR-004**: The navigation sidebar MUST use a hamburger menu icon that opens a sliding drawer (Overlay/Push) on mobile devices.
- **FR-005**: All forms MUST have vertical layouts on small screens to prevent labels from being cut off.

### Key Entities _(include if feature involves data)_

- **Viewport Config**: Breakpoints for mobile, tablet, and desktop.
- **Theme State**: Includes the current writing direction (RTL/LTR).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 0% horizontal overflow (no horizontal scrollbar) on any page at 360px viewport width.
- **SC-002**: 100% of "back/forward" navigation icons are mirrored in RTL.
- **SC-003**: Average touch target size for buttons is >= 44x44px on mobile views.
- **SC-004**: Dashboard charts load and render correctly on both iPhone SE (320px) and generic Android (360px-450px) simulators.
