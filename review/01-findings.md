# SubTracker — Code Review Findings (Phase 1)

**Reviewed:** `src/` (React 19 + TS + Vite + Firebase SDK), `functions/` (Firebase Cloud Functions, JS), rules/config/CI.
**Repo state:** branch `development`, clean, HEAD `1a55218`.
**Verified during review:** `npx tsc --project tsconfig.app.json --noEmit` → exit 0. `npx vitest run` → 3 files / 26 tests passed.

Sorted by severity (Critical → Low). One defect per ID.

---

## Critical

### F1 — Recurrence engine is wired to a schema that no longer exists; scheduled function can never fire

| | |
|---|---|
| **Severity** | Critical |
| **Location** | `functions/recurrenceProcessor.js:26-27`, `functions/dateLogic.js:22-34`, `src/services/recurrenceService.ts:47-48`, `src/models/recurrence.ts:5,11,33-34` |
| **Confidence** | High |

**Problem.** The Cloud Function and the client disagree on the recurrence document schema in **three independent ways**. The whole "automatic recurring transactions" feature is dead.

**Evidence.**

1. *Field name — status.* Function queries:
   ```js
   // functions/recurrenceProcessor.js:26
   .where("isActive", "==", true)
   ```
   Client only ever writes `status`:
   ```ts
   // src/services/recurrenceService.ts:48
   status: data.status ?? "active",
   ```
   `RecurrenceStatus = "active" | "paused"` (`src/models/recurrence.ts:5`). No code path writes `isActive`.

2. *Field name — next date.* Function queries and reads `nextExecutionDate` (`recurrenceProcessor.js:27,38,41,54`). Client writes and reads `nextDate` (`recurrenceService.ts:47`, `src/models/mappers.ts:182`).

3. *Value domain — pattern.* `dateLogic.js:22-34` switches on `"Weekly" | "Monthly" | "Yearly" | "Custom"`. Client `PATTERNS` are lowercase `"daily" | "weekly" | "monthly" | "yearly"` (`src/components/finance/RecurrenceForm.tsx:14`, `src/models/recurrence.ts:11`). Zero overlap — even after fixing (1) and (2), every pattern falls to `default` (monthly) and `"daily"` is silently treated as monthly.

Consequence chain: the `where("isActive","==",true)` query matches **zero** documents for every user, so no transaction is ever generated. Were it to match, `transactionDate: rec.nextExecutionDate` (`recurrenceProcessor.js:54`) would write `undefined`, and `advanceDate` would misinterpret the pattern.

A stale comment in `src/contexts/RecurrenceContext.tsx:64-65` asserts *"The toRecurrence mapper converts both formats correctly"* — `asRecurrenceStatus` (`mappers.ts:67-69`) never inspects `isActive`, so the claim is false and hid this.

**Proposed fix.** Pick one canonical schema (the typed client model: `status`, `nextDate`, lowercase patterns), rewrite the function's query, field reads, and `dateLogic.js` switch against it, and add a contract test that runs the function's query shape against a document produced by `addRecurrence`.

---

## High

### F2 — Transaction pagination "Next page" is a no-op; the cursor stack is never written

| | |
|---|---|
| **Severity** | High |
| **Location** | `src/contexts/TransactionContext.tsx:91` |
| **Confidence** | High |

**Problem.** `cursorStackRef` is read and cleared but never pushed to, so paging forward always re-queries page 1 while the UI reports "Previous" as available.

**Evidence.** The service hands back the raw docs needed for the cursor:
```ts
// src/services/transactionService.ts:164-167
callback: (transactions: Transaction[], rawDocs: QueryDocumentSnapshot<DocumentData>[]) => void,
```
The context's callback drops the second argument:
```tsx
// src/contexts/TransactionContext.tsx:91
(docs) => {
```
`grep -rn "rawDocs" src/` matches only the service declaration. The only writes to the ref are `cursorStackRef.current = []` (`:157`). So at `:83`, `cursorStackRef.current[cursorIndex]` is `undefined` for every `cursorIndex >= 0`, `startAfterDoc` is `undefined`, and `buildQuery` skips `startAfter` (`transactionService.ts:174`). `goNext` increments `cursorIndex`, which sets `hasPrev = true` (`:145`) but returns the same first page.

**Proposed fix.** Accept `rawDocs` in the callback and push `rawDocs[pageSize - 1]` onto `cursorStackRef.current[cursorIndex + 1]` before advancing; keep the stack truncated on filter/pageSize change.

---

### F3 — Payment history is never written, so History is permanently empty and the dashboard chart shows fabricated data

| | |
|---|---|
| **Severity** | High |
| **Location** | `src/contexts/SubscriptionContext.tsx:54-63`, `src/services/historyService.ts:15`, `src/pages/DashboardPage.tsx:207-209` |
| **Confidence** | High |

**Problem.** Renewal dates are silently rolled forward past due periods without recording that a payment occurred. `addPaymentRecord` — the only writer of the `payments` collection — is never called.

**Evidence.** `grep -rn "addPaymentRecord" src/` matches only its definition in `historyService.ts:15`. The advance loop discards each skipped period:
```tsx
// src/contexts/SubscriptionContext.tsx:54-61
while (isPastDue(nextDate)) {
  nextDate = getNextRenewalDate(nextDate, sub.billingCycle, sub.customCycleDays);
  advanced = true;
}
```
Because `payments` is always `[]`, `DashboardPage` takes its fallback branch and paints twelve identical fabricated months:
```tsx
// src/pages/DashboardPage.tsx:207-209
if (payments.length === 0 && activeSubscriptions.length > 0) {
  months.forEach((m) => (m.spending = Math.round(totalMonthly)));
}
```
`HistoryPage` renders from the same always-empty `payments`.

