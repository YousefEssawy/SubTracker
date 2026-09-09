# SubTracker — Final Findings (post-debate)

Supersedes `01-findings.md`. Debate record and reasoning for every change: `02-debate-findings.md`.

**45 findings.** Changes from Phase 1: F39 and F40 added; F4 split into F4a/F4b; F37 folded into F13; F11, F19, F24, F26, F35, F36 revised. F41-F44 were found during my own Phase 2 verification reads (neither raised nor disputed by Gemini) and are marked as such. Every other finding is unchanged from `01-findings.md`, where the full evidence blocks live.

| Verified | Result |
|---|---|
| `npx tsc --project tsconfig.app.json --noEmit` | exit 0 |
| `npx vitest run` | 3 files / 26 tests passed |
| `git status --porcelain` after Gemini's read-only run | `?? review/` only — no repo modification |

---

## Critical

**F1 — Recurrence engine wired to a schema that no longer exists; the scheduled function can never fire.** Confidence: High. *Unchanged; independently confirmed by Gemini.*
`functions/recurrenceProcessor.js:26-27`, `functions/dateLogic.js:22-34`, `src/services/recurrenceService.ts:47-48`, `src/models/recurrence.ts:5,11`
Three independent contract breaks: the function queries `isActive` / `nextExecutionDate` while the client writes `status` / `nextDate`, and `dateLogic.js` switches on `"Weekly"|"Monthly"|"Yearly"|"Custom"` against a client union of `"daily"|"weekly"|"monthly"|"yearly"` — zero overlap. The query matches nothing for every user, so no transaction is ever generated. The comment at `RecurrenceContext.tsx:64-65` claiming the mapper handles both formats is false (`mappers.ts:67-69` never reads `isActive`) and hid this.
**Fix:** adopt the typed client model as canonical; rewrite the function's query, field reads, and pattern switch against it; add a contract test running the function's query shape against a document produced by `addRecurrence`.

---

## High

**F2 — Pagination "Next" is a no-op; the cursor stack is never written.** Confidence: High. *Unchanged; independently confirmed by Gemini.*
`src/contexts/TransactionContext.tsx:91`
The callback drops the `rawDocs` argument the service supplies (`transactionService.ts:164-167`); `cursorStackRef` is only ever cleared (`:157`), so `startAfterDoc` is permanently `undefined` and paging forward re-queries page 1 while `hasPrev` flips to true.
**Fix:** capture `rawDocs`, push `rawDocs[pageSize - 1]` at `cursorIndex + 1` before advancing, truncate on filter/pageSize change.

**F3 — Payment history is never written: History is permanently empty and the dashboard chart shows fabricated data.** Confidence: High. *Unchanged.*
`src/contexts/SubscriptionContext.tsx:54-63`, `src/services/historyService.ts:15`, `src/pages/DashboardPage.tsx:207-209`
`addPaymentRecord` has no callers. The advance loop rolls renewal dates past due periods and records nothing. With `payments` always empty, the dashboard paints twelve identical invented months.
**Fix:** write a `Payment` per skipped period, idempotent on `subscriptionId + paidDate`; delete the fabrication branch in favour of an empty state.

**F4b — The app contradicts its own documented rule on summing currencies, giving two different monthly totals on two pages.** Confidence: High. *Split from F4; downgrade to Low rejected — see D6.*
`src/utils/balanceUtils.ts:21`, `src/pages/DashboardPage.tsx:140-145`, `src/pages/SubscriptionsPage.tsx:239-240`
`balanceUtils` documents *"Currencies are NEVER summed together"*; `SubscriptionsPage` obeys it and keys totals per currency; `DashboardPage` collapses everything into a hardcoded EGP via `convertCurrency`. A user holding USD and EGP subscriptions sees one figure on `/dashboard` and a different, differently-shaped one on `/subscriptions`, unexplained. This is two features disagreeing about the domain model, independent of where rates come from.
**Fix:** pick one policy. Either the dashboard shows per-currency cards like `SubscriptionsPage`, or cross-currency aggregation becomes the documented contract and `balanceUtils`' comment and `SubscriptionsPage` are brought into line.

