# Tasks: Expense & Income Tracking System

**Input**: Design documents from `/specs/002-expense-income-tracking/`  
**Prerequisites**: plan.md (✅), spec.md (✅), research.md (✅), data-model.md (✅), contracts/ (✅)

**Tests**: Not requested in feature specification. Manual testing only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, shared utilities, and Firebase configuration updates

- [x] T001 Update Firebase configuration to export Storage in `src/services/firebase.js` — add `import { getStorage } from "firebase/storage"` and `export const storage = getStorage(app)`
- [x] T002 [P] Create shared validation utilities in `src/utils/validationUtils.js` — implement `validateAmount(amount)` (>0, ≤999999999.99, round to 2dp), `validateRequired(fields)`, `validateCurrency(code)` against the CURRENCIES list in `src/utils/currencies.js`, and `validateDate(dateString)` for YYYY-MM-DD format
- [x] T003 [P] Create balance computation utility in `src/utils/balanceUtils.js` — implement `computeBalances(transactions)` that groups transactions by currency and returns `Map<currency, { income, expense, balance }>`, ensuring currencies are never summed together. Also implement `filterTransactions(transactions, { spaceId?, currency?, dateRange?, type? })` for client-side filtering
- [x] T004 [P] Create predefined space palettes in `src/utils/spaceDefaults.js` — export `SPACE_COLORS` (array of 12 hex color codes like `#6366F1`, `#EF4444`, etc.) and `SPACE_ICONS` (array of 15-20 emoji icons like `💼`, `🏠`, `💰`, `🎓`, `✈️`, `🍽️`, `🏥`, `💻`, `🎮`, `📱`, `🛒`, `🏦`) for space creation/editing
- [x] T005 Update sidebar navigation in `src/components/layout/Sidebar.jsx` — add new nav items: "Spaces", "Categories", "Transactions", and "Recurrences" (disabled/coming soon initially) under a "Finance" section group with appropriate icons from react-icons
- [x] T006 Add new routes in `src/App.jsx` — add protected routes for `/spaces`, `/categories`, `/transactions`, `/transactions/add`, `/transactions/:id`, `/transactions/:id/edit`, `/categories/add`, `/recurrences` (coming soon). Wrap finance routes in new context providers (SpaceProvider, CategoryProvider, TransactionProvider)

**Checkpoint**: ✅ Foundation ready — shared utilities, navigation, and routing in place

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Service layer for Spaces and Categories — these entities MUST exist before transactions can be created

**⚠️ CRITICAL**: No transaction-related work (US3+) can begin until Spaces and Categories services are complete

- [x] T007 [P] Implement Space service in `src/services/spaceService.js` — implement `addSpace(userId, spaceData)`, `updateSpace(userId, spaceId, data)`, `deleteSpace(userId, spaceId)`, and `subscribeToSpaces(userId, callback)` per service contracts. Collection path: `users/{userId}/spaces`. Include deletion guard that checks `transactions` and `recurrences` subcollections via `where("spaceId", "==", spaceId).limit(1)` queries before allowing delete. Throw descriptive error if linked entities exist.
- [x] T008 [P] Implement Category service in `src/services/categoryService.js` — implement `addCategory(userId, categoryData)`, `updateCategory(userId, categoryId, data)`, `deleteCategory(userId, categoryId)`, and `subscribeToCategories(userId, callback)` per service contracts. Collection path: `users/{userId}/categories`. Category `type` field ("Income"|"Expense") is immutable — `updateCategory` must only allow name changes. Include deletion guard identical to Space service but checking `categoryId` references.
- [x] T009 Implement Space context provider in `src/contexts/SpaceContext.jsx` — create `SpaceProvider` and `useSpaces` hook. Subscribe to real-time space data via `subscribeToSpaces`. Expose `{ spaces, loading, addSpace, updateSpace, deleteSpace, getSpaceById }`. Follow the existing `SubscriptionContext.jsx` pattern with `onSnapshot` listener setup/teardown in `useEffect`.
- [x] T010 Implement Category context provider in `src/contexts/CategoryContext.jsx` — create `CategoryProvider` and `useCategories` hook. Subscribe to real-time category data via `subscribeToCategories`. Expose `{ categories, loading, incomeCategories, expenseCategories, addCategory, updateCategory, deleteCategory, getCategoryById }`. Derive `incomeCategories` and `expenseCategories` from filtered `categories` array.

