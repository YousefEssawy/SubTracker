# Tasks: Responsive and RTL Revision

**Input**: Design documents from `/specs/004-responsive-rtl-revision/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/DataTable.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify project structure and dependencies per plan.md in package.json
- [x] T002 [P] Establish CSS/Tailwind standards for logical properties (e.g., using `inset-inline-start` instead of `left`) in src/styles/globals.scss

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T003 Implement `useViewport` hook for responsive breakpoint detection in src/context/ViewportContext.jsx
- [x] T004 Provide `ViewportProvider` to handle resize listeners in src/App.jsx
- [x] T005 [P] Update `tailwind.config.js` with any missing RTL-specific spacing or layout utilities

---

## Phase 3: User Story 1 - Flawless RTL Mirroring (Priority: P1)

**Goal**: Interface correctly mirrors in Arabic (RTL) mode, including navigation, icons, and alignment.

**Independent Test**: Toggle language to Arabic and verify Sidebar is on the right, content is on the left, and directional icons are flipped.

### Implementation for User Story 1

- [x] T006 [P] [US1] Update icons in sidebar and header to support RTL mirroring (flipped arrows) in src/components/layout/Sidebar.jsx and src/components/layout/Header.jsx
- [x] T007 [P] [US1] Refactor Sidebar layout to use Tailwind logical properties (`start-0`, `border-e`) in src/components/layout/Sidebar.jsx
- [x] T008 [P] [US1] Refactor Header layout to use Tailwind logical properties (`end-0`) in src/components/layout/Header.jsx
- [x] T009 [US1] Implement native RTL support for Recharts (axes and legends mirroring) in src/pages/DashboardPage.jsx

**Checkpoint**: User Story 1 should be fully functional; the app should look and flow correctly in Arabic RTL mode.

---

## Phase 4: User Story 2 - Mobile First Optimization (Priority: P1) 🎯 MVP

**Goal**: Seamless experience on mobile devices with card-style table transformations and optimized charts.

**Independent Test**: View Transactions page on a 360px viewport; transactions should appear as cards, and charts should fit without overflow.

### Implementation for User Story 2

- [x] T010 [P] [US2] Update `DataTable` (or `TransactionListItem`) to support stacked card layout on mobile in src/components/finance/TransactionListItem.jsx
- [x] T011 [US2] Implement Hamburger menu with sliding drawer for mobile navigation in src/components/layout/Sidebar.jsx and src/components/layout/Header.jsx
- [x] T012 [US2] Optimize Dashboard summary cards for 1-column layout on mobile in src/pages/DashboardPage.jsx
- [x] T013 [P] [US2] Refactor all forms to use vertical stacking for labels and inputs on mobile in src/components/finance/TransactionFormPage.jsx
- [x] T014 [US2] Adjust Recharts margins and label visibility for small screens in src/pages/DashboardPage.jsx

**Checkpoint**: User Story 2 should be fully functional; the app should be 100% usable on mobile with no horizontal scrolling.

---

## Phase 5: User Story 3 - LTR Regression Safety (Priority: P2)

**Goal**: Ensure English LTR layout remains unaffected by RTL and Mobile changes.

**Independent Test**: Walk through the app in English on Desktop and verify layout matches original design perfectly.

### Implementation for User Story 3

- [x] T015 [US3] Perform visual regression check on all primary pages in English/Desktop mode
- [x] T016 [US3] Fix any alignment or spacing issues introduced by logical property refactoring in src/styles/globals.scss

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T017 [P] Final audit of all buttons to ensure touch target size >= 44x44px in src/components/ui/
- [x] T018 Ensure smooth 60fps animations for mobile drawer using Framer Motion
- [x] T019 Run validation against quickstart.md and success criteria in spec.md
- [x] T020 [P] Update documentation with RTL/Mobile design guidelines in README.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all mobile/responsive logic.
- **User Stories (Phase 3 & 4)**: Can proceed in parallel after Phase 2, but P1 stories should be prioritized.
- **Polish (Final Phase)**: Depends on all user stories being complete.

### Parallel Opportunities

- T006, T007, T008 (Layout refactoring for RTL) can run in parallel.
- T010, T013 (Mobile card transformation and form stacking) can run in parallel.
- Once Foundational phase (T003-T005) is done, US1 and US2 implementation can technically overlap.

---

## Parallel Example: User Story 2

```bash
# Launch mobile layout tasks together:
Task: "Update TransactionListItem to support stacked card layout on mobile"
Task: "Refactor all forms to use vertical stacking for labels and inputs on mobile"
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

1. Complete Phase 1 & 2.
2. Implement US2 (Mobile Optimization) as it resolves current critical overflow issues.
3. Implement US1 (RTL Mirroring) to complete the Localization effort.
4. **STOP and VALIDATE**: Test on mobile + Arabic.

### Incremental Delivery

1. Foundation ready (Breakpoint detection).
2. Mobile Drawer + Table Cards → Responsive MVP.
3. RTL Directionality → Global MVP.
4. Final regressions and polish.