**F5 — Test coverage reaches only two pure utility modules; every stateful layer is untested.** Confidence: High. *Unchanged.*
`src/utils/balanceUtils.test.ts`, `src/utils/dateUtils.test.ts`, `functions/dateLogic.test.js`
3 files / 26 tests over ~10,800 lines. No tests for services, contexts, mappers, forms, pages, or the recurrence processor — precisely where F1, F2, and F3 live. `@testing-library/*` is installed and `src/test/setup.ts` imports the matchers, but nothing renders a component.
**Fix:** prioritise a recurrence-schema contract test, a `TransactionContext` pagination test over a fake snapshot stream, and mapper round-trips.

**F19 — `advanceRenewalDate` hangs the main thread forever if `customCycleDays` ≤ 0.** Severity raised Medium → High; Confidence held Medium. *See D5.*
`src/contexts/SubscriptionContext.tsx:54-61`, `src/utils/dateUtils.ts:49`
`addDays(date, 0)` returns the same date, so `while (isPastDue(nextDate))` never exits. The loop is called synchronously from the subscriptions snapshot handler (`:89-95`), which runs on every mount for every authenticated user — the tab hangs before any UI the user could use to fix the value renders. No timeout, no iteration cap, no in-app recovery. `?? 30` at `dateUtils.ts:49` only substitutes for nullish, so `0` and negatives pass through, and `mappers.ts:104-107` accepts any number.
*Severity is High on impact — total and unrecoverable. Confidence is Medium on reachability: `min="1"` + `required` (`SubscriptionFormPage.tsx:224,228`) blocks it in the only writer that exists, so this is a serious bug behind a currently-closed door.*
**Fix:** bound the loop with a max-iteration guard and clamp `customCycleDays < 1` to the 30-day default at the utility level.

---

## Medium

**F4a — Static exchange rates are presented as exact currency figures with no label or rate date.** Severity lowered High → Medium. *Split from F4; partial concession — see D6.*
`src/utils/currencies.ts:25-32,50-58`
Choosing a static table over an FX API is a defensible product decision for this app, and that half of the original finding is conceded. What remains is that nothing tells the user: converted figures go through `formatCurrency` and render as fully-formatted currency strings indistinguishable from exact ones, with no "approx.", no rate date, and no staleness indicator anywhere in the UI. `EGP: 50.5` has no refresh path and no timestamp.
**Fix:** label converted figures as approximate and surface the rate date. An API integration is not required to close this.

**F6 — `firestore.indexes.json` declares no composite indexes though every filtered transaction query needs one.** Confidence: High that they are untracked; Medium that queries fail today. *Unchanged; independently confirmed by Gemini.*
`firestore.indexes.json:2`, `src/services/transactionService.ts:53-72`
`buildQuery` always appends `orderBy("transactionDate","desc")` after up to six optional `where` clauses. Firestore requires a composite index for an equality filter combined with an `orderBy` on a different field. The indexes may exist in the live project via console click-through, in which case the defect is that they are unreproducible from the repo and a `firebase deploy --only firestore:indexes` would drop them.
**Fix:** enumerate the combinations `FilterBar` can produce, declare each index, and deploy indexes from CI (F14).

**F7 — Saved settings (`preferredCurrency`, `reminderDays`) are read by nothing.** Confidence: High. *Unchanged.*
`src/pages/SettingsPage.tsx:143-165`, `src/pages/DashboardPage.tsx:119`, `src/components/layout/Header.tsx:52`
Both values are hardcoded at every use site (`"EGP"`, `7`). The user changes a preference, sees a success state, and nothing changes.
**Fix:** expose settings via a context/hook and consume at both sites, or remove the controls until wired.

**F8 — Attachments are orphaned: `deleteAttachment` is never called and transactions cannot be deleted at all.** Confidence: High. *Unchanged.*
`src/services/storageService.ts:57`, `src/pages/TransactionFormPage.tsx:198-202`, `src/services/transactionService.ts` (no delete export)
Removing an attachment clears local state and nulls the pointer; the file stays in Storage unreferenced. No `deleteTransaction` exists in the service or any page, so there is no cleanup path at all.
**Fix:** call `deleteAttachment` on remove and replace; add `deleteTransaction` that clears the attachment first.