**Proposed fix.** Write a `Payment` per skipped period inside the advance loop (idempotently keyed by `subscriptionId + paidDate`), and delete the fabrication branch so an empty chart renders an empty state instead of invented numbers.

---

### F4 — Financial totals are computed from hardcoded exchange rates, and the dashboard sums currencies the balance layer explicitly refuses to sum

| | |
|---|---|
| **Severity** | High |
| **Location** | `src/utils/currencies.ts:25-32`, `src/pages/DashboardPage.tsx:140-146` |
| **Confidence** | High |

**Problem.** A money app presents cross-currency totals derived from a static rate table that is already wrong, and does so in direct contradiction of its own stated balance contract.

**Evidence.**
```ts
// src/utils/currencies.ts:25-32
export const EXCHANGE_RATES: ExchangeRateMap = {
  USD: 1, EGP: 50.5, EUR: 0.92, GBP: 0.79, SAR: 3.75, AED: 3.67,
};
```
Nothing refreshes these; there is no fetch, no timestamp, no staleness warning shown to the user. Meanwhile the balance utility documents the opposite rule:
```ts
// src/utils/balanceUtils.ts:21 (doc comment)
* Currencies are NEVER summed together.
```
and `DashboardPage` sums them anyway via `convertCurrency` at `:140-146` and `:171-175`, into a `displayCurrency` hardcoded to `"EGP"` at `:119`.

**Proposed fix.** Either (a) drop cross-currency aggregation from the dashboard and show per-currency cards consistent with `computeBalances`, or (b) source rates from a live API with a cached timestamp and label converted figures as approximate. Do not ship (a) and (b) half-mixed as now.

---

### F5 — Test coverage is limited to two pure utility modules; every stateful layer is untested

| | |
|---|---|
| **Severity** | High |
| **Location** | `src/utils/balanceUtils.test.ts`, `src/utils/dateUtils.test.ts`, `functions/dateLogic.test.js` |
| **Confidence** | High |

**Problem.** 3 test files / 26 tests over ~10,800 lines of source. Zero tests for services, contexts, mappers, forms, pages, or the recurrence processor — which is exactly where F1, F2, and F3 live. Each of those three defects is a schema/contract mismatch a single integration test would have caught.

**Evidence.** `find . -name "*.test.*" -not -path "*/node_modules/*"` returns exactly those three files. `@testing-library/react`, `@testing-library/user-event`, and `@testing-library/jest-dom` are all installed (`package.json` devDependencies) and `src/test/setup.ts` imports the matchers — but no test ever renders a component. `npx vitest run` → `Test Files 3 passed (3) / Tests 26 passed (26)`.

**Proposed fix.** Add a contract test for the recurrence document shape (function query vs. client writer), a `TransactionContext` pagination test with a fake snapshot stream, and mapper round-trip tests. These three target the highest-severity findings.

---

## Medium

### F6 — `firestore.indexes.json` tracks no composite indexes, though every filtered transaction query requires one

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `firestore.indexes.json:2`, `src/services/transactionService.ts:53-72` |
| **Confidence** | High that indexes are untracked; Medium that filtered queries fail at runtime |

**Problem.** `buildQuery` unconditionally appends `orderBy("transactionDate", "desc")` after up to six optional `where` clauses. Firestore requires a composite index for any equality filter combined with an `orderBy` on a different field. None are declared.

**Evidence.**
```json
// firestore.indexes.json
{ "indexes": [], "fieldOverrides": [] }
```
```ts
// src/services/transactionService.ts:58,71
constraints.push(where("spaceId", "==", filters.spaceId));
...
constraints.push(orderBy("transactionDate", "desc"));
```
Caveat stated honestly: the indexes may exist in the live Firebase project via console click-through, in which case the defect is that they are undeployable/unreproducible from the repo rather than broken today. Either way `firebase deploy --only firestore:indexes` from this repo would remove or fail to create them.

**Proposed fix.** Enumerate the filter combinations `FilterBar` can produce and declare each composite index in `firestore.indexes.json`; add index deploy to CI (see F14).

---

### F7 — Settings the user saves (`preferredCurrency`, `reminderDays`) are never read by any feature

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `src/pages/SettingsPage.tsx:143-165`, `src/pages/DashboardPage.tsx:119`, `src/components/layout/Header.tsx:52` |
| **Confidence** | High |

**Problem.** The Settings page persists two preferences that no consumer reads; both values are hardcoded at the point of use.

**Evidence.** `grep -rn "preferredCurrency" src/` matches only `SettingsPage`, `userService` (the type + writer), and the signup default in `authService.ts:59`. Same for `reminderDays`. Actual use sites ignore them:
```tsx
// src/pages/DashboardPage.tsx:119
const displayCurrency: CurrencyCode = "EGP";
```
```tsx
// src/components/layout/Header.tsx:52
isRenewingSoon(s.renewalDate, 7),
```
The user changes the currency, sees a success state, and nothing changes.

**Proposed fix.** Expose settings through a context/hook and consume it at both sites; or remove the controls until they are wired.

---

### F8 — Attachments are orphaned in Storage: `deleteAttachment` is never called and transactions cannot be deleted at all

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `src/services/storageService.ts:57`, `src/pages/TransactionFormPage.tsx:198-202`, `src/services/transactionService.ts` (no delete export) |
| **Confidence** | High |

