---
description: "Task list template for feature implementation"
---

# Tasks: Migrate UI to TSX

**Input**: Design documents from `/specs/005-migrate-tsx/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup & Foundational

**Purpose**: Project initialization and basic structure

There are no broad infrastructural setup changes required for this feature, as TypeScript toolchains and configuration (`tsconfig.app.json`, `tsconfig.node.json`) were completely set up and validated in Phase 1 (`001-strong-type-models`).

---

## Phase 2: User Story 1 - Fix Dev Server and Imports (Priority: P1) 🎯 MVP

**Goal**: Resolve the broken development server caused by previous `.js` file deletions. Modules must be imported without hardcoded `.js` extensions.

**Independent Test**: Running `npm run dev` yields zero "Failed to load" or module resolution errors in the CLI output.

### Implementation for User Story 1

- [x] T001 [P] [US1] Remove `.js` and `.jsx` explicit extensions from all local imports within `src/pages/` using a workspace symbol replacement or exact file manipulation
- [x] T002 [P] [US1] Remove `.js` and `.jsx` explicit extensions from all local imports within `src/components/`
- [x] T003 [P] [US1] Remove `.js` and `.jsx` explicit extensions from imports in `src/App.jsx`
- [x] T004 [US1] Start the dev server (`npm run dev`) and visually ensure the application renders continuously without compilation failures

**Checkpoint**: At this point, the application runs successfully in the browser on the `dev` server.

---

## Phase 3: User Story 2 - Migrate Shared Components to TSX (Priority: P2)

**Goal**: Convert all reusable `src/components/` files to TypeScript (`.tsx`). Remove old JSDoc prop typings and declare React `interface` props for safe parent consumption.

**Independent Test**: All files end in `.tsx`, and `npm run typecheck` produces zero errors for the `src/components/` directory.

### Implementation for User Story 2

- [ ] T005 [P] [US2] Migrate and strongly type `src/components/finance/BalanceCard.tsx`
- [ ] T006 [P] [US2] Migrate and strongly type `src/components/finance/CategoryForm.tsx`
- [ ] T007 [P] [US2] Migrate and strongly type `src/components/finance/FileUpload.tsx` (Use `React.ChangeEvent` and `React.DragEvent`)
- [ ] T008 [P] [US2] Migrate and strongly type `src/components/finance/FilterBar.tsx`
- [ ] T009 [P] [US2] Migrate and strongly type `src/components/finance/RecurrenceForm.tsx`
- [ ] T010 [P] [US2] Migrate and strongly type `src/components/finance/SpaceForm.tsx`
- [ ] T011 [P] [US2] Migrate and strongly type `src/components/finance/TagInput.tsx`
- [ ] T012 [P] [US2] Migrate and strongly type `src/components/finance/TransactionListItem.tsx`
- [ ] T013 [P] [US2] Migrate and strongly type `src/components/layout/Header.tsx`
- [ ] T014 [P] [US2] Migrate and strongly type `src/components/layout/Sidebar.tsx`
- [ ] T015 [P] [US2] Migrate and strongly type `src/components/layout/Layout.tsx`
- [ ] T016 [P] [US2] Migrate and strongly type `src/components/ui/ConfirmDialog.tsx`
- [ ] T017 [P] [US2] Migrate and strongly type `src/components/ui/Pagination.tsx`

**Checkpoint**: Shared building blocks are now fully strongly typed.

---

## Phase 4: User Story 3 - Migrate Application Pages to TSX (Priority: P3)

**Goal**: Convert all page structures and root orchestrators to `.tsx`. They must correctly synthesize typed Services and typed Contexts, passing them reliably into the typed Components.

**Independent Test**: All files end in `.tsx`. `npm run typecheck` yields 0 errors for the entire project.

### Implementation for User Story 3

- [ ] T018 [P] [US3] Migrate and strongly type `src/pages/AboutPage.tsx`
- [ ] T019 [P] [US3] Migrate and strongly type `src/pages/CategoriesPage.tsx`
- [ ] T020 [P] [US3] Migrate and strongly type `src/pages/ComingSoonPage.tsx`
- [ ] T021 [P] [US3] Migrate and strongly type `src/pages/DashboardPage.tsx`
- [ ] T022 [P] [US3] Migrate and strongly type `src/pages/HistoryPage.tsx`
- [ ] T023 [P] [US3] Migrate and strongly type `src/pages/HowToPage.tsx`
- [ ] T024 [P] [US3] Migrate and strongly type `src/pages/LandingPage.tsx`
- [ ] T025 [P] [US3] Migrate and strongly type `src/pages/LoginPage.tsx`
- [ ] T026 [P] [US3] Migrate and strongly type `src/pages/RecurrencesPage.tsx`
- [ ] T027 [P] [US3] Migrate and strongly type `src/pages/SettingsPage.tsx`
- [ ] T028 [P] [US3] Migrate and strongly type `src/pages/SignupPage.tsx`
- [ ] T029 [P] [US3] Migrate and strongly type `src/pages/SpacesPage.tsx`
- [ ] T030 [P] [US3] Migrate and strongly type `src/pages/SubscriptionFormPage.tsx`
- [ ] T031 [P] [US3] Migrate and strongly type `src/pages/SubscriptionsPage.tsx`
- [ ] T032 [P] [US3] Migrate and strongly type `src/pages/TransactionDetailPage.tsx`
- [ ] T033 [P] [US3] Migrate and strongly type `src/pages/TransactionFormPage.tsx`
- [ ] T034 [P] [US3] Migrate and strongly type `src/pages/TransactionsPage.tsx`
- [ ] T035 [US3] Migrate and strongly type root router `src/App.tsx`
- [ ] T036 [US3] Migrate and strongly type root endpoint `src/main.tsx`

**Checkpoint**: Frontend UI represents a fully strongly typed 100% TSX coverage.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verifying compiler constraints, executing manual tests, and finalizing file cleanup.

- [ ] T037 Delete original `.jsx` files from `src/components/`, `src/pages/`, and root (`src/App.jsx`, `src/main.jsx`)
- [ ] T038 Search codebase for literal `: any` or `as any` and fix any occurrences to enforce zero `any` usage
- [ ] T039 Run final `npm run typecheck` to verify exactly 0 errors and 0 warnings
- [ ] T040 Run `npm run build` and ensure Vite successfully builds the static bundle without type emission errors
- [ ] T041 Update `specs/005-migrate-tsx/checklists/requirements.md` ensuring all items pass verification

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Story 1 (P1)**: No dependencies. Should be executed immediately to restore dev server availability.
- **User Story 2 (P2)**: Depends on US1 (to avoid breaking the build further).
- **User Story 3 (P3)**: Depends on US2 (Pages consume shared components; components must be typed first).
- **Polish (Final Phase)**: Depends on P3 completeness.

### Parallel Opportunities

- Within US1, fixing imports across `src/pages/` and `src/components/` can be done using bulk search-replace in parallel.
- Within US2, independent components inside `finance/`, `layout/`, and `ui/` have no internal hierarchy and can be migrated concurrently.
- Within US3, all pages are independent route modules and can be migrated concurrently, ending with `App.tsx` and `main.tsx`.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Bulk remove `.js` extensions from `src/components/` and `src/pages/`
2. Run `npm run dev` to unblock manual development operations. (This is immediately deliverable).

### Incremental Delivery

1. Fix the dev server (`US1`).
2. Migrate dumb/shared components mapping JSDocs to TypeScript Interfaces (`US2`).
3. Migrate top-level pages converting prop-drilling contexts into strongly inferred data (`US3`).
4. Perform final cleanup and strict compiler assertions (`Phase N`).