**F9 — Storage rules enforce no content type or size; the 5 MB / JPEG-PNG-PDF policy is client-side only.** Confidence: High. *Unchanged.*
`storage.rules:6`, `src/services/storageService.ts:10-11`
The rule checks ownership and nothing else — no `request.resource.size`, no `contentType`. Blast radius is the user's own path; the real risk is storage-cost abuse and hosting arbitrary content behind a project download URL.
**Fix:** add `request.resource.size < 5 * 1024 * 1024 && request.resource.contentType.matches('image/(jpeg|png)|application/pdf')`.

**F10 — Every balance recomputation streams the entire transaction history with no limit.** Confidence: High. *Unchanged.*
`src/services/transactionService.ts:194-211`, `src/contexts/TransactionContext.tsx:122`
`subscribeToAllTransactions` builds the query without `limit()` and holds an open listener over the whole collection to feed `computeBalances`. Cost and memory grow linearly with account age. Compare the paged variant at `:173`, which does limit.
**Fix:** maintain per-currency aggregate documents updated on write, or use a Firestore aggregation query.

**F11 — Typing in the tag filter tears down and rebuilds a Firestore listener on every keystroke.** Corrected: *one* listener, not two. *See D1.*
`src/components/finance/FilterBar.tsx:127`, `src/contexts/TransactionContext.tsx:84`
`updateFilter` rebuilds the whole `filters` object per character, re-running the paginated effect (dependency `filters`) and issuing a fresh `onSnapshot` each time, plus resetting pagination. The balance listener is *not* affected — its dependency array lists individual fields and omits `tag` (`:132-138`), which is its own bug (F39). Compounding the waste: the query is `array-contains` on an exact lowercased tag, so every intermediate prefix matches nothing.
**Fix:** debounce ~300 ms, or commit on blur/Enter.

**F12 — User-facing strings are hardcoded English across contexts, services, and one form validator, in a bilingual EN/AR app.** Confidence: High. *Unchanged.*
`src/contexts/SpaceContext.tsx:56`, `src/contexts/TransactionContext.tsx:103,128`, `src/pages/TransactionFormPage.tsx:107-115`, `src/services/transactionService.ts:34-47`
Context toasts and service error messages bypass `t()` entirely; `TransactionFormPage.validate` hardcodes messages that `RecurrenceForm.tsx:48-54` translates. Arabic users see English error text.
**Fix:** throw typed error codes from services, translate at the presentation boundary, route context toasts through `i18n.t`.

**F13 — Two divergent implementations of "advance a date by a recurrence pattern".** Confidence: High. *Absorbed former F37 — see D9.*
`functions/dateLogic.js:6-38` vs `src/utils/dateUtils.ts:154-174`
The function version is UTC with explicit month-end clamping; the client version is `date-fns` in local time. Supporting evidence (formerly F37): the client `switch` has no `"custom"` branch and falls through to `addMonths`, while `dateLogic.js:32-34` handles `"Custom"` as `addDays(interval)`. The two sides would still disagree after F1's rename. `calculateNextExecutionDate` seeds `nextDate` at creation while `advanceDate` would step it afterwards — seed and step do not agree.
*Filed as one finding deliberately: patching the client `switch` alone would look like a fix while leaving the duplication that caused it.*
**Fix:** extract one shared UTC-based date module consumed by both `src/` and `functions/`; delete the duplicate. Decide explicitly whether `custom` is a recurrence pattern.

**F14 — CI deploys only the static site; rules, indexes, and functions never ship, and `functions/` is unlinted.** Confidence: High. *Unchanged.*
`.github/workflows/deploy.yml`, `eslint.config.js:10`
No `firebase deploy` invocation of any kind. `globalIgnores(["dist", "functions", ...])` excludes the function source from linting. Repo state and deployed state can drift silently — the condition under which F1 survived.
**Fix:** add a `firebase deploy --only firestore:rules,firestore:indexes,storage,functions` job; remove `functions` from the ignore list.