**Problem.** Removing an attachment clears only the Firestore pointer; the uploaded file stays in Storage forever with no reference. There is also no way to delete a transaction, so no cleanup path exists at all.

**Evidence.** `grep -rn "deleteAttachment" src/` matches only the definition. The remove handler is purely local state:
```tsx
// src/pages/TransactionFormPage.tsx:198-202
const handleRemoveAttachment = () => {
  setAttachmentFile(null);
  setExistingAttachmentMeta(null);
  setExistingAttachmentUrl(null);
};
```
`grep -rn "deleteDoc" src/` returns category, recurrence, space, and subscription services — `transactionService.ts` has no delete function and no page offers the action.

**Proposed fix.** Call `deleteAttachment` when an attachment is removed or replaced, and add `deleteTransaction` that removes the attachment before the document.

---

### F9 — Storage rules enforce no content type or size limit; the 5 MB / JPEG-PNG-PDF policy is client-side only

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `storage.rules:6`, `src/services/storageService.ts:10-11` |
| **Confidence** | High |

**Problem.** The only checks on uploads are in browser code that an authenticated user controls.

**Evidence.**
```
// storage.rules
match /users/{userId}/{allPaths=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```
No `request.resource.size` or `request.resource.contentType` predicate. The limits live in JS only (`storageService.ts:10-11`, duplicated in `FileUpload.tsx:11-12`).

Blast radius is bounded to the user's own path — this is not cross-tenant exposure. The real risk is storage-cost abuse and hosting arbitrary content (including HTML/scripts served from a `firebasestorage` download URL) under the project.

**Proposed fix.** Add `request.resource.size < 5 * 1024 * 1024 && request.resource.contentType.matches('image/(jpeg|png)|application/pdf')` to the write rule.

---

### F10 — Every balance recomputation streams the user's entire transaction history with no limit

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `src/services/transactionService.ts:194-211`, `src/contexts/TransactionContext.tsx:122` |
| **Confidence** | High |

**Problem.** `subscribeToAllTransactions` builds the query with no `limit()` and holds an open `onSnapshot` listener over the whole collection, purely to feed `computeBalances`. Read cost and memory grow linearly and unboundedly with account age.

**Evidence.**
```ts
// src/services/transactionService.ts:200-201
const q = buildQuery(userId, filters);
return onSnapshot(q, ...
```
versus the paged variant at `:173` which does apply `limit(pageSize)`. The context subscribes to the unbounded one on every filter change (`TransactionContext.tsx:122`).

**Proposed fix.** Maintain running per-currency totals in aggregate documents updated on write (or a Firestore aggregation query), rather than streaming every document to the client.

---

### F11 — Typing in the tag filter tears down and rebuilds two Firestore listeners on every keystroke

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `src/components/finance/FilterBar.tsx:127`, `src/contexts/TransactionContext.tsx:84,122` |
| **Confidence** | High |

**Problem.** The tag input is uncontrolled-to-filters with no debounce, and the filter object is a subscription dependency.

**Evidence.**
```tsx
// src/components/finance/FilterBar.tsx:127
onChange={(e) => updateFilter("tag", e.target.value || undefined)}
```
`updateFilter` calls `setFilters({...filters, [key]: value})` (`:53`), which flows into `handleSetFilters` → `setFilters` + `resetPagination` (`TransactionContext.tsx:161-167`), re-running the effect at `:75` (dependency `filters`) and issuing a new `onSnapshot` per character. Compounding the waste: the query is `array-contains` on an exact lowercased tag (`transactionService.ts:64`), so every intermediate prefix matches nothing.

**Proposed fix.** Debounce the tag input (~300 ms) and commit to filters on blur/enter.

---

### F12 — User-facing strings are hardcoded English across contexts, services, and one form validator, in a bilingual EN/AR app

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `src/contexts/SpaceContext.tsx:56`, `src/contexts/TransactionContext.tsx:103,128`, `src/pages/TransactionFormPage.tsx:107-115`, `src/services/transactionService.ts:34-47` |
| **Confidence** | High |

**Problem.** The app ships an Arabic locale with RTL handling (`src/i18n.js:38-44`), but several user-visible strings bypass `t()` entirely. Arabic users see English error text.

**Evidence.**
```tsx
// src/contexts/SpaceContext.tsx:56
toast.error("Failed to sync spaces.");
```
Same pattern in `TransactionContext.tsx:103` (`"Failed to sync transactions."`), `:128`, `CategoryContext`, `RecurrenceContext.tsx:57`, `SubscriptionContext.tsx:101,109,121`. Form validation in the same file that otherwise uses `t()` everywhere:
```tsx
// src/pages/TransactionFormPage.tsx:107-108
if (!spaceId) e.spaceId = "Space is required.";
if (!categoryId) e.categoryId = "Category is required.";
```
compare `RecurrenceForm.tsx:48-54`, which does translate the equivalent messages. Service-layer errors (`transactionService.ts:34-47`) surface directly to toasts via `getErrorMessage(err)` (`TransactionFormPage.tsx:190`).

**Proposed fix.** Have services throw typed error codes and translate at the presentation boundary; route context toasts through `i18n.t`.

---

### F13 — Two independent, behaviourally different implementations of "advance a date by a recurrence pattern"

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `functions/dateLogic.js:6-38` vs `src/utils/dateUtils.ts:154-174` |
| **Confidence** | High |

**Problem.** The same business rule exists twice with different semantics, and neither is derived from the other.

