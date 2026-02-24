# Feature Specification: Expense & Income Tracking System

**Feature Branch**: `002-expense-income-tracking`  
**Created**: 2026-02-24  
**Status**: Draft  
**Input**: User description: "Sprint 2 – Expand the application into a structured personal finance tracking system with income/expense tracking, user-defined spaces, user-defined categories, real-time computed balance, recurring transactions, and multi-currency support."

## Clarifications

### Session 2026-02-24

- Q: Can users edit or delete transactions they've already created? → A: Allow editing only (amount, category, space, notes, tags, etc.) — no deletion in this sprint.
- Q: Where should the balance be displayed? → A: Both — balance summary card on dashboard AND contextual balance header on the transaction list page (updates as filters change).
- Q: What should the default sort order for the transaction list be? → A: Newest first — descending by transaction date (most recent at top).
- Q: Should Spaces have additional attributes beyond just a name? → A: Name + color or icon for visual differentiation in UI (dropdowns, filter chips, dashboard cards).
- Q: Should there be a safety limit on retroactive transactions from a past-dated recurrence? → A: Cap at 12 with confirmation — if more than 12 would be generated, prompt the user to confirm or adjust the start date.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 – Create and Manage Spaces (Priority: P1)

A user wants to organize their finances by creating distinct "spaces" (e.g., "Personal", "Freelance", "Household"). They can create a new space with a name, edit the name of an existing space, and delete a space only when it has no linked transactions. This organizational layer allows users to segment their financial view and track money across different contexts.

**Why this priority**: Spaces are the foundational organizational unit. All transactions belong to a space, making this a prerequisite for every other feature.

**Independent Test**: Can be fully tested by creating, editing, and attempting to delete spaces. Delivers immediate organizational value.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they create a space named "Personal", **Then** the space appears in their space list and is available for selection when creating transactions.
2. **Given** a space named "Personal" exists, **When** the user edits its name to "My Personal", **Then** the updated name is reflected everywhere the space is referenced.
3. **Given** a space with zero linked transactions, **When** the user deletes it, **Then** the space is permanently removed from their account.
4. **Given** a space with one or more linked transactions, **When** the user attempts to delete it, **Then** the system prevents deletion and displays a clear message explaining why.

---

### User Story 2 – Create and Manage Categories (Priority: P1)

A user wants to classify their transactions into meaningful categories (e.g., "Salary" for income, "Groceries" for expenses). Each category is typed as either Income or Expense. The user can create and edit categories, but cannot delete a category if transactions are linked to it.

**Why this priority**: Categories are required to create transactions and provide meaningful classification for filtering and analysis. This is co-required with Spaces as a foundation.

**Independent Test**: Can be fully tested by CRUD operations on categories. Delivers classification value independently.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they create a category named "Salary" with type "Income", **Then** the category appears in their category list and is available when creating income transactions.
2. **Given** a logged-in user, **When** they create a category named "Rent" with type "Expense", **Then** the category appears in their category list and is available when creating expense transactions.
3. **Given** an existing category named "Groceries", **When** the user edits its name to "Food & Groceries", **Then** the updated name is reflected across all references.
4. **Given** a category with linked transactions, **When** the user attempts to delete it, **Then** the system prevents deletion and displays a clear message.
5. **Given** a category with no linked transactions, **When** the user deletes it, **Then** the category is permanently removed.

---

### User Story 3 – Record Income and Expense Transactions (Priority: P1)

A user wants to record financial transactions. Each transaction captures the space, category, type (Income or Expense), amount, currency, and transaction date. The user can view their transactions in a paginated list and filter by space or type.

**Why this priority**: Transaction recording is the core value proposition. Without it, no financial tracking is possible. This is the heart of the system.

**Independent Test**: Can be fully tested by creating transactions, viewing the list, and applying filters. Delivers the primary financial tracking value.

**Acceptance Scenarios**:

1. **Given** a logged-in user with at least one space and one income category, **When** they create a transaction with type "Income", amount "5000", currency "EGP", space "Personal", category "Salary", and date "2026-02-01", **Then** the transaction is saved and appears in the transaction list.
2. **Given** a logged-in user with at least one space and one expense category, **When** they create a transaction with type "Expense", amount "200", currency "USD", space "Freelance", category "Software", and date "2026-02-15", **Then** the transaction is saved and appears in the transaction list.
3. **Given** 25 transactions exist, **When** the user views the transaction list with a page size of 10, **Then** they see 10 transactions on the first page with pagination controls to navigate to the remaining pages.
4. **Given** transactions across multiple spaces, **When** the user filters by space "Personal", **Then** only transactions belonging to "Personal" are displayed.
5. **Given** income and expense transactions exist, **When** the user filters by type "Income", **Then** only income transactions are displayed.
6. **Given** the transaction form is open, **When** the user submits without filling required fields (space, category, type, amount, currency, date), **Then** validation errors are displayed for each missing field.

---

### User Story 4 – View Real-Time Computed Balance (Priority: P1)

A user wants to see their current balance as a real-time computation: `Balance = Sum(Income) - Sum(Expenses)`. The balance is never stored as a field — it is always computed from underlying transactions. The user can filter the balance view by space, currency, and date range. Different currencies are never summed together.

**Why this priority**: Balance is the key financial insight users need. It validates that income and expense tracking is working correctly and provides immediate actionable information.

**Independent Test**: Can be fully tested by creating a mix of income/expense transactions and verifying the computed balance matches expected values. Delivers immediate financial insight.

**Acceptance Scenarios**:

1. **Given** a user has income transactions totaling 10,000 EGP and expense transactions totaling 3,500 EGP (all in the same currency), **When** they view their balance, **Then** the displayed balance is 6,500 EGP.
2. **Given** a user has transactions in both EGP and USD, **When** they view their balance, **Then** they see separate balance amounts for each currency (e.g., "6,500 EGP" and "800 USD"), never a combined total.
3. **Given** a user has transactions across multiple spaces, **When** they filter the balance by space "Personal", **Then** the balance reflects only transactions within that space.
4. **Given** a user filters the balance by date range "2026-01-01 to 2026-01-31", **Then** the balance reflects only transactions within that date range.
5. **Given** a new transaction is added, **When** the user views the balance, **Then** the balance immediately reflects the new transaction without requiring a manual refresh.
6. **Given** a user has zero transactions, **When** they view their balance, **Then** they see a balance of 0 (or an empty state message).

---

### User Story 5 – Enrich Transactions with Notes, Tags, and Attachments (Priority: P2)

A user wants to add richer detail to transactions: optional text notes, tags for flexible grouping, and file attachments (e.g., receipts, invoices). They can filter transactions by tags and view a transaction's full details on a dedicated page.

**Why this priority**: Enhances usability and data richness but is not required for core tracking functionality. Builds on the foundation established in P1.

**Independent Test**: Can be fully tested by creating a transaction with notes, tags, and an attachment, then verifying the detail page and tag filtering work correctly.

**Acceptance Scenarios**:

1. **Given** a logged-in user creating a transaction, **When** they add a note "Monthly rent payment", **Then** the note is saved and visible on the transaction detail page.
2. **Given** a logged-in user creating a transaction, **When** they add tags ["rent", "recurring", "apartment"], **Then** the tags are saved and displayed on the transaction.
3. **Given** a logged-in user creating a transaction, **When** they upload a receipt image (JPEG, PNG, or PDF, max 5 MB), **Then** the file is stored and a download link is available on the transaction detail page.
4. **Given** multiple transactions with various tags, **When** the user filters by tag "rent", **Then** only transactions tagged with "rent" are displayed.
5. **Given** a transaction with notes, tags, and an attachment, **When** the user navigates to the transaction detail page, **Then** all enrichment data (notes, tags, attachment link) is visible.
6. **Given** a user attempts to upload a file exceeding 5 MB, **When** they submit the transaction form, **Then** a validation error is displayed informing them of the size limit.

---

### User Story 6 – Set Up Recurring Transactions (Priority: P3)