**F15 — Cloud Functions pinned to Node 18, past its Cloud Functions decommission date.** Confidence: Medium. *Unchanged.*
`functions/package.json:9-11`
Node 18 is EOL and the Firebase Node 18 runtime is decommissioned for new and updated deployments; a deploy is expected to be rejected. Medium confidence because no deploy was attempted and the current runtime matrix was not verified in-session.
**Fix:** bump to Node 22; confirm `firebase-functions` v5 compatibility or upgrade to v6.

**F16 — `createdAt` type drift: recurrences write a `Timestamp`, everything else writes ISO strings, and the mapper silently substitutes "now".** Confidence: High. *Unchanged.*
`src/services/recurrenceService.ts:49`, `src/models/mappers.ts:27-28,184`
`asISOString` guards on `typeof v === "string"`, so a `Timestamp` fails and is replaced by the read-time clock. The displayed creation time of every recurrence is the moment it was read. Same applies to `updatedAt` from `pauseRecurrence`/`updateRecurrence`.
**Fix:** standardise on `serverTimestamp()` everywhere (client clocks are untrusted for financial records) and convert via `toDate().toISOString()` instead of fabricating.

**F17 — The 12-month trend buckets by short month name, so any year's January lands in this year's January.** Confidence: High. *Unchanged.*
`src/pages/DashboardPage.tsx:196-200`
Buckets are keyed by a localized abbreviation with no year; the window spans a year boundary, so labels are not unique. Currently masked by F3 (`payments` always empty); fixing F3 exposes it.
**Fix:** key by `yyyy-MM`, render the abbreviation as a display label only.

**F18 — Firestore rules validate ownership but not shape; update paths spread arbitrary client fields.** Confidence: High. *Unchanged.*
`firestore.rules:6-11`, `src/services/subscriptionService.ts:48-51`, `src/services/recurrenceService.ts:95-98`
Any field of any type can be written. The `as Record<string, unknown>` casts defeat the TS types that would otherwise constrain the payload. `addSubscription` (`:29-34`) also spreads unvalidated input, unlike `addTransaction` which validates (`transactionService.ts:32-49`). Blast radius is the user's own subtree — data integrity, not cross-tenant. This is also what keeps F19 reachable in principle.
**Fix:** field allowlists and type predicates per collection in the rules; replace the spreads with explicit assignment as `updateTransaction` already does (`:123-146`).

**F20 — The recurrence processor advances one interval per day, back-filling a lapsed recurrence one period per calendar day.** Confidence: High. *Unchanged.*
`functions/recurrenceProcessor.js:41,70-73`
No inner loop over the backlog. A monthly recurrence lapsed six months takes six days of scheduled runs to catch up. Moot until F1 is fixed; fix in the same change.
**Fix:** loop until `nextExecutionDate > today` with a bound (~500), batching inside the existing Firestore transaction.

**F21 — No React error boundary anywhere; one render throw blanks the app.** Confidence: High. *Unchanged.*
`src/main.jsx:8-12`, `src/App.jsx:70-240`
No `ErrorBoundary` or `componentDidCatch` in the codebase. Any uncaught render error — including the deliberate context-missing throws in `useTransactions`/`useSpaces`/`useAuth`/`useTheme`/`useRecurrences` — unmounts the whole tree to a blank page with no message and no recovery. This is also what turns F30 into a white-screen.
**Fix:** root boundary with a recoverable fallback, plus a per-route boundary inside `Layout`.

**F22 — Referential-integrity checks for delete are client-side and racy.** Confidence: High. *Unchanged.*
`src/services/spaceService.ts:69-81`, `src/services/categoryService.ts:77-89`
Read-then-delete in browser code with nothing at the rules layer: bypassable by calling `deleteDoc` directly, and TOCTOU-racy against a second tab. Nothing downstream handles a dangling reference — `getSpaceById` returns `undefined` and callers do not guard.
**Fix:** perform check-and-delete atomically in a callable function, or soft-delete and reconcile; at minimum render dangling references safely.