**Evidence.** The function version works in UTC and clamps month-end overflow deliberately:
```js
// functions/dateLogic.js:13
result.setUTCDate(Math.min(day, daysInTargetMonth));
```
The client version uses `date-fns` in **local** time and has no `"custom"`/`"Custom"` case, so a custom-interval recurrence silently becomes monthly:
```ts
// src/utils/dateUtils.ts:162-173
switch (normalised) {
  case "weekly":  return addDays(d, 7 * interval);
  ...
  default:        return addMonths(d, interval);   // "custom" lands here
}
```
`addMonths` clamps similarly, so the divergence is timezone + missing case rather than month-end handling. `calculateNextExecutionDate` is what seeds `nextDate` at creation (`recurrenceService.ts:31-36`), while `advanceDate` is what would advance it afterwards — the seed and the step disagree.

**Proposed fix.** Extract one shared, UTC-based date module consumed by both `src/` and `functions/`, and delete the duplicate.

---

### F14 — CI deploys only the static site; Firestore rules, indexes, and Cloud Functions are never deployed, and `functions/` is excluded from linting

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `.github/workflows/deploy.yml`, `eslint.config.js:10` |
| **Confidence** | High |

**Problem.** Security rules and the scheduled function are versioned in the repo but have no automated path to production, so repo state and deployed state can drift silently — which is precisely the condition under which F1 survived.

**Evidence.** The workflow's only deploy step targets GitHub Pages; there is no `firebase deploy` invocation of any kind (no `--only firestore:rules`, `firestore:indexes`, `storage`, or `functions`). Linting explicitly skips the functions source:
```js
// eslint.config.js:10
globalIgnores(["dist", "functions", "subtracker-design-system"]),
```

**Proposed fix.** Add a `firebase deploy --only firestore:rules,firestore:indexes,storage,functions` job gated on the same branch, and remove `functions` from the ESLint ignore list.

---

### F15 — Cloud Functions pinned to Node 18, which is past its Cloud Functions decommission date

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `functions/package.json:9-11` |
| **Confidence** | Medium |

**Problem.** `"engines": { "node": "18" }`. Node 18 reached end-of-life in April 2025 and Firebase decommissioned the Node 18 Cloud Functions runtime for new and updated deployments; a deploy attempt is expected to be rejected outright.

**Evidence.**
```json
// functions/package.json:9-11
"engines": { "node": "18" },
```
Confidence is Medium because I did not attempt a deploy and did not verify Google's current runtime support matrix from within this session — the conclusion rests on the published deprecation schedule.

**Proposed fix.** Bump to Node 22 and confirm `firebase-functions` v5 compatibility (or upgrade to v6) before deploying.

---

### F16 — `createdAt` type drift: recurrences write a Firestore `Timestamp`, everything else writes ISO strings, and the mapper silently substitutes "now"

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `src/services/recurrenceService.ts:49`, `src/models/mappers.ts:27-28,184` |
| **Confidence** | High |

**Problem.** One service writes `serverTimestamp()` while every other writes `new Date().toISOString()`. The mapper's guard is `typeof v === "string"`, so a `Timestamp` object fails the check and gets replaced by the current clock — the displayed creation time of every recurrence is the moment it was read.

**Evidence.**
```ts
// src/services/recurrenceService.ts:49
createdAt: serverTimestamp(),
```
```ts
// src/models/mappers.ts:27-28
const asISOString = (v: unknown): ISOString =>
  typeof v === "string" ? v : new Date().toISOString();
```
Contrast `transactionService.ts:85,101`, `categoryService.ts:49,55`, `spaceService.ts:44,49`, `subscriptionService.ts:28,32` — all ISO strings. The same silent-substitution applies to `updatedAt` written by `pauseRecurrence`/`updateRecurrence`.

**Proposed fix.** Standardise on `serverTimestamp()` everywhere (client clocks are untrusted for financial records) and teach `asISOString` to convert a `Timestamp` via `toDate().toISOString()` instead of fabricating one.

---

### F17 — The 12-month spending trend matches payments by short month name, so any year's January lands in this year's January

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `src/pages/DashboardPage.tsx:196-206` |
| **Confidence** | High |

**Problem.** Buckets are keyed by a localized month abbreviation with no year component. `months.find` returns the first bucket with that label, so a payment from any prior year is attributed to the current-year bucket.

**Evidence.**
```tsx
// src/pages/DashboardPage.tsx:196-200
const label = new Date(p.paidDate).toLocaleDateString(lang, { month: "short" });
const item = months.find((m) => m.month === label);
```
The window spans 12 months across a year boundary (`:188-194`), so labels are not unique whenever `now.getMonth() !== 11`.

Note this is currently masked by F3 — `payments` is always empty, so the loop never executes. Fixing F3 exposes this.

**Proposed fix.** Key buckets by `yyyy-MM` and render the abbreviation only as a display label.

---

### F18 — Firestore rules validate ownership but not shape; update paths spread arbitrary client-supplied fields

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `firestore.rules:6-11`, `src/services/subscriptionService.ts:48-51`, `src/services/recurrenceService.ts:95-98` |
| **Confidence** | High |

**Problem.** The rules check only `request.auth.uid == userId`. Combined with update functions that spread the caller's object wholesale, any field of any type can be written to a document — including fields the mapper will later coerce into plausible-looking values.

**Evidence.**
```
// firestore.rules:7
allow read, write: if request.auth != null && request.auth.uid == userId;
```
```ts
// src/services/subscriptionService.ts:48-51
await updateDoc(docRef, { ...(data as Record<string, unknown>), updatedAt: ... });
```
Same shape at `recurrenceService.ts:95-98`. Note the `as Record<string, unknown>` cast defeats the TS types that would otherwise constrain the payload. `addSubscription` (`:29-34`) likewise spreads unvalidated input — unlike `addTransaction`, which does validate (`transactionService.ts:32-49`).

