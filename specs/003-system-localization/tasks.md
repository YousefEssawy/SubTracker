# Tasks: System Localization Revision

**Input**: Design documents from `/specs/003-system-localization/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify/Install `i18next-parser` as a devDependency in `package.json`
- [x] T002 Configure `i18next-parser.config.js` to scan `src/**/*.{js,jsx}` for localization keys

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and audit baseline

- [x] T003 Run initial string extraction to identify hardcoded text vs translation keys via `npm run extract`
- [x] T004 Update `src/i18n.js` to configure `fallbackLng: 'en'` and enabled simplified pluralization for Arabic
- [x] T005 [P] Ensure `localStorage` persistence logic for locale is robust in `src/i18n.js`

---

## Phase 3: User Story 1 - Comprehensive Arabic Review (Priority: P1)

**Goal**: Professional, naturally phrased Arabic text across all pages.

**Independent Test**: Switch system to Arabic and verify all labels in Dashboard, Subscriptions, and Settings are natural and correctly mapped.

### Implementation for User Story 1

- [x] T006 [P] [US1] Complete review and professional translation of all keys in `src/locales/ar/translation.json`
- [x] T007 [US1] Implement simplified Arabic pluralization (`_zero`, `_few`, `_many`) in `src/locales/ar/translation.json`
- [x] T008 [US1] Replace identified hardcoded strings in `src/components/layout/Header.jsx` and `src/components/layout/Sidebar.jsx` with `t()` calls
- [x] T009 [US1] Replace identified hardcoded strings in `src/pages/DashboardPage.jsx` and `src/pages/SubscriptionsPage.jsx` with `t()` calls

**Checkpoint**: Application UI is 100% localized in Arabic with professional phrasing.

---

## Phase 4: User Story 2 - English Consistency Audit (Priority: P2)

**Goal**: Unified terminology ("Income" and "Expense") throughout the English interface.

**Independent Test**: Conduct a full walkthrough in English and verify "Income" and "Expense" are used consistently across all screens.

### Implementation for User Story 2

- [x] T010 [P] [US2] Update all English keys to use "Income" and "Expense" in `src/locales/en/translation.json`
- [x] T011 [US2] Verify and correct terminology consistency in `src/components/finance/BalanceCard.jsx` and `src/components/finance/FilterBar.jsx`
- [x] T012 [US2] Standardize button labels (e.g., "Add Expense" vs "Add Income") in `src/pages/TransactionFormPage.jsx`

**Checkpoint**: Terminology is 100% consistent across the English UI.

---

## Phase 5: User Story 3 - Dynamic Localization (Dates & Currencies) (Priority: P2)

**Goal**: Localized date and currency formatting using native `Intl` APIs.

**Independent Test**: Change language to Arabic and verify date formats and currency symbols/placement update automatically.

### Implementation for User Story 3

- [x] T013 [P] [US3] Implement `Intl.DateTimeFormat` wrapper in `src/utils/dateUtils.js` to support locale-aware dates
- [x] T014 [P] [US3] Implement `Intl.NumberFormat` wrapper in `src/utils/currencies.js` to support locale-aware currency display
- [x] T015 [US3] Refactor `src/components/finance/TransactionListItem.jsx` to use new `Intl` formatters
- [x] T016 [US3] Refactor `src/pages/DashboardPage.jsx` charts and summary cards to use new `Intl` formatters

**Checkpoint**: All dates and currencies follow cultural norms for the active language.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality audit and edge case handling

- [x] T017 [P] Localize all error/success toast notifications in `src/components/` and `src/services/`
- [x] T018 Final coverage check via `i18next-parser` to confirm zero missing keys in any language
- [x] T019 [P] Update developer documentation with the new localization workflow in `README.md`
- [x] T020 Validate full system against `quickstart.md` test scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion (Extraction tools ready).
- **User Stories (Phase 3+)**: All depend on Phase 2 (Audit baseline complete).
  - US1 (Arabic) and US2 (English) can proceed in parallel.
  - US3 (Formatting) depends on having the i18n instance ready (Phase 2).
- **Polish (Phase 6)**: Depends on all user stories being complete.

### Parallel Opportunities

- T006, T007 (Arabic key management) can run in parallel with T010 (English key management).
- T013, T014 (Date/Currency utilities) can run in parallel.
- Tool configuration (T001, T002) can run while manual strings audit begins.

---

## Parallel Example: User Story 1 & 2

```bash
# Manage keys for both languages simultaneously:
Task: "Complete review and professional translation of all keys in src/locales/ar/translation.json"
Task: "Update all English keys to use 'Income' and 'Expense' in src/locales/en/translation.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

1. Complete Phase 1 & 2 to establish auditing tools.
2. Implement US1 (Arabic Review) as it is the highest priority (P1).
3. Implement US2 (English Consistency) to unify the UX.
4. **STOP and VALIDATE**: Verify all UI text is localized and consistent.

### Incremental Delivery

1. Foundation ready (i18n instance + extraction).
2. Arabic UI localized (US1).
3. English terminology unified (US2).
4. Formatting overhauled (US3).
5. Final polish and documentation.