**F23 — `SubscriptionsPage` bypasses its context and calls Firestore services directly with `user.uid`.** Confidence: High. *Unchanged.*
`src/pages/SubscriptionsPage.tsx:7-10,254`, `src/contexts/SubscriptionContext.tsx:22-29`
Every other domain follows page → context → service. `SubscriptionContextValue` declares no mutators, so pages import services directly and thread `user.uid` through the view layer, duplicating the auth guard and error handling the other contexts centralise. Same pattern in `SubscriptionFormPage.tsx:112-114`.
**Fix:** add the mutators to `SubscriptionContext` with the same `if (!user) throw` guard; remove direct service imports from pages.

**F39 — The tag filter is silently excluded from the balance figures.** Confidence: High. *New — raised by Gemini, see D2.*
`src/contexts/TransactionContext.tsx:116-121`
`balanceFilters` copies `spaceId`, `currency`, `dateRange`, and `type` — every filter except `tag`. Filtering by tag updates the transaction list but leaves income/expense/balance unchanged. The UI makes the intent unambiguous: `TransactionsPage.tsx:90-92` stacks the filter-aware `<BalanceCard variant="contextual">` directly above `<FilterBar>`. A contextual card that honours four filters and ignores the fifth is a correctness bug.
*Rated Medium rather than Gemini's High: the figures are correct for the filters they do apply, no stored data is wrong, and per-transaction amounts remain visible in the list beside it.*
**Fix:** include `tag` in `balanceFilters` and in the effect's dependency array — coordinate with F11's debounce so it does not become a per-keystroke full-collection re-read.

**F40 — `subscribeToPayments` is unbounded, the same defect as F10.** Confidence: High. *New — raised by Gemini, see D3.*
`src/services/historyService.ts:34`, `src/contexts/SubscriptionContext.tsx:114-124`
`query(paymentsRef, orderBy("paidDate", "desc"))` with no `limit()`, subscribed for every authenticated user on mount regardless of whether History is open.
*Currently dormant — F3 establishes nothing writes to `payments`, so the snapshot is always empty. It goes live the moment F3 is fixed, which is a reason to fix both together rather than to defer it.*
**Fix:** paginate the history query as `subscribeToTransactions` does, and subscribe lazily from `HistoryPage` rather than eagerly in the provider.

**F41 — Attachments are write-only: uploaded, stored, paid for, and never displayed anywhere.** Confidence: High. *New — found during Phase 2 verification reads, not raised by either party in the debate.*
`src/pages/TransactionDetailPage.tsx`, `src/components/finance/FileUpload.tsx:83-91`
`grep -rn "attachmentUrl\|attachmentMeta" src/pages/ src/components/` returns matches in `TransactionFormPage.tsx` only. `TransactionDetailPage` renders amount, date, space, category, tags, and notes — and never the attachment. The sole place a user sees any evidence of the file is the `FileUpload` name/size preview while re-editing the transaction (`FileUpload.tsx:83-91`); the download URL is never rendered as a link or image. A user attaches a receipt and can never look at it again.
*Together with F8 (no cleanup path) this means the attachment feature currently only accumulates cost.*
**Fix:** render `attachmentUrl` on `TransactionDetailPage` as a thumbnail for images and a download link for PDFs, keyed off `attachmentMeta.type`.

**F45 — Pre-migration recurrence documents render today as active with a blank next-execution date.** Confidence: High. *New — surfaced in Phase 4 by checking git history (see P6 in `05-debate-plan.md`).*
`src/models/mappers.ts:170-186`, `src/services/recurrenceService.ts` (history), `functions/recurrenceProcessor.js:26-27`
Commit `a3c0165` shipped a client that wrote `nextExecutionDate`, `isActive: true`, and capitalised patterns (`PATTERNS = ["Weekly","Monthly","Yearly","Custom"]`); the TypeScript migration (`da9f93f`, `2491940`) switched the client to `nextDate`/`status`/lowercase and left the Cloud Function on the old contract. Any recurrence created before that migration is read by `toRecurrence` as: `nextDate` absent, so `asString` yields `""`; `status` absent, so `asRecurrenceStatus` defaults to `"active"` (`:67-69`); `pattern: "Monthly"` outside the allowed list, so it silently becomes `"monthly"` (`:71-76`). Such a recurrence displays as active with an empty next date and a reinterpreted pattern **right now** — this is not conditional on fixing F1.
*This also reframes F1: the function was correct when written, and the defect is a client migration that left the backend behind with nothing in CI to detect the drift (F14) and no cross-boundary test (F5).*
**Fix:** count pre-migration documents, then backfill them to the canonical schema as part of the recurrence work; until then, make `toRecurrence` surface an unmapped legacy document rather than defaulting it into a plausible-looking active one.