Blast radius is the user's own subtree only; this is a data-integrity issue, not a cross-tenant one.

**Proposed fix.** Add field allowlists + type predicates to the rules for each collection, and replace the spreads with explicit field-by-field assignment as `updateTransaction` already does (`transactionService.ts:123-146`).

---

### F19 — `advanceRenewalDate` loops forever if `customCycleDays` is ≤ 0

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `src/contexts/SubscriptionContext.tsx:54-61`, `src/utils/dateUtils.ts:49` |
| **Confidence** | Medium |

**Problem.** The loop termination depends on the date strictly advancing. With `billingCycle: "custom"` and `customCycleDays: 0`, `addDays(date, 0)` returns the same date and the `while (isPastDue(nextDate))` loop never exits — freezing the tab on subscription load.

**Evidence.**
```ts
// src/utils/dateUtils.ts:49
case "custom": return addDays(date, customDays ?? 30);
```
`?? 30` only substitutes for `null`/`undefined`; `0` and negatives pass through. The mapper accepts any number (`mappers.ts:104-107`).

Reachability is limited: the form applies `min="1"` + `required` (`SubscriptionFormPage.tsx:224,228`), so the UI blocks it. It is reachable via a legacy document, a direct SDK/console write, or any future writer — and F18 shows nothing at the rules layer prevents it. Confidence is Medium for that reason.

**Proposed fix.** Guard the loop with a max-iteration bound and treat `customCycleDays < 1` as the 30-day default at the utility level.

---

### F20 — The recurrence processor advances at most one interval per day, so a lapsed recurrence back-fills one period per calendar day

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `functions/recurrenceProcessor.js:41,70-73` |
| **Confidence** | High |

**Problem.** Each daily run creates exactly one transaction per matching recurrence and advances `nextExecutionDate` by a single interval. A monthly recurrence that lapsed for six months takes six days of scheduled runs to catch up, and the generated transactions carry historical dates that appear one per day.

**Evidence.**
```js
// functions/recurrenceProcessor.js:41
const nextDate = advanceDate(rec.nextExecutionDate, rec.pattern, interval);
```
There is no inner loop over the backlog; the outer `for` iterates documents, not periods.

Moot until F1 is fixed, but it should be fixed in the same change.

**Proposed fix.** Loop until `nextExecutionDate > today` (bounded, e.g. 500 iterations), batching the generated transactions inside the existing Firestore transaction.

---

### F21 — No React error boundary anywhere; a single render throw blanks the entire app

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `src/main.jsx:8-12`, `src/App.jsx:70-240` |
| **Confidence** | High |

**Problem.** `grep -rn "ErrorBoundary\|componentDidCatch" src/` returns no matches. Any uncaught render error — including the context-missing throws the codebase deliberately raises (`useTransactions`, `useSpaces`, `useAuth`, `useTheme`, `useRecurrences`) — unmounts the whole tree to a blank page with no recovery path and no user-visible message.

**Evidence.**
```jsx
// src/main.jsx:8-12
createRoot(document.getElementById("root")).render(
  <StrictMode><App /></StrictMode>,
);
```
No boundary at the root, none around routes, none around the provider stack (`App.jsx:102-232`).

**Proposed fix.** Add a root error boundary rendering a recoverable fallback, plus a per-route boundary inside `Layout` so a page crash does not take the shell with it.

---

### F22 — Referential-integrity checks for delete are client-side and racy

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `src/services/spaceService.ts:69-81`, `src/services/categoryService.ts:77-89` |
| **Confidence** | High |

**Problem.** "Cannot delete — it has linked transactions" is enforced by a read-then-delete in browser code, with nothing at the rules layer. The check is both bypassable (call `deleteDoc` directly) and time-of-check-to-time-of-use racy (a second tab can create a linked transaction between the query and the delete), leaving transactions pointing at a non-existent space or category.

**Evidence.**
```ts
// src/services/spaceService.ts:73-80
const hasLinks = await hasLinkedDocuments(userId, spaceId);
if (hasLinks) throw new Error("Cannot delete this space — ...");
const docRef = doc(db, "users", userId, "spaces", spaceId);
await deleteDoc(docRef);
```
Identical shape at `categoryService.ts:81-88`. Nothing downstream handles a dangling `spaceId`: `getSpaceById` returns `undefined` (`SpaceContext.tsx:88`) and callers do not guard.

**Proposed fix.** Move the delete behind a callable Cloud Function that performs the check and delete atomically, or soft-delete and reconcile; at minimum render dangling references safely.

---

### F23 — `SubscriptionsPage` bypasses its context and calls Firestore services directly with `user.uid`

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `src/pages/SubscriptionsPage.tsx:7-10,254`, `src/contexts/SubscriptionContext.tsx:22-29` |
| **Confidence** | High |

**Problem.** Every other domain follows page → context → service (`SpaceContext`, `CategoryContext`, `TransactionContext`, `RecurrenceContext` each expose mutators). `SubscriptionContext` exposes read state only, so pages import services directly and thread `user.uid` through the view layer — duplicating the auth guard and the error handling that the other contexts centralise.

**Evidence.**
```tsx
// src/pages/SubscriptionsPage.tsx:7-10
import { deleteSubscription, updateSubscription } from "@/services/subscriptionService";
```
```tsx
// src/pages/SubscriptionsPage.tsx:254
await deleteSubscription(user.uid, deleteTarget);
```
`SubscriptionContextValue` (`SubscriptionContext.tsx:22-29`) declares no mutators. Same pattern in `SubscriptionFormPage.tsx:112-114`.