**Checkpoint**: ✅ Space and Category CRUD fully functional — US1 and US2 page work can begin

---

## Phase 3: User Story 1 — Create and Manage Spaces (Priority: P1) 🎯 MVP

**Goal**: Users can create, edit, and delete spaces with name, color, and icon. Deletion is prevented when linked transactions exist.

**Independent Test**: Navigate to /spaces, create a space with name "Personal", color, and icon. Edit its name. Try to delete it — should succeed (no transactions yet). After transactions are added in US3, deletion should be blocked.

### Implementation for User Story 1

- [x] T011 [P] [US1] Create SpaceForm component in `src/components/finance/SpaceForm.jsx` — modal/dialog form for creating and editing spaces. Fields: name input (max 50 chars), color picker (grid of 12 predefined SPACE_COLORS), icon picker (grid of SPACE_ICONS emojis). Pre-populate fields when editing an existing space. Use react-hot-toast for success/error notifications. Include form validation (name required, trimmed).
- [x] T012 [US1] Create SpacesPage in `src/pages/SpacesPage.jsx` — page listing all user's spaces in a responsive grid/card layout. Each space card shows the icon, name, and color indicator. Include "Add Space" button that opens SpaceForm modal. Each card has edit (pencil icon) and delete (trash icon) action buttons. Delete button triggers confirmation dialog; on confirm, calls `deleteSpace` and shows toast on success or descriptive error message on failure (linked transactions). Empty state with illustration and "Create your first space" CTA when no spaces exist. Use Framer Motion for card entry animations.

**Checkpoint**: ✅ User Story 1 complete — spaces can be created, edited, and deleted with full deletion protection

---

## Phase 4: User Story 2 — Create and Manage Categories (Priority: P1)

**Goal**: Users can create, edit, and delete categories typed as Income or Expense. Deletion is prevented when linked transactions exist.

**Independent Test**: Navigate to /categories, create an income category "Salary" and an expense category "Rent". Edit "Rent" to "Monthly Rent". Try delete — should succeed (no transactions). Type should be shown but not editable.

### Implementation for User Story 2

- [x] T013 [P] [US2] Create CategoryForm component in `src/components/finance/CategoryForm.jsx` — modal/dialog form for creating and editing categories. Fields: name input (max 50 chars), type selector (Income/Expense toggle or radio — only shown on create, disabled on edit since type is immutable). Use react-hot-toast for success/error. Include form validation (name required, type required on create).
- [x] T014 [US2] Create CategoriesPage in `src/pages/CategoriesPage.jsx` — page listing all user's categories, visually grouped or filterable by type (Income/Expense tabs or toggle). Each category shows name and type badge (green for Income, red for Expense). Include "Add Category" button. Each item has edit and delete actions. Delete shows confirmation and blocks with descriptive toast if linked transactions exist. Empty state with "Create your first category" CTA. Use Framer Motion for list animations.

**Checkpoint**: ✅ User Story 2 complete — categories fully manageable, type immutability enforced

---

## Phase 5: User Story 3 — Record Income and Expense Transactions (Priority: P1)

**Goal**: Users can create and edit transactions with space, category, type, amount, currency, and date. Transactions displayed in a paginated, filterable list sorted newest-first.

**Independent Test**: Create an income transaction for 5000 EGP in space "Personal" with category "Salary". Create an expense transaction for 200 USD. View transaction list — newest should appear first. Filter by space, filter by type. Verify pagination with 15+ transactions.

### Implementation for User Story 3

