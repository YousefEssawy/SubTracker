# Tasks: Mobile Design Refactor

**Input**: Design documents from `/specs/1-mobile-design-refactor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and validation

- [x] T001 Verify `framer-motion` and Tailwind CSS configurations in `package.json` and `tailwind.config.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 Refactor `src/App.jsx` routing to establish distinct `/` and `/dashboard` behaviors to support upcoming public vs authenticated splits

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Public Landing Page (Priority: P1) 🎯 MVP

**Goal**: Provide a public landing page accessible to unauthenticated users at the root route and redirect authenticated users to their dashboard.

**Independent Test**: Visit root URL `/` logged out -> see Landing Page. Log in and visit `/` -> redirect to `/dashboard`.

### Implementation for User Story 1

- [x] T003 [P] [US1] Create LandingPage component with Hero, About, How to Use, Coming Soon, and Sign Up CTA in `src/pages/LandingPage.jsx`
- [x] T004 [US1] Update routing in `src/App.jsx` to serve LandingPage at `/` for unauthenticated users and redirect authenticated users to `/dashboard`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Standardized Responsive Navigation (Priority: P1)

**Goal**: Users navigate the application using a standardized side menu instead of a bottom navigation bar (docked on desktop, slide-out drawer on mobile).

**Independent Test**: Navigate on mobile to see slide-out drawer. Navigate on desktop to see docked sidebar. No bottom navigation bar present.

### Implementation for User Story 2

- [x] T005 [P] [US2] Create Sidebar component with framer-motion drawer animations in `src/components/layout/Sidebar.jsx`
- [x] T006 [US2] Refactor `src/components/layout/Layout.jsx` to completely remove bottom navigation bar and incorporate the Sidebar component
- [x] T007 [US2] Update `src/components/layout/Header.jsx` to contain a hamburger menu toggle that manages Sidebar state on mobile viewports

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Mobile Responsiveness (Priority: P2)

**Goal**: Users on small mobile devices (down to 320px width) experience a clean layout without horizontal scrolling.

**Independent Test**: Resize viewport to 320px on any page; verify no horizontal scrollbars appear.

### Implementation for User Story 3

- [x] T008 [P] [US3] Add global `overflow-x-hidden` constraints to root elements in `index.html` or `src/index.css` to prevent body scrolling
- [x] T009 [US3] Review and adjust Tailwind utility classes in existing main views (e.g. `src/pages/DashboardPage.jsx`) to ensure `<320px` compatibility

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T010 [P] Run validation steps outlined in `quickstart.md`
- [x] T011 Code cleanup and removing any unused bottom-nav assets or CSS

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1. Blocks user stories.
- **User Stories (Phase 3-5)**: Depend on Foundational phase. Proceed sequentially.
- **Polish (Phase 6)**: Depends on all user stories completing.

### User Story Dependencies

- **User Story 1**: Depends on Base App routing refactor.
- **User Story 2**: Independent, but touches Layout. Avoid modifying App.jsx at the same time.
- **User Story 3**: Relies on Navigation and Landing Page being built to test responsiveness across the board.

### Parallel Opportunities

- LandingPage Component creation (T003) and Sidebar Component creation (T005) can be developed independently inside of their respective stories.
- Global CSS constraint fixes (T008) can be executed concurrently with component creation.