**Proposed fix.** Add `addSubscription`/`updateSubscription`/`deleteSubscription` to `SubscriptionContext` with the same `if (!user) throw` guard the other contexts use, and remove direct service imports from pages.

---

### F24 — `addTransaction` returns an object that does not match what was stored

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `src/services/transactionService.ts:105-110` |
| **Confidence** | High |

**Problem.** The persisted document normalises tags and notes; the returned value is built from the **raw input** instead, so the caller receives untrimmed notes and un-lowercased tags for a document that stored the normalised form.

**Evidence.** Stored (`:94-97`):
```ts
notes: data.notes?.trim() ?? null,
tags: Array.isArray(data.tags) ? data.tags.map((t) => t.toLowerCase().trim()).filter(Boolean) : [],
```
Returned (`:105-110`):
```ts
return toTransaction(docRef.id, { ...data, amount, createdAt: now, updatedAt: now });
```
`...data` carries the pre-normalisation `notes` and `tags`. The same shape appears in `addCategory` (`categoryService.ts:57`), `addSpace` (`spaceService.ts:51`), and `addRecurrence` (`recurrenceService.ts:52-55`, which additionally substitutes a client ISO string for the `serverTimestamp()` it wrote — see F16).

Currently low-impact because callers ignore the return value except for `result.id` (`TransactionFormPage.tsx:164`), but it is a live footgun.

**Proposed fix.** Build the document payload once into a local variable and pass that same object to both `addDoc` and the mapper.

---

## Low

### F25 — Dead code: an entire unused validation module plus eight unreferenced exports and two orphan locale files

| | |
|---|---|
| **Severity** | Low |
| **Location** | `src/utils/validationUtils.ts` (whole file), `src/services/transactionService.ts:213`, `src/utils/dateUtils.ts:142,177,195`, `src/utils/balanceUtils.ts:59`, `src/services/historyService.ts:15`, `src/services/storageService.ts:57`, `src/locales/{en,ar}/translation_old.json` |
| **Confidence** | High |

**Problem.** Unreachable code that a reader must still evaluate, and which duplicates logic that *is* live.

**Evidence.** `grep` across `src/` finds no importer for:
- `src/utils/validationUtils.ts` — 117 lines, zero external references. It implements `validateAmount`/`validateCurrency`/`validateDate`/`validateTags`, duplicating the inline validation actually used in `transactionService.ts:32-49` and `TransactionFormPage.tsx:105-117`.
- `hasLinkedTransactions` (`transactionService.ts:213`) — definition only.
- `getYearlyEquivalent` (`dateUtils.ts:142`), `countRetroactiveOccurrences` (`:177`), `generateRetroactiveDates` (`:195`) — definitions only.
- `filterTransactions` (`balanceUtils.ts:59`) — referenced only by `balanceUtils.test.ts`; the app filters server-side.
- `addPaymentRecord` (see F3), `deleteAttachment` (see F8).
- `src/locales/en/translation_old.json`, `src/locales/ar/translation_old.json` — tracked in git, imported by nothing (`src/i18n.js:5-6` imports only `translation.json`).
- Orphan JSON keys `landing.howTo.{1..4}.color` exist in `en` only; the colors are hardcoded in `LandingPage.tsx:329,335,341,347` and never read from translations.

**Proposed fix.** Delete, or wire `validationUtils` in as the single validation source and delete the inline duplicates.

---

### F26 — Duplicated implementations: two near-identical service/context pairs, two local `ConfirmDialog`s shadowing the shared one, and duplicated upload constants

| | |
|---|---|
| **Severity** | Low |
| **Location** | `src/services/spaceService.ts` ↔ `src/services/categoryService.ts`; `src/contexts/SpaceContext.tsx` ↔ `src/contexts/CategoryContext.tsx`; `src/pages/CategoriesPage.tsx:36-48`, `src/pages/SpacesPage.tsx:18`; `src/services/storageService.ts:10-11` ↔ `src/components/finance/FileUpload.tsx:11-12` |
| **Confidence** | High |

**Problem.** Four separate copy-paste clusters. Each divergence is a place where a fix lands in one copy only (F31 is exactly that, already realised).

**Evidence.**
- `spaceService.ts` and `categoryService.ts` share the same `hasLinkedDocuments` helper (`:21-33` / `:25-37`), the same CRUD shape, and the same `subscribeTo*` body differing only in collection name and mapper.
- `CategoriesPage.tsx:43` and `SpacesPage.tsx:18` each declare a local `const ConfirmDialog = ...` while `src/components/ui/ConfirmDialog.tsx` exists and is used correctly by `SubscriptionsPage.tsx:25,431`.
- `ALLOWED_TYPES` / 5 MB limit declared twice, once per layer.

**Proposed fix.** Extract a generic `createOwnedCollectionService(collectionName, mapper)` factory; delete the two local dialogs in favour of the shared component; move the upload policy constants into one module imported by both layers.

---

### F27 — Context values are recreated on every render, forcing all consumers to re-render

| | |
|---|---|
| **Severity** | Low |
| **Location** | `src/contexts/TransactionContext.tsx:185-205`, `src/contexts/RecurrenceContext.tsx:101-110`, `src/contexts/SpaceContext.tsx:94-101` |
| **Confidence** | High |

**Problem.** The provider `value` is a fresh object literal each render, so every consumer of every one of the five nested providers re-renders whenever any of them updates — including the `pagination` sub-object rebuilt inline with a new `setPageSize` closure each time.