- [x] T015 Implement Transaction service in `src/services/transactionService.js` — implement `addTransaction(userId, data)`, `updateTransaction(userId, txId, data)`, `getTransaction(userId, txId)`, `subscribeToTransactions(userId, filters, callback)` with cursor-based pagination via `startAfter`/`limit`, `subscribeToAllTransactions(userId, filters, callback)` for balance computation (no pagination), and `hasLinkedTransactions(userId, field, value)`. Enforce validation: amount > 0, amount ≤ 999,999,999.99, round to 2dp, type must match category type (query category doc to verify). Order by `transactionDate` descending. Support filters: `spaceId`, `type`, `currency`, `dateRange`, `tag` (array-contains). See data-model.md for required Firestore composite indexes.
- [x] T016 Implement Transaction context provider in `src/contexts/TransactionContext.jsx` — create `TransactionProvider` and `useTransactions` hook. Manage two subscriptions: one paginated (for list display) and one unpaginated (for balance computation via `balanceUtils.js`). Expose `{ transactions, loading, filters, setFilters, balances, pagination: { hasNext, hasPrev, goNext, goPrev, pageSize, setPageSize }, addTransaction, updateTransaction }`. Resubscribe when filters change. Compute balances client-side using `computeBalances()` from `balanceUtils.js`.
- [x] T017 [P] [US3] Create Pagination component in `src/components/ui/Pagination.jsx` — reusable pagination footer with Previous/Next buttons, current page indicator, and page size selector (10, 25, 50). Disable Previous on first page, disable Next when no more results. Accept props: `{ hasNext, hasPrev, goNext, goPrev, pageSize, setPageSize }`. Style to match existing app design.
- [x] T018 [P] [US3] Create FilterBar component in `src/components/finance/FilterBar.jsx` — horizontal filter bar with: Space dropdown (populated from SpaceContext, shows icon+name), Type toggle (All/Income/Expense), and a clear-all-filters button. Each filter change calls `setFilters` from TransactionContext. Active filters shown as chips. Responsive: stacks vertically on mobile. Space dropdown items show the space color dot and icon.
- [x] T019 [P] [US3] Create TransactionListItem component in `src/components/finance/TransactionListItem.jsx` — single transaction row/card showing: space icon+color dot, category name, type badge (Income green / Expense red), formatted amount with currency symbol (using `formatCurrency` from `currencies.js`), transaction date (formatted via date-fns). Click navigates to edit page. Responsive: card layout on mobile, table row on desktop.
- [x] T020 [US3] Create TransactionFormPage in `src/pages/TransactionFormPage.jsx` — full-page form for creating AND editing transactions. Fields: Type selector (Income/Expense toggle — changing type resets category selection), Space dropdown (from SpaceContext, showing icon+color), Category dropdown (from CategoryContext, filtered by selected type per FR-010), Amount input (number, validation for >0 and ≤999999999.99), Currency dropdown (from CURRENCIES in currencies.js, default EGP), Transaction Date picker (default today). On edit mode: load existing transaction via `getTransaction`, pre-populate all fields. Submit calls `addTransaction` or `updateTransaction`. Show validation errors inline per field. Use react-hot-toast for success. Navigate back to transaction list on success.
- [x] T021 [US3] Create TransactionsPage in `src/pages/TransactionsPage.jsx` — main transaction list page. Layout: FilterBar at top, then transaction list (TransactionListItem for each), Pagination at bottom. Include "Add Transaction" FAB or button that navigates to `/transactions/add`. Empty state when no transactions match filters (differentiate between "no transactions ever" vs "no results for current filters"). Loading spinner during initial data fetch. Ensure the list is sorted by `transactionDate` descending (newest first) per FR-045.

**Checkpoint**: ✅ User Story 3 complete — full transaction CRUD, filtering, pagination, and editing flow working

---

## Phase 6: User Story 4 — View Real-Time Computed Balance (Priority: P1)

**Goal**: Users see their balance computed as Sum(Income) - Sum(Expenses), grouped by currency, on both the dashboard and the transaction list page. Balance updates in real-time and responds to filters.

**Independent Test**: Create 3 income transactions (5000 EGP, 3000 EGP, 500 USD) and 2 expense transactions (1500 EGP, 200 USD). Dashboard should show: 6500 EGP, 300 USD. Filter by space — balance should adjust. Verify balance updates immediately after adding a new transaction.

### Implementation for User Story 4