A user wants to automate repetitive financial entries (e.g., monthly salary income, weekly grocery budget). They define a recurrence rule with a pattern (weekly, monthly, yearly, or custom interval), start date, optional end date, and the transaction details. The system automatically generates transactions on the scheduled dates. Users can pause, reactivate, or delete a recurrence.

**Why this priority**: Automation saves time and prevents missed entries, but the system is fully usable without it. Depends on a stable transaction engine (P1).

**Independent Test**: Can be fully tested by creating a recurrence, advancing time (or triggering the scheduler), and verifying generated transactions appear correctly.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they create a monthly recurrence for "Salary" income of 10,000 EGP starting 2026-03-01, **Then** the recurrence is saved with `isActive = true` and `nextExecutionDate = 2026-03-01`.
2. **Given** an active recurrence with `nextExecutionDate` of today, **When** the system runs its daily recurrence check, **Then** a transaction is automatically created matching the recurrence details, and `nextExecutionDate` advances to the next scheduled date.
3. **Given** an active recurrence, **When** the user pauses it, **Then** the recurrence's `isActive` is set to false and no new transactions are generated.
4. **Given** a paused recurrence, **When** the user reactivates it, **Then** the recurrence's `isActive` is set to true and the `nextExecutionDate` is recalculated based on the current date.
5. **Given** an active recurrence with generated transactions, **When** the user deletes the recurrence, **Then** the recurrence is removed but all previously generated transactions remain untouched.
6. **Given** a recurrence with an end date of 2026-12-31, **When** the `nextExecutionDate` would exceed 2026-12-31, **Then** no further transactions are generated and the recurrence is automatically deactivated.
7. **Given** a generated transaction, **When** the user views its details, **Then** the transaction shows a link or label indicating it was auto-generated from a specific recurrence.

---

### User Story 7 – Multi-Currency Balance Clarity (Priority: P4)

A user who tracks finances in multiple currencies wants clear visibility into their per-currency balances. The UI groups balances by currency with clear indicators. No automatic conversion between currencies occurs.

**Why this priority**: Polishing and stabilizing multi-currency display. The core multi-currency support (separate balances) is established in P1; this phase enhances clarity and filtering.

**Independent Test**: Can be fully tested by creating transactions in multiple currencies and verifying that the balance UI groups by currency and allows currency-based filtering.

**Acceptance Scenarios**:

1. **Given** transactions in EGP, USD, and EUR, **When** the user views the balance overview, **Then** each currency's balance is displayed in a clearly separated and labeled group.
2. **Given** transactions in EGP and USD, **When** the user applies a currency filter for "USD", **Then** only USD transactions and the USD balance are shown.
3. **Given** a transaction list with mixed currencies, **When** the user views the list, **Then** each transaction clearly displays its currency alongside the amount.

---

### Edge Cases

- What happens when a user creates a transaction with an amount of 0? → System should reject zero-amount transactions with a validation error.
- What happens when a user has spaces but no categories (or vice versa)? → The transaction form should prevent submission and guide the user to create the missing entity first.
- How does the system handle a recurrence start date in the past? → The system processes all missed occurrences up to today and generates corresponding transactions, then sets `nextExecutionDate` to the next future date.
- What happens when a recurring transaction's linked space or category is deleted? → Deletion of spaces/categories with linked transactions or recurrences is already prevented (FR-003, FR-006).
- What happens if the user creates duplicate spaces or categories with the same name? → The system should allow duplicates (names are not unique identifiers); each entity has a unique system-generated ID.
- What happens if a file attachment upload fails mid-way? → The transaction is saved without the attachment, and the user is notified of the upload failure with an option to retry.
- How does the system handle very large transaction amounts? → Amounts should support up to 2 decimal places and a maximum value of 999,999,999.99 to prevent overflow issues.
- What if a user has thousands of transactions? → Pagination, efficient queries, and index-based filtering ensure the system remains performant with 100,000+ transactions.
- What if a user sets a recurrence start date far in the past (e.g., years ago)? → The system caps automatic retroactive generation at 12 transactions; if more would be generated, the user is prompted to confirm or adjust the start date.

---

## Requirements _(mandatory)_

### Functional Requirements

#### Spaces