---

## Low

**F24 — `addTransaction` returns an object that does not match what was stored.** Severity lowered Medium → Low. *See D7.*
`src/services/transactionService.ts:105-110`
The stored document normalises tags and notes; the return value is rebuilt from raw input via `...data`. Nothing consumes the mismatched fields — callers take `result.id` (`TransactionFormPage.tsx:164`) or ignore the return — and persisted state is clean. Kept because `addCategory` (`:57`), `addSpace` (`:51`), and `addRecurrence` (`:52-55`) all share the shape, making it a live trap for the next caller.
**Fix:** build the payload once into a local and pass the same object to `addDoc` and the mapper.

**F25 — Dead code: an unused validation module plus nine unreferenced exports and two orphan locale files.** Confidence: High. *`updateRecurrence` added.*
`src/utils/validationUtils.ts` (whole file, 117 lines — duplicates the inline validation actually used at `transactionService.ts:32-49`), `transactionService.ts:213` (`hasLinkedTransactions`), `dateUtils.ts:142,177,195` (`getYearlyEquivalent`, `countRetroactiveOccurrences`, `generateRetroactiveDates`), `balanceUtils.ts:59` (`filterTransactions` — tests only; the app filters server-side), `recurrenceService.ts:89` (`updateRecurrence` — no UI edits a recurrence), `historyService.ts:15` (see F3), `storageService.ts:57` (see F8), `src/locales/{en,ar}/translation_old.json` (tracked, imported by nothing), orphan `landing.howTo.{1..4}.color` keys (colors hardcoded at `LandingPage.tsx:329-347`).
**Fix:** delete, or promote `validationUtils` to the single validation source and remove the inline duplicates.

**F26 — Duplicated implementations: two near-identical service/context pairs, three re-implementations of the confirm dialog, and duplicated upload constants.** Confidence: High. *Widened — third dialog copy added, see D4.*
- `spaceService.ts` ↔ `categoryService.ts` — same `hasLinkedDocuments` helper, same CRUD shape, same subscribe body; likewise `SpaceContext.tsx` ↔ `CategoryContext.tsx`.
- `CategoriesPage.tsx:43` and `SpacesPage.tsx:18` declare local `ConfirmDialog` components, and `RecurrencesPage.tsx:301-329` inlines the same overlay markup anonymously with its own `confirmDelete` state (`:149`) — three copies, while `src/components/ui/ConfirmDialog.tsx` exists and is used correctly by `SubscriptionsPage.tsx:25,431`.
- `ALLOWED_TYPES` / 5 MB limit declared twice (`storageService.ts:10-11`, `FileUpload.tsx:11-12`).
- A third currency-symbol table at `BalanceCard.tsx:7-26` lists 18 currencies, 12 of which the app does not support, alongside `CURRENCIES` in `currencies.ts:14-21`.
**Fix:** a generic `createOwnedCollectionService(collection, mapper)` factory; delete all three dialog copies in favour of the shared component; single-source the upload constants and the currency symbols.

**F27 — Context values are recreated on every render, forcing all consumers to re-render.** Confidence: High. *Unchanged.*
`src/contexts/TransactionContext.tsx:185-205`, `RecurrenceContext.tsx:101-110`, `SpaceContext.tsx:94-101`
Fresh object literal per render across five nested providers, including a `pagination` sub-object with a new `setPageSize` closure each time. `RecurrenceContext` also defines all four mutators as plain functions in the component body (`:75-97`).
**Fix:** `useMemo` the value, `useCallback` the handlers.

**F28 — No catch-all route: an unknown URL renders the shell with an empty content area.** Confidence: High. *Unchanged.*
`src/App.jsx:108-226` — no `path="*"` in the inner `<Routes>`, so `/typo` mounts `Layout` and all providers and renders nothing.
**Fix:** add a final `<Route path="*" element={<NotFoundPage />} />`.