- [x] T022 [P] [US4] Create BalanceCard component in `src/components/finance/BalanceCard.jsx` — displays per-currency balance summaries. For each currency present in the balances Map: show currency code, flag/symbol, total income (green), total expenses (red), and net balance (green if positive, red if negative). Support two display modes via props: `variant="summary"` (compact card for dashboard — shows overall balances across all spaces) and `variant="contextual"` (inline header for transaction list — reflects current filters). Use Framer Motion for number transitions when balance changes. Handle empty state (no transactions) gracefully with "No data" message.
- [x] T023 [US4] Add BalanceCard to TransactionsPage header in `src/pages/TransactionsPage.jsx` — insert `<BalanceCard variant="contextual" balances={balances} />` above the FilterBar. The balances should update dynamically as the user applies or removes filters (space, type, currency, date range). Ensure it uses the `balances` object from `TransactionContext`.
- [x] T024 [US4] Add BalanceCard to DashboardPage in `src/pages/DashboardPage.jsx` — add a "Financial Overview" section with `<BalanceCard variant="summary" />`. This requires wrapping the DashboardPage route with TransactionProvider (or providing balance data via a separate lightweight balance context/hook). The dashboard card shows the user's overall balance across all spaces and currencies. Include a "View Transactions" link/button that navigates to `/transactions`. Position prominently near the top of the dashboard, after existing subscription summary cards.

**Checkpoint**: ✅ User Story 4 complete — balance always accurate, real-time updates, visible on both dashboard and transaction list

---

## Phase 7: User Story 5 — Enrich Transactions with Notes, Tags, and Attachments (Priority: P2)

**Goal**: Users can add notes, tags, and file attachments to transactions. Transactions can be filtered by tag and date range. A transaction detail page shows all enrichment data.

**Independent Test**: Create a transaction, add note "Rent payment", tags ["rent","apartment"], upload a PDF receipt. View the transaction detail page — all fields visible. Filter by tag "rent" — transaction appears. Filter by different tag — transaction hidden. Upload a 6MB file — validation error.

### Implementation for User Story 5

- [x] T025 [P] [US5] Implement Storage service in `src/services/storageService.js` — implement `uploadAttachment(userId, transactionId, file)` and `deleteAttachment(userId, transactionId)` per service contracts. Upload path: `users/{userId}/transactions/{transactionId}/attachment`. Validate file type (image/jpeg, image/png, application/pdf) and size (≤5MB) before upload. Return `{ url, meta: { fileName, fileSize, contentType } }`. Use Firebase Storage's `uploadBytes` and `getDownloadURL`.
- [x] T026 [P] [US5] Create TagInput component in `src/components/finance/TagInput.jsx` — input field where users can type a tag and press Enter/comma to add it as a chip. Each chip has an X button to remove it. Tags are lowercased and trimmed automatically. Max 10 tags, max 30 chars per tag. Display validation messages for limits. Show existing tags as chips when editing a transaction.
- [x] T027 [P] [US5] Create FileUpload component in `src/components/finance/FileUpload.jsx` — drag-and-drop area or file input button for uploading attachments. Shows file name, size, and type after selection. Displays upload progress bar during upload. Shows validation error if file >5MB or wrong type. If transaction already has an attachment, show the existing file with a "Replace" option. Accept only JPEG, PNG, PDF.
- [x] T028 [US5] Update TransactionFormPage to include enrichment fields in `src/pages/TransactionFormPage.jsx` — add Notes textarea (max 500 chars with character counter), TagInput component, and FileUpload component below the existing core fields. On submit: if a file is selected, call `uploadAttachment` first, then save the `attachmentUrl` and `attachmentMeta` to the transaction document. Handle upload failure gracefully: save transaction without attachment, show retry option via toast.
- [x] T029 [US5] Create TransactionDetailPage in `src/pages/TransactionDetailPage.jsx` — read-only detail view accessed via `/transactions/:id`. Show all transaction fields: type badge, space (with icon+color), category, amount with currency, date, notes (if present), tags (as chips, if present), attachment (download link/preview for images, download button for PDFs, if present). Include "Edit" button navigating to `/transactions/:id/edit`. Include back navigation to transaction list. Show "Auto-generated" badge if `recurrenceId` is present (future-proofing for US6).
- [x] T030 [US5] Add tag and date range filters to FilterBar in `src/components/finance/FilterBar.jsx` — extend FilterBar with: Tag text input with autocomplete (suggest from existing tags across transactions), Date range picker (start date + end date inputs). Update `setFilters` calls to include `tag` and `dateRange` filter parameters. Update TransactionContext to handle these new filter dimensions in its `subscribeToTransactions` query construction.
- [x] T031 [US5] Add route for transaction detail page in `src/App.jsx` — add protected route: `/transactions/:id` renders `TransactionDetailPage`, `/transactions/:id/edit` renders `TransactionFormPage` in edit mode.