- **FR-001**: System MUST allow users to create a space with a user-defined name and a color or icon for visual identification.
- **FR-002**: System MUST allow users to edit the name of an existing space.
- **FR-003**: System MUST prevent deletion of a space that has any linked transactions or recurrences, and display a clear explanation to the user.
- **FR-004**: System MUST allow users to delete a space that has no linked transactions or recurrences.

#### Categories

- **FR-005**: System MUST allow users to create a category with a user-defined name and a type of either "Income" or "Expense".
- **FR-006**: System MUST prevent deletion of a category that has any linked transactions or recurrences, and display a clear explanation to the user.
- **FR-007**: System MUST allow users to edit the name of an existing category.
- **FR-008**: System MUST allow users to delete a category that has no linked transactions or recurrences.

#### Transactions

- **FR-009**: System MUST allow users to create a transaction with the following required fields: space, category, type (Income or Expense), amount, currency, and transaction date.
- **FR-010**: System MUST validate that the transaction type matches the category type (e.g., an "Income" category cannot be used for an "Expense" transaction).
- **FR-011**: System MUST display transactions in a paginated list.
- **FR-012**: System MUST allow users to filter transactions by space.
- **FR-013**: System MUST allow users to filter transactions by transaction type (Income or Expense).
- **FR-014**: System MUST reject transactions with an amount of zero or negative values.
- **FR-015**: System MUST support amounts with up to 2 decimal places and a maximum value of 999,999,999.99.
- **FR-042**: System MUST allow users to edit an existing transaction's editable fields (amount, category, space, type, currency, transaction date, notes, and tags). The balance MUST immediately reflect any edits.
- **FR-045**: System MUST display the transaction list sorted by transaction date in descending order (newest first) by default.

#### Transaction Enrichment (Phase 2)

- **FR-016**: System MUST allow users to add an optional text note to a transaction.
- **FR-017**: System MUST allow users to add optional tags (array of strings) to a transaction.
- **FR-018**: System MUST allow users to upload a file attachment (JPEG, PNG, or PDF, max 5 MB) to a transaction.
- **FR-019**: System MUST provide a transaction detail page showing all transaction data including notes, tags, and attachment download link.
- **FR-020**: System MUST allow users to filter transactions by tag.
- **FR-021**: System MUST allow users to filter transactions by date range.
- **FR-022**: System MUST display a validation error when an uploaded file exceeds 5 MB.

#### Balance

- **FR-023**: System MUST compute the balance in real-time as `Sum(Income Transactions) - Sum(Expense Transactions)`.
- **FR-024**: System MUST NOT store a pre-computed balance value; balance is always derived from transactions.
- **FR-025**: System MUST display separate balances per currency — different currencies are never summed together.
- **FR-026**: System MUST allow users to filter the balance view by space.
- **FR-027**: System MUST allow users to filter the balance view by currency.
- **FR-028**: System MUST allow users to filter the balance view by date range.
- **FR-043**: System MUST display a balance summary card on the main dashboard showing per-currency balances across all spaces.
- **FR-044**: System MUST display a contextual balance header on the transaction list page that updates dynamically as the user applies filters (space, currency, date range, type).

#### Recurring Transactions (Phase 3)

- **FR-029**: System MUST allow users to create a recurrence with the following properties: type, space, category, amount, currency, recurrence pattern (Weekly, Monthly, Yearly, Custom), interval, start date, and optional end date.
- **FR-030**: System MUST automatically generate a transaction when a recurrence's `nextExecutionDate` matches or has passed the current date.
- **FR-031**: System MUST advance the `nextExecutionDate` after each generated transaction based on the recurrence pattern and interval.
- **FR-032**: System MUST link each auto-generated transaction to its source recurrence via a `recurrenceId` field.
- **FR-033**: System MUST allow users to pause an active recurrence (setting `isActive` to false).
- **FR-034**: System MUST allow users to reactivate a paused recurrence (setting `isActive` to true and recalculating `nextExecutionDate`).
- **FR-035**: System MUST allow users to delete a recurrence without affecting previously generated transactions.
- **FR-036**: System MUST automatically deactivate a recurrence when its `nextExecutionDate` would exceed its defined end date.
- **FR-037**: When a recurrence is created with a start date in the past, the system MUST generate retroactive transactions for missed occurrences. If more than 12 retroactive transactions would be generated, the system MUST prompt the user for confirmation before proceeding, giving them the option to adjust the start date instead.