**F29 — All 18 pages eagerly imported; no route-level code splitting.** Confidence: High. *Unchanged.*
`src/App.jsx:16-32` — 17 static imports; no `React.lazy`/`Suspense` anywhere. A logged-out visitor to the landing page downloads the entire authenticated app plus `recharts` and `framer-motion`.
**Fix:** lazy-load authenticated routes behind a `Suspense` fallback.

**F30 — `localStorage` access is unguarded, white-screening the app at boot in blocked-storage contexts.** Confidence: Medium. *Unchanged; independently confirmed by Gemini.*
`src/contexts/ThemeContext.tsx:26,37`, `src/i18n.js:43,47,51`
`localStorage` throws rather than returning `null` when storage is denied. The theme read sits in a `useState` initializer with no `try`, and `i18n.js:47` runs at module scope before React mounts. With no error boundary (F21) the result is a blank page.
**Fix:** a `safeStorage` helper wrapping reads and writes in `try/catch`.

**F31 — `updateSpace` accepts a blank name; the sibling `updateCategory` rejects it.** Confidence: High. *Unchanged.*
`src/services/spaceService.ts:63` vs `src/services/categoryService.ts:65-66`
`addSpace` requires a non-empty name (`:39`) but the update path does not, so a space can be renamed to `""` and renders as an invisible entry in every selector. A realised instance of the F26 divergence.
**Fix:** add the guard — ideally once, via the shared factory.

**F32 — `reactivateRecurrence` re-anchors the schedule to today, discarding cycle alignment.** Confidence: High. *Unchanged.*
`src/services/recurrenceService.ts:73` — computes from `new Date()` rather than the stored `startDate`/`nextDate` anchor, so a rent recurrence anchored to the 1st moves to whatever day resume was clicked. A long pause also silently shortens the effective run against `endDate`.
**Fix:** advance from the stored anchor until the result is in the future, preserving day-of-cycle.

**F33 — Entry point and root component are untyped JS in an otherwise fully typed codebase.** Confidence: High. *Unchanged.*
`src/App.jsx`, `src/main.jsx` — the only `.jsx` files under `src/`. The three route guards take untyped `children`, and `document.getElementById("root")` is dereferenced without a null check (`main.jsx:8`), which TS would flag. ESLint also applies a weaker rule set to `**/*.{js,jsx}` (`eslint.config.js:14-36`).
**Fix:** rename to `.tsx`/`.ts` and type the guard props.

**F34 — `_existingAttachmentUrl` is underscore-prefixed as if unused but is read on the submit path.** Confidence: High. *Unchanged.*
`src/pages/TransactionFormPage.tsx:60,139`
**Fix:** rename to `existingAttachmentUrl`.

**F35 — Modals are not keyboard-accessible: no Escape, no focus trap, no dialog semantics.** Confidence: High. *Widened to all three inline modals — see D4.*
`src/components/finance/RecurrenceForm.tsx:115-116`, `src/pages/RecurrencesPage.tsx:301-302`, plus the local dialogs at `CategoriesPage.tsx:43` and `SpacesPage.tsx:18`
Plain `fixed inset-0` divs with no `role="dialog"`, `aria-modal`, `aria-labelledby`, `onKeyDown`, focus management, or backdrop-click close. Background content stays focusable and scrollable.
**Fix:** one shared modal primitive (or `<dialog>`) providing role, labelling, Escape, backdrop click, and focus trap; apply to all sites, resolving F26's dialog duplication at the same time.

**F36 — `SettingsPage` has a `loading` flag with a single clearing path guarded by a condition that can be false.** Severity Low, Confidence Low. *Downgraded, reachability corrected — see D8.*
`src/pages/SettingsPage.tsx:29-48`
`setLoading(false)` is reached only inside `if (user)`. **Reachability: none through current routing** — `ProtectedRoute` returns `<Navigate>` in the same render pass when `user` goes null (`App.jsx:54`), so the page unmounts before a spinner could paint. Retained as a robustness nit because the code is wrong on its own terms and becomes live if the guard is ever relaxed.
**Fix:** add `else { setLoading(false); }`.