**Evidence.**
```tsx
// src/contexts/TransactionContext.tsx:185-202
const value: TransactionContextValue = { ..., pagination: { ..., setPageSize: (size) => {...} }, ... };
```
`RecurrenceContext` additionally defines all four mutators as plain (non-`useCallback`) functions inside the component body (`:75-97`). `SpaceContext` memoizes the callbacks but not the value object.

**Proposed fix.** Wrap each provider value in `useMemo` and each handler in `useCallback`.

---

### F28 — No catch-all route: an unknown URL renders the app shell with an empty content area

| | |
|---|---|
| **Severity** | Low |
| **Location** | `src/App.jsx:108-226` |
| **Confidence** | High |

**Problem.** The inner `<Routes>` has no `path="*"` entry, so `/typo` matches the outer `/*`, mounts `Layout` and all providers, and renders nothing inside — a chrome-only page rather than a 404.

**Evidence.** The last inner route is `/coming-soon` (`App.jsx:222-225`); no wildcard follows before `</Routes>` at `:226`.

**Proposed fix.** Add `<Route path="*" element={<NotFoundPage />} />` as the final inner route.

---

### F29 — All 18 pages are eagerly imported; no route-level code splitting

| | |
|---|---|
| **Severity** | Low |
| **Location** | `src/App.jsx:16-32` |
| **Confidence** | High |

**Problem.** Every page — including the 572-line `LandingPage` and the 564-line `DashboardPage` — plus `recharts` and `framer-motion` land in a single bundle. A logged-out visitor to the landing page downloads the entire authenticated app.

**Evidence.** `App.jsx:16-32` is 17 static `import` statements; `React.lazy` / `Suspense` appear nowhere in the codebase.

**Proposed fix.** Convert the authenticated routes to `React.lazy` behind a `Suspense` fallback.

---

### F30 — `localStorage` access is unguarded, so a blocked-storage browser context white-screens the app at boot

| | |
|---|---|
| **Severity** | Low |
| **Location** | `src/contexts/ThemeContext.tsx:26,37`, `src/i18n.js:43,47,51` |
| **Confidence** | Medium |

**Problem.** `localStorage` getters/setters throw (not return `null`) when storage is denied — third-party iframe contexts, some privacy modes, or "block all cookies". The theme read happens inside a `useState` initializer with no `try`, so the throw propagates through render, and with no error boundary (F21) the result is a blank page.

**Evidence.**
```tsx
// src/contexts/ThemeContext.tsx:25-28
const [theme, setTheme] = useState<Theme>(() => {
  const saved = localStorage.getItem("subtracker-theme");
```
`src/i18n.js:47` runs the same unguarded read at module scope, before React mounts at all.

Confidence Medium: it depends on the browser configuration and does not reproduce in a normal session.

**Proposed fix.** Wrap reads/writes in a small `safeStorage` helper with `try/catch` returning `null` on failure.

---

### F31 — `updateSpace` accepts a blank name; the sibling `updateCategory` rejects it

| | |
|---|---|
| **Severity** | Low |
| **Location** | `src/services/spaceService.ts:63` vs `src/services/categoryService.ts:65-66` |
| **Confidence** | High |

**Problem.** A divergence between the two copy-pasted services (F26). `addSpace` requires a non-empty name (`:39`), but the update path does not, so a space can be renamed to `""` and then renders as an invisible entry in every selector.

**Evidence.**
```ts
// src/services/categoryService.ts:65-66
if (data.name !== undefined && !data.name.trim())
  throw new Error("Category name is required.");
```
```ts
// src/services/spaceService.ts:63
if (data.name !== undefined) updateData["name"] = data.name.trim();   // no guard
```

**Proposed fix.** Add the same guard (ideally once, via the shared factory in F26).

---

### F32 — `reactivateRecurrence` re-anchors the schedule to today, discarding the original cycle alignment

| | |
|---|---|
| **Severity** | Low |
| **Location** | `src/services/recurrenceService.ts:73` |
| **Confidence** | High |

**Problem.** Resuming a paused recurrence computes the next date from `new Date()` rather than from the stored `startDate`/`nextDate` anchor, so a rent recurrence anchored to the 1st silently moves to whatever day the user clicked resume.

**Evidence.**
```ts
// src/services/recurrenceService.ts:73
const nextExec = calculateNextExecutionDate(new Date(), pattern, interval);
```
The stored anchor (`startDate`, `nextDate`) is available on the document and ignored. Note also that pause/resume is not reflected in `endDate` handling, so a long pause shortens the effective run.

**Proposed fix.** Advance from the stored anchor until the result is in the future, preserving day-of-cycle.

---

### F33 — Entry point and root component are untyped JS in an otherwise fully typed codebase

| | |
|---|---|
| **Severity** | Low |
| **Location** | `src/App.jsx`, `src/main.jsx` |
| **Confidence** | High |

**Problem.** Every other module under `src/` is `.ts`/`.tsx`; the two files that wire the app together are not. `ProtectedRoute`, `PublicAuthRoute`, and `RootRoute` take untyped `children`, and `document.getElementById("root")` is dereferenced without a null check (`main.jsx:8`) — something the TS config would flag.

**Evidence.** `find src -name "*.jsx"` returns exactly `App.jsx` and `main.jsx`; `i18n.js` is the only other non-TS module. ESLint applies a weaker rule set to `**/*.{js,jsx}` (`eslint.config.js:14-36`) than to TS files.

**Proposed fix.** Rename to `.tsx`/`.ts` and type the route-guard props.