#### Multi-Currency Clarity (Phase 4)

- **FR-038**: System MUST allow users to filter transactions and balance by currency.
- **FR-039**: System MUST display balances grouped by currency in the balance overview.
- **FR-040**: System MUST display the currency alongside the amount on every transaction in lists and detail views.
- **FR-041**: System MUST NOT perform any automatic currency conversion.

### Key Entities

- **Space**: A user-defined organizational container for grouping transactions and recurrences. Key attributes: unique identifier, owner (user), name, color or icon.
- **Category**: A user-defined classification label for transactions, typed as either Income or Expense. Key attributes: unique identifier, owner (user), name, type (Income | Expense).
- **Transaction**: A single financial entry representing money earned or spent. Key attributes: unique identifier, owner (user), space reference, category reference, type (Income | Expense), amount, currency, transaction date, optional notes, optional tags, optional attachment reference, optional recurrence reference.
- **Recurrence**: A rule that defines automatic, periodic generation of transactions. Key attributes: unique identifier, owner (user), type (Income | Expense), space reference, category reference, amount, currency, recurrence pattern, interval, start date, optional end date, next execution date, active status.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can create a space, category, and record their first transaction in under 3 minutes from the dashboard.
- **SC-002**: The computed balance is always mathematically accurate — sum of all income minus sum of all expense for a given currency, verified against test datasets of 500+ transactions.
- **SC-003**: The system prevents 100% of invalid deletions (spaces/categories with linked data), with clear user-facing explanations.
- **SC-004**: Transaction list loads within 2 seconds for users with up to 1,000 transactions.
- **SC-005**: Paginated transaction lists display correctly with page sizes of 10, 25, and 50 items.
- **SC-006**: File attachments up to 5 MB are successfully uploaded and retrievable within 5 seconds.
- **SC-007**: Recurring transactions are generated accurately on their scheduled dates with zero missed or duplicate entries over a 30-day test period.
- **SC-008**: Users can pause, reactivate, and delete recurrences without any data corruption to existing transactions.
- **SC-009**: Multi-currency balances are never incorrectly summed across currencies — verified by test cases with 3+ currencies.
- **SC-010**: All transaction forms validate required fields and reject invalid data (zero amounts, missing fields) before submission, achieving a 100% client-side validation rate for known error conditions.
- **SC-011**: 90% of users complete their first recurring transaction setup within 5 minutes.
- **SC-012**: System remains stable and responsive with 100+ concurrent transactions across multiple spaces and currencies.

---

## Assumptions

- Users are already authenticated via the existing authentication system (Sprint 1). No new auth flows are needed.
- The application uses Firebase as its backend (Firestore for data, Firebase Storage for attachments), consistent with the existing architecture.
- Currency codes follow the ISO 4217 standard (e.g., EGP, USD, EUR). A predefined list of supported currencies will be provided in the UI.
- The daily recurrence check (Phase 3) will be implemented via a scheduled function (e.g., Firebase Cloud Functions with a cron trigger) and does not require the user to have the application open.
- Transaction amounts are stored as numbers with up to 2 decimal places. Floating-point precision issues will be mitigated by rounding to 2 decimal places at the storage layer.
- Attachment file types are limited to JPEG, PNG, and PDF. Other file types are rejected at upload time.
- The existing UI framework and design system from Sprint 1 will be extended, not replaced.
- Each user has their own isolated dataset — no shared spaces or collaborative features in this sprint.

---

## Out of Scope

- Investment tracking
- Reporting dashboards, charts, and analytics
- CSV/data export
- Shared accounts or collaborative spaces
- Currency conversion (automatic or manual)
- Offline support
- Budget planning or goal setting
- Transaction deletion (may be added in a future sprint)
- Notification system for recurring transactions
