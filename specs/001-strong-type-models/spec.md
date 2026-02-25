# Feature Specification: Strong-Typed Domain Models

**Feature Branch**: `001-strong-type-models`
**Created**: 2026-02-25
**Status**: Draft
**Input**: User description: "revise the whole system, and use models for every things instead of 'any' (strong type)"

---

## Clarifications

### Session 2026-02-25

- Q: What TypeScript compiler strictness level should be used? → A: `strict: true` — full strictness (`noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, and all related strict flags enabled).
- Q: What strategy should be used for mapping raw Firestore documents to typed domain models? → A: Manual typed mapper functions — one per entity (e.g., `toSubscription(doc)`, `toTransaction(doc)`) that explicitly map Firestore fields to typed model fields. No runtime validation library (e.g., Zod) required.
- Q: Which files are migrated to `.ts`/`.tsx`? → A: Partial migration — `src/models/`, `src/utils/`, `src/services/`, and `src/contexts/` are converted to `.ts`/`.tsx`; page and component files remain `.jsx` with `allowJs: true` in `tsconfig.json`.
- Q: What is the type of `attachmentMeta` on the `Transaction` model? → A: A named `AttachmentMeta` interface — `{ name: string; size: number; type: string; storagePath?: string }`. The `Transaction.attachmentMeta` field is typed as `AttachmentMeta | null`.
- Q: What are the types of `pattern` and `interval` on the `Recurrence` model? → A: `pattern: "daily" | "weekly" | "monthly" | "yearly"` (named as `RecurrencePattern`); `interval: number` (the multiplier, e.g. 2 = every 2 weeks).

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Compile-Time Safety on Data Shapes (Priority: P1)

A developer working on any part of the codebase — services, context providers, utility functions, or components — gets immediate, in-editor feedback when they pass a wrong property or misuse a data structure. For example, passing a `Transaction` object where a `Subscription` is expected, or omitting a required field like `currency`, causes a clear compile error rather than a silent runtime bug.

**Why this priority**: This is the foundational requirement. Without defined types for domain models, all other typing work is incomplete. It directly eliminates the largest class of bugs in the current system (wrong-shaped objects flowing through Firebase callbacks, contexts, and utility functions).

**Independent Test**: Can be fully tested by running the TypeScript compiler (`tsc --noEmit`) against the codebase and verifying zero type errors. Value: developers get instantaneous red underlines in their editor for type mismatches.

**Acceptance Scenarios**:

1. **Given** the `Subscription` model is defined, **When** a developer writes code that accesses `sub.renewaldate` (wrong casing), **Then** the editor and compiler report an error immediately.
2. **Given** `addSubscription(userId, data)` is typed, **When** a developer calls it omitting the required `price` field, **Then** a compile-time error is shown.
3. **Given** a utility function such as `getMonthlyEquivalent` is typed, **When** a string is passed where a number is expected, **Then** a type error is raised before the code runs.

---

### User Story 2 — Typed Service & Context API Contracts (Priority: P2)

Every service function (Firestore CRUD operations in `subscriptionService`, `transactionService`, `categoryService`, etc.) and every React Context value has an explicit typed interface. Callers always know exactly what they are receiving back, and what they must supply as inputs.

**Why this priority**: Services and contexts are the main data highways. They currently accept and return untyped objects, making it impossible to refactor safely. Typing these creates a reliable contract between layers.

**Independent Test**: Can be tested by checking that all context hook return values (e.g., `useSubscriptions()`, `useTransactions()`) are typed, and that TypeScript catches passing raw Firestore document data directly to typed consumers without going through a typed mapping layer.

**Acceptance Scenarios**:

1. **Given** `useSubscriptions()` returns a typed value, **When** a component destructures a property that doesn't exist on the context type, **Then** a compile error is raised.
2. **Given** `addTransaction(userId, data)` accepts a typed `TransactionInput` model, **When** a caller passes an object with an invalid `type` value (e.g. `"Payment"` instead of `"Income" | "Expense"`), **Then** the compiler reports the error.
3. **Given** `subscribeToSubscriptions(userId, callback)` is typed, **When** the callback receives its argument, **Then** it is typed as `Subscription[]` rather than an untyped array.

---

### User Story 3 — Typed Utility & Validation Helpers (Priority: P3)

All utility functions in `utils/` (currency conversion, date utilities, balance computation, validation helpers, category lookups) have typed inputs and outputs. Return types from validators are discriminated unions (e.g. `{ valid: true; value: T } | { valid: false; error: string }`), allowing callers to safely narrow results.

**Why this priority**: Utilities are shared across many consumers. Correct typing here prevents silent numeric/string conversions and ensures validation results are handled exhaustively.

**Independent Test**: Can be tested by verifying that `computeBalances()` has a typed return `Record<string, CurrencyBalance>` and that `validateAmount()` returns a typed discriminated union, with the TypeScript compiler enforcing correct narrowing at every call site.

**Acceptance Scenarios**:

1. **Given** `validateAmount(amount)` returns `{ valid: true; value: number } | { valid: false; error: string }`, **When** a caller accesses `.value` without first checking `valid === true`, **Then** a type error is raised.
2. **Given** `computeBalances(transactions)` is typed, **When** a caller accesses the result as a plain `object`, **Then** the compiler requires indexing by currency string and accessing typed `{ income, expense, balance }` fields.
3. **Given** `CATEGORIES` is a typed constant array, **When** `getCategoryById` is called, **Then** the return type is `Category` (not `Category | undefined`) because the function always falls back to a default.

---

### User Story 4 — Typed Component Props (Priority: P4)

All React components that accept domain data as props (subscription cards, transaction list items, form pages, filter bars, dialogs) have explicit typed prop interfaces. Components no longer accept raw `any` objects; they require the specific domain model type.

**Why this priority**: Typed props make component refactoring safe and self-documenting. This is lower priority than models and services because it depends on Stories 1–3 to produce the types components will consume.

**Independent Test**: Can be tested by hovering over any component's props in the editor and confirming typed intellisense, plus running `tsc --noEmit` with zero prop-related errors.

**Acceptance Scenarios**:

1. **Given** a subscription card component has a typed `subscription: Subscription` prop, **When** a parent passes an object missing `billingCycle`, **Then** a compile error is reported.
2. **Given** a dialog component accepts a `variant: "danger" | "warning"` prop, **When** a caller passes `variant="error"`, **Then** a type error is raised.

---

### Edge Cases

- What happens when Firestore returns a document with a missing or extra field compared to the model? The typed mapping layer must handle this gracefully (optional fields default to `null` or `undefined`, extra fields are discarded).
- How does the system handle the `billingCycle: "custom"` variant that requires an additional `customCycleDays` field? The model must express this as a discriminated union or conditional optional field.
- What happens to existing `.jsx` page and component files during migration? They remain as `.jsx` with `allowJs: true` in `tsconfig.json`. They gain type safety through importing and consuming the typed models, services, and context interfaces defined in the migrated `.ts` layers, but are not themselves subject to strict TypeScript type checking.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The project MUST be configured to support TypeScript compilation with `strict: true` in `tsconfig.json` (enabling `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, and all related strict checks). The config MUST include `allowJs: true` and `checkJs: false` so that existing `.jsx` page and component files coexist without errors during the migration. Type checking MUST run without blocking the existing build output.
- **FR-002**: A dedicated `src/models/` directory MUST be created containing one typed definition file per domain entity group (Subscription, Transaction, Space, Category, Recurrence, Payment/History).
- **FR-003**: Every domain model MUST define all fields with explicit types — no field may have an implicit or explicit `any` type in the model definitions.
- **FR-004**: The `billingCycle` field on `Subscription` MUST be typed as a string union (`"monthly" | "yearly" | "weekly" | "custom"`) and `customCycleDays` MUST be typed as `number | null`, conditionally required when cycle is `"custom"`.
- **FR-005**: Transaction `type` MUST be typed as `"Income" | "Expense"` (a string union literal), eliminating acceptance of arbitrary strings.
- **FR-006**: Subscription `status` MUST be typed as `"active" | "paused" | "cancelled"` (a string union literal).
- **FR-007**: All service functions (`subscriptionService`, `transactionService`, `spaceService`, `categoryService`, `recurrenceService`, `historyService`) MUST have typed input parameters and typed return types — no untyped or `any`-typed parameters.
- **FR-008**: All React Context value shapes MUST be expressed as typed interfaces so that consumers receive typed values from context hooks.
- **FR-009**: Utility functions in `src/utils/` MUST have typed signatures. Discriminated-union return types MUST be used for validators so callers are forced to check the `valid` flag before accessing `value`.
- **FR-010**: The `CATEGORIES`, `CURRENCIES`, and `EXCHANGE_RATES` constants MUST be typed as their appropriate readonly typed arrays/records so derived lookups return typed objects.
- **FR-011**: React component prop types MUST be defined for all components that accept domain model data, eliminating prop drilling of untyped objects.
- **FR-012**: The TypeScript compiler MUST be run as part of the lint/check script and MUST report zero errors on the migrated files.
- **FR-013**: The migration MUST NOT break the existing running application — the dev server and production build MUST continue to work throughout migration.
- **FR-014**: A typed mapper function MUST be created for each domain entity (`toSubscription`, `toTransaction`, `toSpace`, `toCategory`, `toRecurrence`, `toPayment`). Each mapper MUST accept a raw Firestore `DocumentSnapshot` and return a fully typed domain model, handling missing optional fields by defaulting to `null` or the appropriate zero value. Direct `as ModelType` casting of unvalidated Firestore data is prohibited.
- **FR-015**: An `AttachmentMeta` interface MUST be defined in `src/models/` with fields `name: string`, `size: number`, `type: string`, and `storagePath?: string`. The `Transaction.attachmentMeta` field MUST be typed as `AttachmentMeta | null` — the use of `object | null` or `any` for this field is prohibited.
- **FR-016**: A `RecurrencePattern` type alias MUST be defined as `"daily" | "weekly" | "monthly" | "yearly"`. The `Recurrence.pattern` field MUST use this alias and `Recurrence.interval` MUST be typed as `number`. No untyped `string` or `any` is permitted for these fields.