**Checkpoint**: ✅ User Story 5 complete — notes, tags, file upload, detail page, tag/date filters all implemented.

---

## Phase 8: User Story 6 — Set Up Recurring Transactions (Priority: P3)

**Goal**: Users can create recurring transaction rules. The system auto-generates transactions on schedule. Users can pause, reactivate, and delete recurrences.

**Independent Test**: Create a monthly recurrence for Salary income of 10000 EGP starting today. Trigger the Cloud Function (or manually call the processor). Verify a transaction was created and nextExecutionDate advanced by 1 month. Pause the recurrence — no new transactions generated. Reactivate — nextExecutionDate recalculated. Delete recurrence — existing transactions remain.

### Implementation for User Story 6

- [x] T032 [P] [US6] Extend date utilities in `src/utils/dateUtils.js` — add `calculateNextExecutionDate(currentDate, recurrencePattern, interval)` supporting Weekly (+7\*interval days), Monthly (+interval months), Yearly (+interval years), Custom (+interval days). Add `countRetroactiveOccurrences(startDate, recurrencePattern, interval)` that computes how many occurrences between startDate and today. Add `generateRetroactiveDates(startDate, recurrencePattern, interval, maxCount)` returning array of dates.
- [x] T033 [P] [US6] Implement Recurrence service in `src/services/recurrenceService.js` — implement `addRecurrence(userId, data)`, `pauseRecurrence(userId, recurrenceId)`, `reactivateRecurrence(userId, recurrenceId)`, `deleteRecurrence(userId, recurrenceId)`, `subscribeToRecurrences(userId, callback)`, and `hasLinkedRecurrences(userId, field, value)` per service contracts. On `addRecurrence`: compute `nextExecutionDate` from `startDate`, set `isActive=true`. On `pauseRecurrence`: set `isActive=false`. On `reactivateRecurrence`: set `isActive=true`, recalculate `nextExecutionDate` based on today. On `deleteRecurrence`: just delete the document (transactions preserved). Also update the Space and Category deletion guards (in `spaceService.js` and `categoryService.js`) to also check `recurrences` collection references.
- [x] T034 [US6] Create Recurrence context provider in `src/contexts/RecurrenceContext.jsx` — create `RecurrenceProvider` and `useRecurrences` hook. Subscribe to real-time recurrence data via `subscribeToRecurrences`. Expose `{ recurrences, loading, activeRecurrences, pausedRecurrences, addRecurrence, pauseRecurrence, reactivateRecurrence, deleteRecurrence }`. Handle retroactive transaction generation on `addRecurrence`: call `countRetroactiveOccurrences`, if >12, prompt user for confirmation before generating. On confirmation, generate retroactive transactions by calling `addTransaction` for each date.
- [x] T035 [P] [US6] Create RecurrenceForm component in `src/components/finance/RecurrenceForm.jsx` — form for creating recurrences. Fields: Type toggle (Income/Expense), Space dropdown (from SpaceContext), Category dropdown (filtered by type, from CategoryContext), Amount input, Currency dropdown, Recurrence Pattern selector (Weekly/Monthly/Yearly/Custom radio or dropdown), Interval input (number, default 1, e.g. "every 2 weeks"), Start Date picker, End Date picker (optional, nullable). On submit: validate fields, call `addRecurrence`. If start date is in the past and >12 retroactive transactions would be generated, show confirmation modal warning with count and option to adjust start date. Use react-hot-toast for success/error.
- [x] T036 [US6] Create RecurrencesPage in `src/pages/RecurrencesPage.jsx` — page listing all user's recurrences. Each recurrence card shows: type badge, space (icon+color), category, amount with currency, pattern description (e.g., "Every month", "Every 2 weeks"), next execution date, status badge (Active green / Paused yellow). Action buttons per card: Pause/Reactivate toggle, Delete (with confirmation — notes that existing transactions are preserved). Include "Add Recurrence" button that opens RecurrenceForm. Empty state with CTA. Group by active/paused sections.
- [x] T037 [US6] Initialize Firebase Cloud Functions project in `functions/` directory — create `functions/package.json` with Firebase Functions and Admin SDK dependencies. Create `functions/index.js` as the entry point. Create `functions/recurrenceProcessor.js` implementing the daily scheduled function: query all recurrences where `isActive==true` and `nextExecutionDate <= today`, for each: create a transaction (via Admin SDK `firestore().collection()`) with matching details and `recurrenceId` set, advance `nextExecutionDate` using the recurrence pattern, if new `nextExecutionDate` exceeds `endDate`, set `isActive=false`. Export as a Pub/Sub scheduled function running daily at midnight. Include error handling and logging for each processed recurrence.
- [x] T038 [US6] Add recurrence routes and navigation in `src/App.jsx` and `src/components/layout/Sidebar.jsx` — replace the "coming soon" recurrences nav item with an active link to `/recurrences`. Add protected route `/recurrences` rendering `RecurrencesPage`. Wrap with `RecurrenceProvider`. Enable the sidebar item with the calendar/repeat icon.