---

### F34 — `_existingAttachmentUrl` is underscore-prefixed as if unused, but is read on the submit path

| | |
|---|---|
| **Severity** | Low |
| **Location** | `src/pages/TransactionFormPage.tsx:60,139` |
| **Confidence** | High |

**Problem.** The underscore convention signals "intentionally unused" to both readers and the linter; this variable is load-bearing.

**Evidence.** Declared at `:60-62` as `_existingAttachmentUrl`, then read at `:139`:
```tsx
attachmentUrl: _existingAttachmentUrl,
```

**Proposed fix.** Rename to `existingAttachmentUrl`.

---

### F35 — The recurrence modal is not keyboard-accessible: no Escape handler, no focus trap, no dialog semantics

| | |
|---|---|
| **Severity** | Low |
| **Location** | `src/components/finance/RecurrenceForm.tsx:115-116` |
| **Confidence** | High |

**Problem.** The overlay is a plain `div` with `fixed inset-0`. Keyboard users cannot dismiss it with Escape, focus is not moved into or trapped within it, and screen readers receive no dialog role or label. Background content stays focusable and scrollable.

**Evidence.**
```tsx
// src/components/finance/RecurrenceForm.tsx:115-116
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
  <div className="bg-white dark:bg-surface-dark rounded-2xl ... overflow-y-auto p-6">
```
No `role="dialog"`, `aria-modal`, `aria-labelledby`, `onKeyDown`, or focus management anywhere in the file. The backdrop also has no click-to-close handler.

**Proposed fix.** Use a shared modal primitive (or `<dialog>`) providing role, labelling, Escape, backdrop click, and focus trap; apply it to the local dialogs in F26 too.

---

### F36 — `SettingsPage` spins forever if rendered without a user

| | |
|---|---|
| **Severity** | Low |
| **Location** | `src/pages/SettingsPage.tsx:29-48` |
| **Confidence** | Medium |

**Problem.** `loading` starts `true` and is cleared only inside `if (user) { ... }`. With no user the effect body never runs, `setLoading(false)` is never reached, and the page renders the spinner branch (`:62-68`) indefinitely.

**Evidence.**
```tsx
// src/pages/SettingsPage.tsx:29-31
useEffect(() => {
  if (user) {
    (async () => { ... setLoading(false); })();
  }
}, [user, t]);
```
No `else`. Confidence Medium because `ProtectedRoute` normally guarantees a user; the window is the logout transition, where `user` flips to `null` before the redirect commits.

**Proposed fix.** Add an `else { setLoading(false); }` branch.

---

### F37 — `calculateNextExecutionDate` has no `"custom"` case, so custom-interval recurrences are seeded as monthly

| | |
|---|---|
| **Severity** | Low |
| **Location** | `src/utils/dateUtils.ts:162-173` |
| **Confidence** | Medium |

**Problem.** The `switch` handles `weekly`/`monthly`/`yearly`/`daily` and falls through to `addMonths` otherwise. `functions/dateLogic.js:32-34` *does* handle `"Custom"` as `addDays(interval)`, so the two sides would disagree even after F1's rename.

**Evidence.**
```ts
// src/utils/dateUtils.ts:171-172
default:
  return addMonths(d, interval);
```
Confidence Medium on impact: the current `RecurrencePattern` union (`models/recurrence.ts:11`) has no `"custom"` member and `RecurrenceForm.tsx:14` cannot produce one, so this is latent rather than active — but `BillingCycle` *does* include `"custom"` and the function-side code expects it.

**Proposed fix.** Resolve as part of the single shared date module in F13; decide explicitly whether `custom` is a recurrence pattern.

---

### F38 — The scheduled processor walks every user document sequentially with one query each

| | |
|---|---|
| **Severity** | Low |
| **Location** | `functions/recurrenceProcessor.js:18-30` |
| **Confidence** | High |

**Problem.** `listDocuments()` on `users` materialises every user, then issues one `recurrences` query per user inside a sequential `for` loop, then one Firestore transaction per matching recurrence — also sequential. Runtime is O(users) with no batching, concurrency, or pagination, against the function's default timeout.

**Evidence.**
```js
// functions/recurrenceProcessor.js:18-28
const usersSnap = await db.collection("users").listDocuments();
for (const userDoc of usersSnap) {
  const recSnap = await db.collection("users").doc(userId).collection("recurrences")...
```
Fine at current scale; it is the shape that fails first as the user count grows.

**Proposed fix.** Use a Firestore collection-group query on `recurrences` filtered by the same predicates, and process in bounded-concurrency batches.

---

## Explicitly considered and NOT reported

- **Firebase Web API key in `.env` / bundle** — not a finding. These identifiers are public by design; `.env` is gitignored (`.gitignore:16`) and untracked (`git ls-files | grep -i env` → empty), and CI injects them from repository secrets. Access control is the rules layer, covered by F9 and F18.
- **`FilterBar` `dateRange` object identity causing a resubscribe loop** — checked and rejected. `filters` only changes on user interaction (`FilterBar.tsx:53,62,64`), never on render, so the `TransactionContext.tsx:132-138` dependency array is stable.
- **`landing.howTo.N.color` missing from the Arabic locale** — checked and rejected as a bug. The colors are hardcoded in `LandingPage.tsx:329,335,341,347` and never resolved through `t()`; the English keys are orphan data, folded into F25.
- **Locale key parity** — measured: 396 EN keys vs 402 AR keys, and the entire delta is Arabic plural suffixes (`days_zero`…`days_other`) plus the orphan color keys above. Translation coverage is genuinely complete.