### Key Entities

- **Subscription**: Represents a user's recurring subscription. Fields include id, userId (implicit via Firestore path), name, price (number), currency (CurrencyCode), billingCycle (union), customCycleDays (number | null), renewalDate (YYYY-MM-DD string), category (CategoryId), status (union), paymentMethod (string | null), notes (string | null), createdAt (ISO string), updatedAt (ISO string).
- **Transaction**: A single financial event. Fields include id, spaceId, categoryId, type ("Income" | "Expense"), amount (number), currency (CurrencyCode), transactionDate (YYYY-MM-DD string), notes (string | null), tags (string[]), attachmentUrl (string | null), attachmentMeta (`AttachmentMeta | null`), recurrenceId (string | null), createdAt (ISO string), updatedAt (ISO string).
- **Space**: A named financial context for grouping transactions. Fields: id, name, icon, color, createdAt.
- **Category**: A taxonomy entry for transactions. Fields: id, name, type ("Income" | "Expense"), icon, color, createdAt.
- **Recurrence**: A rule for auto-generating periodic transactions. Fields: id, spaceId, categoryId, type ("Income" | "Expense"), amount (number), currency (CurrencyCode), pattern (`RecurrencePattern`), interval (number — the cycle multiplier, e.g. `2` means every 2 patterns), startDate (YYYY-MM-DD string), endDate (string | null), nextDate (YYYY-MM-DD string), status ("active" | "paused"), createdAt (ISO string).
- **Payment / HistoryEntry**: A logged payment event for a subscription renewal. Fields: id, subscriptionId, subscriptionName, amount, currency, paidDate, paymentMethod (string | null).
- **CurrencyBalance**: Computed summary per currency. Fields: income (number), expense (number), balance (number).
- **SubscriptionCategory** (util constant type): id (CategoryId union), name, icon, color.
- **CurrencyDefinition** (util constant type): code (CurrencyCode union), name, symbol.
- **AttachmentMeta**: Typed metadata for a file attachment on a Transaction. Fields: `name` (string — original filename), `size` (number — bytes), `type` (string — MIME type, e.g. `"image/jpeg"` or `"application/pdf"`), `storagePath` (string | undefined — Firebase Storage path, present after successful upload).
- **RecurrencePattern** (named type alias): `"daily" | "weekly" | "monthly" | "yearly"` — the allowed recurrence frequency values used by the `Recurrence.pattern` field.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Running the TypeScript type checker against all migrated source files reports zero type errors.
- **SC-002**: No file in `src/models/`, `src/services/`, `src/contexts/`, or `src/utils/` contains the word `any` as an explicit or implicit type after migration.
- **SC-003**: Every domain entity (Subscription, Transaction, Space, Category, Recurrence, Payment) has a corresponding exported model type in `src/models/`.
- **SC-004**: All string-union literals (`status`, `type`, `billingCycle`, `CurrencyCode`, `CategoryId`) are defined as named type aliases and reused consistently — no inline string unions defined more than once.
- **SC-005**: The application dev server (`npm run dev`) and production build (`npm run build`) complete successfully without errors after migration.
- **SC-006**: A developer adding a new field to any model receives a compile error at every call site that does not handle the new field, with no manual search required.

---

## Assumptions

- The project migration targets **TypeScript** (`.ts` / `.tsx`) as the strong-typing mechanism, not JSDoc annotations, since TypeScript provides richer tooling and compile-time enforcement. The `tsconfig.json` MUST use `strict: true` to enable all strict type-checking flags from the start.
- Migration will be **partial and scoped**: `src/models/`, `src/utils/`, `src/services/`, and `src/contexts/` are fully converted to `.ts`/`.tsx` with `strict: true`. Page and component files (`src/pages/`, `src/components/`) remain as `.jsx` and are covered by `allowJs: true` in `tsconfig.json`. They gain type benefits by consuming the typed layers but are not themselves strictly type-checked.
- The Vite build tool already supports TypeScript via `@vitejs/plugin-react`; only a `tsconfig.json` needs to be added.
- Firebase Firestore data returned from `doc.data()` MUST be passed through a dedicated typed mapper function per entity (e.g., `toSubscription(doc)`) rather than directly cast or spread into model types. This approach handles schema drift gracefully and is the sole authorised pattern for constructing typed domain objects from Firestore snapshots.
- All existing functionality (localization, RTL layout, subscription tracking, finance module) MUST remain fully intact after migration — this is a refactoring, not a feature change.