**Checkpoint**: ✅ User Story 6 complete — RecurrenceForm, RecurrencesPage, Cloud Function processor, and routes all implemented.

---

## Phase 9: User Story 7 — Multi-Currency Balance Clarity (Priority: P4)

**Goal**: Enhanced multi-currency UX with grouped balance display, currency-based filtering, and clear currency indicators throughout.

**Independent Test**: Create transactions in EGP, USD, and EUR. View dashboard — 3 separate balance groups. Apply currency filter for USD — only USD transactions and balance shown. Every transaction in the list clearly shows its currency symbol and code.

### Implementation for User Story 7

- [x] T039 [P] [US7] Add currency filter to FilterBar in `src/components/finance/FilterBar.jsx` — add a Currency dropdown populated from the CURRENCIES list in `currencies.js`. When selected, update filters to include `currency` parameter. Show currency flag/symbol in dropdown options. Clear filter option to show all currencies.
- [x] T040 [US7] Enhance BalanceCard grouped currency display in `src/components/finance/BalanceCard.jsx` — refine the `variant="summary"` mode to display each currency in its own clearly separated card/section with: currency flag/symbol and code as header, income/expense breakdown bars, net balance with color coding. Add subtle borders or background differences between currency groups. Ensure it handles 1–6 currencies gracefully in a responsive grid (1 currency = full width, 2+ = grid layout).
- [x] T041 [US7] Ensure currency display on all transaction views — audit and update `TransactionListItem.jsx`, `TransactionDetailPage.jsx`, and `TransactionFormPage.jsx` to consistently display the currency symbol AND code alongside every amount (e.g., "E£ 5,000.00 EGP"). Use the `formatCurrency` utility. Verify no amount is ever displayed without its currency indicator.

**Checkpoint**: ✅ User Story 7 complete — currency filter, enhanced balance display, and consistent currency indicators.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