**F42 — `Input` and `Select` render labels that are never associated with their control.** Confidence: High. *New — found during Phase 2 verification reads.*
`src/components/core/Input.tsx:12,16`, `src/components/core/Select.tsx:11,15`
Both components wire `<label htmlFor={id}>` to `<input id={id}>`, but `id` is optional and **no caller passes it** — all 11 usage sites across `src/pages/` and `src/components/` pass `label` and `name` only. Both attributes resolve to `undefined`, so every label in every form built on these primitives is decorative: clicking it does not focus the field, and screen readers announce the input unlabelled.
**Fix:** default `id` to `name`, or generate one with `useId()` when neither is supplied.

**F43 — `TransactionDetailPage` renders a blank page for a missing or deleted transaction.** Confidence: High. *New — found during Phase 2 verification reads.*
`src/pages/TransactionDetailPage.tsx:41`
`getTransaction` resolves `null` for a nonexistent id (`transactionService.ts:157`); the page stores it, clears `loading`, and hits `if (!transaction) return null;` — chrome with an empty content area, no message, no redirect. `TransactionFormPage` handles the same case correctly by navigating away (`:73-76`).
**Fix:** render a not-found state or redirect to `/transactions`, matching the form page.

**F44 — Resuming a paused subscription silently discards the paused billing periods.** Confidence: High. *New — found during Phase 2 verification reads.*
`src/pages/SubscriptionsPage.tsx:265-277`, `src/contexts/SubscriptionContext.tsx:89-95`
`handleToggleStatus` flips `status` back to `"active"` without touching `renewalDate`. On the next snapshot the subscription re-enters the `sub.status === "active"` branch and `advanceRenewalDate` rolls the now-stale date forward through every period that elapsed while paused, recording nothing (F3). Pausing and resuming a subscription therefore erases its history for that span rather than suspending it.
**Fix:** re-anchor `renewalDate` on resume, as `reactivateRecurrence` attempts to do for recurrences — and decide deliberately whether paused periods should be billed or skipped.

**F38 — The scheduled processor walks every user document sequentially with one query each.** Confidence: High. *Unchanged.*
`functions/recurrenceProcessor.js:18-30` — `listDocuments()` over all users, then one `recurrences` query per user in a sequential loop, then one Firestore transaction per match, also sequential. O(users) with no batching or pagination against the default timeout. Fine at current scale; it is the shape that fails first as the user count grows.
**Fix:** a collection-group query on `recurrences` with the same predicates, processed in bounded-concurrency batches.

---

## Explicitly considered and NOT reported

Unchanged from `01-findings.md`, and each independently endorsed by Gemini as correctly filtered:

- **Firebase Web API key in `.env` / bundle** — public by design; `.env` is gitignored and untracked; CI injects from secrets. Access control is the rules layer (F9, F18).
- **`FilterBar` `dateRange` object identity causing a resubscribe loop** — `filters` changes only on user interaction, so the dependency array at `TransactionContext.tsx:132-138` is stable across unrelated re-renders.
- **`landing.howTo.N.color` missing from the Arabic locale** — the values are Tailwind utility classes hardcoded at `LandingPage.tsx:329-347` and never resolved through `t()`; the English keys are orphan data, folded into F25.
- **Locale key parity** — measured at 396 EN vs 402 AR keys; the entire delta is Arabic plural suffixes plus the orphan color keys. Translation coverage is complete.

---

## Severity distribution

| Severity | Count | IDs |
|---|---|---|
| Critical | 1 | F1 |
| High | 5 | F2, F3, F4b, F5, F19 |
| Medium | 22 | F4a, F6, F7, F8, F9, F10, F11, F12, F13, F14, F15, F16, F17, F18, F20, F21, F22, F23, F39, F40, F41, F45 |
| Low | 17 | F24, F25, F26, F27, F28, F29, F30, F31, F32, F33, F34, F35, F36, F38, F42, F43, F44 |

*Total: 1 + 5 + 22 + 17 = 45. Phase 1 had 38 IDs (F1-F38); F37 was folded into F13 (-1), F4 was split into F4a/F4b (+1), F39/F40 were added from the debate (+2), F41-F44 were added from my own Phase 2 re-reads (+4), and F45 was added in Phase 4 (+1).*
