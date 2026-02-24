# Research: Expense & Income Tracking System

**Branch**: `002-expense-income-tracking`  
**Date**: 2026-02-24  
**Spec**: [spec.md](./spec.md)

---

## R-001: Firestore Data Architecture for Financial Entities

**Decision**: Use Firestore subcollections under `users/{userId}/` for spaces, categories, transactions, and recurrences. Each entity is a separate subcollection.

**Rationale**: The existing codebase already follows this pattern (`users/{userId}/subscriptions`). Subcollections provide automatic per-user data isolation, efficient queries scoped to a user, and align with Firestore's document-oriented model. Since transactions will be the highest-volume collection, keeping them as a flat subcollection with composite indexes enables efficient filtering by space, type, currency, and date.

**Alternatives considered**:

- Root-level collections with `userId` field + security rules: Viable but loses the natural scoping and requires additional query-level filtering. More error-prone for security.
- Nested subcollections (e.g., `users/{userId}/spaces/{spaceId}/transactions`): Would make cross-space queries impossible without collection group queries, adding complexity.

---

## R-002: Real-Time Balance Computation Strategy

**Decision**: Compute balance client-side from the cached transaction list using `onSnapshot` real-time listeners. No server-side aggregation.

**Rationale**: The existing codebase uses `onSnapshot` for subscription data (see `subscribeToSubscriptions`). For the expected scale (1,000–10,000 transactions per user), client-side aggregation is fast and eliminates server round-trips for balance updates. The `onSnapshot` listener ensures the balance updates immediately when transactions are added or edited.

**Alternatives considered**:

- Firestore Cloud Functions to maintain an aggregated balance document: Adds complexity, eventual consistency lag, and a new deployment dependency. Contradicts FR-024 (no stored balance).
- Server-side queries with `COUNT` or `SUM` (Firestore aggregation queries): Would work but adds latency for each balance view. Not real-time.

---

## R-003: Pagination Strategy for Transaction Lists

**Decision**: Use Firestore cursor-based pagination with `startAfter()` / `limit()`, ordered by `transactionDate` descending (newest first, per FR-045).

**Rationale**: Firestore does not support offset-based pagination efficiently. Cursor-based pagination with `startAfter` is the recommended Firestore approach, performs well at scale, and avoids reading skipped documents (which count as reads and cost money).

**Alternatives considered**:

- Client-side pagination (load all, paginate in memory): Works for small datasets but breaks at 1,000+ transactions. Not scalable.
- Offset pagination: Not natively supported by Firestore. Can be simulated but inefficient.

---

## R-004: Firebase Storage for Attachments

**Decision**: Use Firebase Storage for file uploads. Store the download URL in the transaction document's `attachmentUrl` field. Store metadata (filename, size, content type) in `attachmentMeta`.

**Rationale**: Firebase Storage is already configured in the project (storage bucket is in firebase config). It provides direct upload from the client, automatic CDN distribution, and security rules based on auth state. The 5 MB limit will be enforced client-side before upload.

**Alternatives considered**:

- Storing files as base64 in Firestore documents: Firestore document size limit is 1 MB. Not viable for 5 MB files.
- Third-party storage (S3, Cloudinary): Adds external dependency. Firebase Storage is already available.

---

## R-005: Recurring Transaction Execution Strategy

**Decision**: Use Firebase Cloud Functions with a scheduled (cron) trigger that runs daily. The function queries all active recurrences where `nextExecutionDate <= today`, generates transactions, and advances the next execution date.

**Rationale**: Recurrences must execute even when the user's app is closed (spec assumption). A Cloud Function with Pub/Sub cron trigger is the standard Firebase pattern for this. It runs server-side, is idempotent (can be retried safely), and doesn't require the client to be active.

**Alternatives considered**:

- Client-side check on app open: Would miss transactions if user doesn't open the app. Unreliable.
- Firestore TTL or scheduled triggers: Firestore doesn't natively support scheduled document-triggered actions.

---

## R-006: Category Type Enforcement

**Decision**: The category's `type` field (Income | Expense) is immutable after creation. The transaction form filters available categories based on the selected transaction type. FR-010 is enforced both at the UI level (filtered dropdowns) and at the service layer (validation before write).

**Rationale**: Allowing a category's type to change would invalidate existing transactions linked to it. Immutability prevents data inconsistency. The UI filtering makes it impossible for users to accidentally select a mismatched category.

**Alternatives considered**:

- Mutable category type with cascade updates: Extremely complex and error-prone. A "Salary" category changing from Income to Expense would corrupt all linked transaction balances.

---

## R-007: Space Color/Icon Implementation

**Decision**: Spaces will have a `color` field (hex string from a predefined palette of 10–12 colors) and an `icon` field (emoji string). Users select from a predefined set during space creation/editing.

**Rationale**: A predefined palette ensures visual consistency and avoids color accessibility issues. Emoji icons are lightweight (no icon library dependency), cross-platform, and already used in the existing `categories.js` pattern.

**Alternatives considered**:

- Free-form color picker: Leads to poor color choices and accessibility issues (low contrast).
- Icon library (react-icons): Already in the project but adds selection complexity. Emoji is simpler for MVP.

---

## R-008: Transaction Editing Flow

**Decision**: Editing reuses the transaction creation form, pre-populated with existing data. The edit updates the Firestore document in place. The balance recomputes automatically via the `onSnapshot` listener.

**Rationale**: Reusing the creation form reduces code duplication. In-place updates are the standard Firestore pattern (already used in `updateSubscription`). The real-time listener ensures balance consistency without explicit refresh.

**Alternatives considered**:

- Inline editing in the transaction list: More complex UX. Better suited for a future sprint.
- Create-new + soft-delete: Overly complex for simple edits. Creates confusing audit trails.

---

## R-009: Deletion Protection Check Strategy

**Decision**: Before deleting a space or category, the service layer performs a Firestore query to check if any transactions or recurrences reference the entity. If results exist, deletion is blocked with a descriptive error.

**Rationale**: This is the most straightforward approach. The check query is lightweight (uses `limit(1)` to short-circuit). The existing service pattern separates concerns well — the check is in the service layer, not the UI.

**Alternatives considered**:

- Maintaining a counter field on spaces/categories: Adds write overhead on every transaction create/edit. Prone to drift if not carefully maintained.
- Client-side check from cached data: Unreliable if the cache is stale or incomplete (e.g., paginated transaction list doesn't load all transactions).