- [x] T042 [P] Add i18n translation keys for all new pages and components — update `src/locales/en/` and `src/locales/ar/` translation files with keys for: space/category/transaction form labels, button texts, error messages, empty states, filter labels, balance labels, recurrence pattern names, confirmation dialogs. Ensure RTL layout still works for all new pages.
- [x] T043 [P] Add responsive design polish across all new pages — test and fix layouts at mobile (360px), tablet (768px), and desktop (1280px) breakpoints. Ensure: SpacesPage cards stack on mobile, TransactionsPage filters collapse to a dropdown/drawer on mobile, TransactionFormPage is usable on small screens, BalanceCard adapts from horizontal to vertical layout, and all modals/dialogs are mobile-friendly.
- [x] T044 [P] Add loading states and error boundaries — ensure all pages show skeleton loaders or spinners during initial data fetch. Add error toasts for all service call failures (network errors, permission errors). Add empty states with illustrations for: no spaces, no categories, no transactions, no recurrences, no matching filter results.
- [x] T045 Verify deletion guards end-to-end — manually test: create a space → create a category → create a transaction in that space+category → try to delete the space (should fail with message) → try to delete the category (should fail with message). Verify error messages are user-friendly and specific (e.g., "Cannot delete 'Personal' — 5 transactions are linked to this space").
- [x] T046 Performance verification with large datasets — seed 100+ transactions across 3 spaces, 5 categories, 3 currencies. Verify: transaction list loads < 2 seconds, pagination works correctly, balance computation is accurate across all currencies, filters respond within 1 second, no UI jank or freezing.
- [x] T047 Run quickstart.md validation — follow the quickstart.md guide from scratch on a clean checkout. Verify all setup steps work, dev server starts, and the basic user journey (create space → create category → create transaction → view balance) completes successfully.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001 (Firebase Storage export) — BLOCKS user story pages
- **US1 Spaces (Phase 3)**: Depends on T009 (SpaceContext) from Phase 2
- **US2 Categories (Phase 4)**: Depends on T010 (CategoryContext) from Phase 2. Can run in parallel with US1.
- **US3 Transactions (Phase 5)**: Depends on US1 + US2 completion (needs spaces and categories to exist for transaction creation)
- **US4 Balance (Phase 6)**: Depends on US3 (needs TransactionContext with balance computation)
- **US5 Enrichment (Phase 7)**: Depends on US3 (extends existing transaction form and list)
- **US6 Recurrences (Phase 8)**: Depends on US3 (needs transaction service to generate transactions)
- **US7 Multi-Currency (Phase 9)**: Depends on US4 (enhances existing BalanceCard and FilterBar)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Phase 1 (Setup) ──→ Phase 2 (Foundational)
                         │
                    ┌────┴────┐
                    ↓         ↓
               US1 (Spaces)  US2 (Categories)  [PARALLEL]
                    │         │
                    └────┬────┘
                         ↓
                    US3 (Transactions)
                         │
                    ┌────┼────────┐
                    ↓    ↓        ↓
               US4 (Balance) US5 (Enrichment) US6 (Recurrences)  [PARALLEL]
                    │
                    ↓
               US7 (Multi-Currency)
                         │
                         ↓
                    Phase 10 (Polish)
```

### Within Each User Story

- Service layer before context provider
- Context provider before page components
- Reusable components (marked [P]) can be built in parallel
- Page components depend on their service + context + child components

### Parallel Opportunities

- **Phase 1**: T002, T003, T004 can all run in parallel (separate utility files)
- **Phase 2**: T007, T008 can run in parallel (separate service files); T009, T010 depend on their respective services
- **Phase 3 + 4**: US1 and US2 can run entirely in parallel (separate entities, pages, components)
- **Phase 5**: T017, T018, T019 can run in parallel (separate components)
- **Phase 7**: T025, T026, T027 can run in parallel (separate files)
- **Phase 8**: T032, T033, T035 can run in parallel (separate files)
- **Phase 10**: T042, T043, T044 can run in parallel (different concerns)

---

## Parallel Example: User Story 3 (Transactions)

```text
# These can run in parallel (separate component files):
Task T017: "Create Pagination component in src/components/ui/Pagination.jsx"
Task T018: "Create FilterBar component in src/components/finance/FilterBar.jsx"
Task T019: "Create TransactionListItem component in src/components/finance/TransactionListItem.jsx"

# These must be sequential (dependency chain):
Task T015: transactionService.js → T016: TransactionContext.jsx → T020: TransactionFormPage.jsx → T021: TransactionsPage.jsx
```

---

## Implementation Strategy

### MVP First (User Stories 1–4 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (Space + Category services)
3. Complete Phase 3: US1 Spaces (in parallel with Phase 4)
4. Complete Phase 4: US2 Categories (in parallel with Phase 3)
5. Complete Phase 5: US3 Transactions
6. Complete Phase 6: US4 Balance
7. **STOP and VALIDATE**: Test full income/expense tracking flow end-to-end
8. Deploy/Demo if ready — this is a functional personal finance tracker!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 + US2 → Organisational structure (Spaces + Categories) ✅
3. US3 → Transaction tracking works! Mini-MVP ✅
4. US4 → Balance visible — full MVP ✅
5. US5 → Enriched transactions (notes, tags, attachments) ✅
6. US6 → Automation (recurring transactions) ✅
7. US7 → Polish (multi-currency UX) ✅
8. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after its checkpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
- No test framework configured — all validation is manual per quickstart.md testing guidance
- Firestore composite indexes (listed in data-model.md) must be configured when deploying queries that use them — Firestore will auto-prompt with a console link when a missing index is detected in dev
