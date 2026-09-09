# SubTracker — Enhancement Plan (revised after Phase 4 debate)

Derived from `03-findings-final.md` (45 findings). Revisions and their justification: `05-debate-plan.md`.
Planning only — nothing implemented.

**Effort:** S ≤ half a day · M 1–3 days · L 4+ days. **Risk** = chance of breaking working behaviour.

Every finding is assigned to a work item or listed under **Out of scope** with a reason.

> **Changed from the first draft (all from the Phase 4 debate):** W14 folded into W5 (same edit region). W6 split into W6a/W6b. W6b's on-write aggregate documents struck — not a well-posed problem. W4 re-scoped from a client-side to a server-side payment writer. W2 gains an explicit ESM/CommonJS decision and a legacy-document migration. A mandatory timestamp backfill added and sequenced ahead of both the writer change and the rules tightening. F45 added.

---

## The shape of the problem

1. **A client migration left the backend behind, and nothing could detect it.** The recurrence feature is dead (F1) because the TypeScript migration changed the document schema and never updated the Cloud Function — which was *correct when written* (git `a3c0165` vs `da9f93f`). It stayed undetected because CI never deploys or lints `functions/` (F14) and no test crosses the boundary (F5). Documents from before that migration are still being misread today (F45). Renaming fields without fixing the pipeline re-arms the same trap.
2. **The app disagrees with itself about money.** `balanceUtils` forbids summing currencies, `SubscriptionsPage` obeys, `DashboardPage` does not (F4b); the currency setting is read by nothing (F7). One decision, not three bugs — see **D-2**.
3. **Write paths without their read or cleanup halves.** Payments never written (F3); attachments never displayed (F41) or deleted (F8); transactions not deletable at all (F8).
4. **Financial records are written by whichever client happens to be open.** The renewal advance runs in an `onSnapshot` callback guarded by per-session in-memory state (`SubscriptionContext.tsx:71`). Nothing is recorded unless someone opens the app. This is a placement problem, and W4 now addresses it as one.

---

## Work items

### W1 — Make backend configuration deployable and verified
**Goal.** Rules, indexes, and functions all have an automated path to production and are covered by lint. Precondition for trusting any backend fix.
**Resolves.** F14, F15, F6
**Files.** `.github/workflows/deploy.yml`, `eslint.config.js`, `functions/package.json`, `firestore.indexes.json`
**Approach.** Bump `functions` to Node 22; verify `firebase-functions` v5 still builds, upgrade to v6 if not. Remove `functions` from `globalIgnores` and fix the lint fallout. **Indexes, in this order:** export the live index set, *merge* it into `firestore.indexes.json`, then add new declarations — `firebase deploy --only firestore:indexes` is a declarative override, so anything absent from the file is deleted. The same override semantics apply to `fieldOverrides` (single-field exemptions), which the file currently declares as an empty array (`firestore.indexes.json:3`) — console-configured exemptions are equally at risk. Add a deploy job gated on `production` with a service-account secret.
**Effort.** M
**Risk.** **High, concentrated in the index deploy.** Land the index deploy as its own commit, separate from rules and functions.

---

### W2 — Rebuild the recurrence engine on one schema and one date module
**Goal.** Recurring transactions actually generate. One definition of "advance a date by a pattern", shared by both runtimes. Legacy documents are either migrated or visibly flagged.
**Resolves.** F1, F13, F20, F32, F38, F45, and the `updateRecurrence` entry in F25
**Files.** `functions/*`, `src/services/recurrenceService.ts`, `src/utils/dateUtils.ts`, `src/models/recurrence.ts`, `src/models/mappers.ts`, `src/contexts/RecurrenceContext.tsx`, new shared date module
**Approach.**
1. **Decide the module system first — this is the item's first task, not an implementation detail.** Root `package.json:6` is `"type": "module"`; `functions/` has no `type` field and is CommonJS (`index.js:1` uses `require`). Preferred: convert `functions/` to ESM alongside W1's Node 22 bump, which makes W2 depend on W1. Alternatives are authoring the shared module in CJS for Vite to consume, or a dual-emit build step.
2. Extract one UTC-based date module — the function's clamping semantics (`dateLogic.js:6-15`) are the correct ones — imported by both sides; delete `dateLogic.js` and the duplicate branch in `calculateNextExecutionDate`. Decide explicitly whether `custom` is a recurrence pattern or only a billing cycle.
3. Rewrite the processor's query and field reads against the canonical client schema. Add a bounded backlog loop (F20) so a lapsed recurrence catches up in one run. Replace the per-user walk with a collection-group query (F38).
4. **Legacy documents (F45), gated on a count.** Run a one-off count of recurrences carrying `isActive`/`nextExecutionDate`. If non-zero, backfill to the canonical schema. Regardless of the count, change `toRecurrence` so an unmapped legacy document surfaces as such instead of defaulting to `status: "active"` with `nextDate: ""` (`mappers.ts:67-76,182-183`) — silently plausible output is what let this hide.
5. Fix `reactivateRecurrence` to advance from the stored anchor (F32). Delete the false comment at `RecurrenceContext.tsx:64-65`. Delete unused `updateRecurrence` or give it a UI — not both states.
**Effort.** L
**Risk.** Medium-High *(raised: the module-system change and the backfill both carry more than the feature repair itself, which has no working behaviour to regress)*.
**Depends on.** W1 (Node 22 for the ESM route; deploy path to verify anything).

---

### W3 — Settle the currency policy and apply it everywhere
**Goal.** One answer to "may different currencies be added together", applied consistently; estimates labelled as estimates.
**Resolves.** F4b, F4a, and the `preferredCurrency` half of F7
**Files.** `src/utils/currencies.ts`, `src/utils/balanceUtils.ts`, `src/pages/{Dashboard,Subscriptions,Settings}Page.tsx`, new settings hook
**Approach.** Make **D-2** first, then implement in one pass so no page is left on the old policy. Either way, converted figures get an explicit "approx." affordance and a rate date — `formatCurrency` currently renders estimates indistinguishably from exact amounts. Replace the hardcoded `displayCurrency = "EGP"` (`DashboardPage.tsx:119`) with the user's `preferredCurrency` via a settings hook.
**Effort.** M
**Risk.** Medium. Changes numbers users may have anchored on; ship with a short in-app note.
**Blocked by.** D-2.

---

### W4 — Move subscription advancement server-side and record payments
**Goal.** Advancing a renewal leaves a record, written once, by the server, whether or not anyone opens the app.
**Resolves.** F3, F17, F19, F23, F40, F44, and the `reminderDays` half of F7
**Files.** `functions/` (new scheduled handler), `src/contexts/SubscriptionContext.tsx`, `src/services/historyService.ts`, `src/pages/{Dashboard,History,Subscriptions}Page.tsx`, `src/components/layout/Header.tsx`
**Approach.** *Re-scoped: the original draft kept the writer on the client.* The advance loop currently runs inside an `onSnapshot` callback (`SubscriptionContext.tsx:83,89-104`) guarded by `renewalCheckedRef`, which is per-session memory — it de-duplicates within one tab and not across tabs, devices, or reloads, and records nothing at all for a user who does not log in. Move advancement into the scheduled function next to the recurrence processor, which already has the right shape: a daily server-side pass with a Firestore transaction and a re-read guard (`recurrenceProcessor.js:32-38`). Write a `Payment` per skipped period, keyed on `subscriptionId + paidDate`. Reduce the client to reading. Bound the loop and clamp `customCycleDays < 1` (F19). Delete the twelve-fabricated-months branch and key trend buckets by `yyyy-MM` (**F17 must land in the same change as F3** — it is invisible until payments exist, and would otherwise ship as a fresh visible bug). Re-anchor `renewalDate` on resume (F44). Paginate `subscribeToPayments` and subscribe from `HistoryPage` rather than eagerly in the provider (F40). Read `reminderDays` in `Header` instead of the hardcoded `7`. While the client is being reduced to reading, close F23: expose `add`/`update`/`delete` mutators on `SubscriptionContext` with the same `if (!user) throw` guard the other four contexts use, and remove the direct service imports from `SubscriptionsPage.tsx:7-10` and `SubscriptionFormPage.tsx:112-114`.

**Cheaper alternative, weighed and not chosen.** The server-side move is my own escalation beyond Gemini's objection, which was only about redundant writes (P9). A smaller fix exists: keep the writer on the client but wrap the advance in a Firestore transaction that re-reads `renewalDate` and writes only if it is still past-due. That dedupes across devices, is perhaps **M** instead of L, and needs neither W1 nor W2. It does *not* fix the deeper problem — nothing is recorded for a user who does not open the app, and a returning user still generates a burst. I recommend the server-side move, but the trade is real and the call is yours.
**Effort.** **L** *(raised — this is now backend work, not a context edit)*
**Risk.** Medium-High. Writes financial records; idempotency is the whole game. Needs its test before it goes near real data.
**Depends on.** W1 (deploy), W2 (shared date module and the ESM decision).

---

### W5 — Enforce data shape at the rules layer, and standardise timestamps
**Goal.** Constraints the client asserts hold when the client is bypassed. One timestamp representation.
**Resolves.** F9, F18, F22, F16, and the service-error half of F12
**Files.** `firestore.rules`, `storage.rules`, all five services, `src/models/mappers.ts`, possibly a new callable function
**Approach.** *W14 was folded in here: both items rewrite the same `updateDoc`/`addDoc` payload literals (`subscriptionService.ts:48-51`, `recurrenceService.ts:95-98`), so they are one pass.*
- **Timestamps (F16), including `updatedAt` — not just `createdAt`.** `asISOString` is applied to both fields in every mapper (`mappers.ts:113-114,135-136`), so a partial fix leaves the identical bug on the other field. Standardise on `serverTimestamp()`; teach `asISOString` to convert a `Timestamp` via `toDate().toISOString()` rather than substituting the read-time clock.
- **Mandatory backfill, before the writer change.** Firestore orders by type before value (Timestamp < String), so mixed types partition rather than interleave. Four primary list views order on `createdAt`: `subscriptionService.ts:78`, `recurrenceService.ts:106`, `categoryService.ts:97`, `spaceService.ts:89`. Without a backfill, every pre-existing document sorts as one block above (or below) every new one. Backfill all string `createdAt`/`updatedAt` values to `Timestamp` **first**, so no window exists with both types live.
- Add size and content-type predicates to the storage write rule (F9). Add per-collection field allowlists and type predicates to the Firestore rules (F18). Replace the `as Record<string, unknown>` spreads with explicit field assignment as `updateTransaction` already does — the cast is what defeats the types.
- Move the space/category delete integrity check into a callable function that checks and deletes atomically (F22), or accept soft-delete and render dangling references safely.
- Have services throw typed error codes rather than English sentences, so W10 can translate at the boundary.
**Effort.** M-L *(raised by the absorbed timestamp work and its backfill)*
**Risk.** **High.** Two distinct hazards: over-strict rules lock users out of their own data, and the type-predicate ordering below.
**Hard ordering constraint.** This is a static GitHub Pages site with no service worker and no version gate, so an open tab can hold old JS indefinitely. Sequence: **backfill → ship the client that writes Timestamps → wait out a client-refresh window → only then tighten rules on the timestamp fields.** Type predicates on other fields carry no such constraint and can ship immediately. Write rules-unit tests against the emulator before deploying.
**Depends on.** W1.

---

### W6a — Fix the transaction list: pagination and filter consistency
**Goal.** "Next" pages. The balance card and the filters agree.
**Resolves.** F2, F11, F39
**Files.** `src/contexts/TransactionContext.tsx`, `src/components/finance/FilterBar.tsx`
**Approach.** Capture `rawDocs` in the subscription callback and maintain the cursor stack (F2). Debounce the tag input and add `tag` to `balanceFilters` and its dependency array — **F11 and F39 must land together**: adding `tag` without the debounce turns every keystroke into a full-collection re-read.
**Effort.** S-M
**Risk.** Low.
**Depends on.** Nothing. *(Split out from the original W6 precisely so it is not held up by the backend track.)*

---

### W6b — Stop streaming the whole collection to compute balances
**Goal.** Balances cost a bounded read instead of an open listener over every transaction.
**Resolves.** F10
**Files.** `src/services/transactionService.ts`, `src/contexts/TransactionContext.tsx`
**Approach.** *Revised: the on-write aggregate-document option is struck.* It cannot work — `balanceFilters` carries a user-selected `dateRange` (`TransactionContext.tsx:116-121`) and, after W6a, a `tag`, so the filter space is an arbitrary conjunction over a free date interval. Pre-aggregating that is not a bigger problem, it is not a well-posed one. Use Firestore's `getAggregateFromServer` with `sum()`, grouped per currency, re-run when filters change. **Trade-off to accept up front:** aggregation queries are one-shot reads, not live listeners, so balances stop updating in real time on concurrent writes and need an explicit refresh after a mutation.
**Effort.** M
**Risk.** Medium — a visible behaviour change (balances no longer live-update).
**Depends on.** W6a (filter shape), and coordinate with W5 (same write paths).

---

### W7 — Give attachments their missing halves
**Goal.** An uploaded file can be viewed and removed. Transactions can be deleted.
**Resolves.** F8, F41, and the upload-constant duplication in F26
**Files.** `src/pages/TransactionDetailPage.tsx`, `src/pages/TransactionFormPage.tsx`, `src/services/{transaction,storage}Service.ts`, `src/components/finance/FileUpload.tsx`
**Approach.** Render `attachmentUrl` on the detail page — thumbnail for images, download link for PDFs, keyed off `attachmentMeta.type` (F41). Call `deleteAttachment` on remove and on replace. Add `deleteTransaction`, clearing the attachment before the document, behind a confirm dialog. Single-source `ALLOWED_TYPES` and the size limit.
**Effort.** M
**Risk.** Low, except `deleteTransaction` — new destructive capability that must not ship without the confirm dialog.
**Depends on.** W11 (the shared dialog).

---

### W8 — Make the app survive its own errors
**Goal.** No blank screens. Every failure mode renders something.
**Resolves.** F21, F30, F28, F43, F36, F33
**Files.** `src/main.jsx` → `.tsx`, `src/App.jsx` → `.tsx`, `src/contexts/ThemeContext.tsx`, `src/i18n.js`, `src/pages/{TransactionDetail,Settings}Page.tsx`, new `ErrorBoundary` and `safeStorage`
**Approach.** Root error boundary with a recoverable fallback, plus a per-route boundary in `Layout`. A `safeStorage` helper wrapping every `localStorage` access in `try/catch` — **fix F21 first**, after which F30 degrades from a white screen to a lost preference. A `*` route with a real 404 (F28). A not-found state on `TransactionDetailPage` (F43). The missing `else` in `SettingsPage` (F36). Convert `App.jsx`/`main.jsx` to TypeScript and type the route guards (F33).
**Effort.** M
**Risk.** Low; almost entirely additive.

---

### W9 — Collapse the duplication and delete the dead code
**Goal.** One implementation per concept. Nothing in the tree that nothing calls.
**Resolves.** F25, F26, F27, F31, F24, F34
**Files.** `src/services/{space,category}Service.ts`, `src/contexts/{Space,Category}Context.tsx`, `src/pages/{Categories,Spaces,Recurrences}Page.tsx`, `src/utils/validationUtils.ts`, `src/components/finance/BalanceCard.tsx`, `src/locales/*/translation_old.json`
**Approach.** A `createOwnedCollectionService(collection, mapper, validators)` factory replacing the two copy-pasted services, which closes the `updateSpace` blank-name divergence (F31) by construction. Delete all three inline confirm dialogs for the shared component (coordinate with W11). `useMemo`/`useCallback` the context values (F27). Build each `add*` payload once and pass the same object to `addDoc` and the mapper (F24). Rename `_existingAttachmentUrl` (F34). Delete `validationUtils.ts`, the eight other unreferenced exports, both `translation_old.json` files, the orphan locale colour keys, and the redundant currency-symbol table in `BalanceCard.tsx:7-26`.
**Effort.** M
**Risk.** Low-Medium. Mechanical, but rewrites files W2, W5, W6a, and W7 all touch — **sequence it last**.
**Caveat.** Before deleting `validationUtils.ts`, confirm the inline validation stays canonical; it is a duplicate of live code, not of dead code.

---

### W10 — Finish the internationalisation
**Goal.** No English leaks into an Arabic session.
**Resolves.** F12
**Files.** all five contexts, `src/pages/TransactionFormPage.tsx`, `src/services/*.ts`, both locale files, `src/components/finance/BalanceCard.tsx`
**Approach.** Route context toasts through `i18n.t`. Translate `TransactionFormPage.validate`, matching `RecurrenceForm`. Map W5's typed service error codes to translated strings at the presentation boundary. Fix `BalanceCard`'s hardcoded `"en-US"` number formatting. Add new keys to **both** locales in the same commit.
**Effort.** S
**Risk.** Low.
**Depends on.** W5 (error-code contract).

---

### W11 — Accessibility: one real modal primitive, and labels that work
**Goal.** Forms and dialogs usable by keyboard and screen reader.
**Resolves.** F35, F42
**Files.** new modal primitive, `src/components/ui/ConfirmDialog.tsx`, `src/components/finance/RecurrenceForm.tsx`, `src/pages/{Recurrences,Categories,Spaces}Page.tsx`, `src/components/core/{Input,Select}.tsx`
**Approach.** One modal primitive (or `<dialog>`) providing `role="dialog"`, `aria-modal`, `aria-labelledby`, Escape, backdrop click, and a focus trap; migrate all four modal sites, which also resolves W9's dialog duplication. Default `id` to `name` or generate with `useId()` in `Input`/`Select` so all 11 usage sites get working labels.
**Effort.** S-M
**Risk.** Low.
**Feeds.** W7 and W9.

---

### W12 — Test foundation, threaded through the work above
**Goal.** The class of bug that produced F1, F2, F3, and F45 gets caught next time.
**Resolves.** F5
**Approach.** **A constraint on W2, W4, and W6a, not a phase.** Each ships with the test that would have caught its finding:
- with W2 — a contract test running the processor's query shape against a document produced by `addRecurrence` (would have caught F1), a fixture of the pre-migration shape (F45), and shared-date-module cases at month ends and leap days;
- with W4 — idempotency tests for the payment writer and a bounded-loop test for `customCycleDays: 0` (F19);
- with W6a — a `TransactionContext` pagination test over a fake snapshot stream (would have caught F2);
- standalone — mapper round-trips, including the `Timestamp` case behind F16 and the legacy case behind F45.
`@testing-library/*` is installed and `src/test/setup.ts` configured; nothing new to set up.
**Effort.** M, distributed. **Risk.** None.

---

### W13 — Split the bundle
**Goal.** A logged-out visitor stops downloading the authenticated app.
**Resolves.** F29
**Files.** `src/App.tsx`
**Approach.** `React.lazy` the authenticated routes behind `Suspense`; keep `LandingPage`, `LoginPage`, `SignupPage` eager.
**Effort.** S **Risk.** Low.
**Depends on.** W8 — both rewrite `App.jsx`, and W8 converts it to TypeScript first.

*(W14 no longer exists as a separate item — folded into W5.)*

---

## Sequencing

```
W1  Deployability ─┬──> W2  Recurrence engine ──> W4  Server-side payments
  (index deploy =  │      (ESM decision, F45 backfill)
   the risky step) │
                   └──> W5  Rules + timestamps ──┬──> W10 i18n (needs error codes)
                          (backfill FIRST,       │
                           then client,          └──> W6b Balance aggregation
                           then tighten rules)         (also needs W6a)

Truly independent — start immediately, in parallel with the above:
  W6a Pagination & filter consistency
  W11 Accessibility ──> feeds W7 and W9
  W8  Resilience ──> W13 Bundle split        (serial pair: both rewrite App.jsx)
  W7  Attachments                            (after W11)

Decision-gated:
  D-2 ──> W3 Currency policy ──> informs W4's dashboard chart

Last:
  W9  Dedup & dead code   (after W2, W5, W6a, W7 — it rewrites their files)

W12 Tests: not a phase. Ships inside W2, W4, W6a.
```

**First.** W1 — every backend fix is unverifiable until rules, indexes, and functions can deploy, and it holds the one genuinely dangerous step.
**Last.** W9 — it rewrites files four other items touch.
**Genuinely parallel.** W6a, W11, and the W8→W13 pair touch files disjoint from the backend track. W7 needs W11's dialog first.

**Do not split these across releases:**
- **F3 + F17** (W4) — fixing the fabricated chart exposes the month-collision bug.
- **F11 + F39** (W6a) — `tag` in the balance filters without the debounce means a full-collection read per keystroke.
- **F21 + F30** (W8) — the storage throw is only a white screen because there is no boundary.
- **F1 + F14** (W2/W1) — fixing the schema without the deploy pipeline re-arms the drift.
- **Backfill + writer + rules** (W5) — strictly ordered; a gap in either direction breaks live clients.

---

## Quick wins

Landable in a day, no dependencies, mostly one PR.

| Finding | Change | Why now |
|---|---|---|
| F42 | Default `id` to `name` / `useId()` in `Input`, `Select` | Two lines; fixes label association in all 11 form fields |
| F21 | Root error boundary | Turns unhandled throws from a blank page into a message; defuses F30 |
| F28 | `*` route with a 404 page | One route; removes a chrome-only dead end |
| F43 | Not-found state on `TransactionDetailPage` | One branch; the form page already does it correctly |
| F34 | Rename `_existingAttachmentUrl` | The underscore actively misleads |
| F36 | `else { setLoading(false) }` in `SettingsPage` | One line |
| F31 | Blank-name guard in `updateSpace` | Copy the guard `updateCategory` already has |
| F25 | Delete `translation_old.json` ×2 and the unreferenced exports | Pure deletion, no behaviour change |
| F30 | `safeStorage` wrapper | Small helper, two call sites |

**Not** quick wins despite appearances: F19 (one-line clamp, but belongs with W4's loop rework and its test), F27 (`useMemo` looks trivial but changes render behaviour across five nested providers), and F16 (looks like a one-line mapper fix; is actually a mandatory data migration — see W5).

---

## Explicitly out of scope

**F38 beyond the collection-group query.** Batched concurrency and pagination for the processor stay out; the sequential loop is not a problem at current scale. Revisit as the run approaches its timeout.

**A live FX rate API.** F4a is closed by labelling estimates and surfacing a rate date. Both reviewers independently agreed static rates are a reasonable compromise here; the defect was presenting estimates as exact.

**Server-authoritative writes for *all* collections.** W4 moves subscription advancement server-side because it writes financial records unprompted; W5 moves the delete integrity check behind a callable. Moving *every* write behind Cloud Functions is the stronger architecture and the right long-term direction, but it is a rewrite of every service and context — disproportionate to findings whose blast radius is the user's own data.

**`subtracker-design-system/` and `design_system/`.** Generated exports, already excluded from lint and build. Not application code.

**Rewriting `LandingPage.tsx` (572 lines).** Long and repetitive, but no findings against it beyond the orphan locale keys in F25. Length alone does not justify the churn.

**Offline support, PWA install, renewal push notifications.** Adjacent product features implied by `reminderDays` and the "Coming Soon" page. Not defects.

---

## Open decisions

**D-1 — How many pre-migration recurrence documents exist?** *(No longer "whether" — settled in Phase 4.)*
Git history proves the old shape shipped: commit `a3c0165` wrote `isActive`, `nextExecutionDate`, and capitalised patterns; the TypeScript migration (`da9f93f`, `2491940`) changed the client and left the function behind. So legacy documents **can** exist and are being misread today (F45). What I cannot determine from the repo is how many. The count decides whether W2's backfill is a five-minute script or a real migration, and it is a one-off query someone with console access can run in a minute. **Needed before W2 is estimated with confidence.**

**D-2 — May amounts in different currencies be added together?**
Blocks W3, shapes W4's dashboard. Two coherent answers:
- **(a) No.** Honour the contract `balanceUtils.ts:21` already states. Per-currency cards on the dashboard, matching `SubscriptionsPage`. `convertCurrency` and the static rate table are deleted. Simpler and honest — but a user with four currencies gets four numbers and no headline total.
- **(b) Yes, as a labelled estimate.** Keep conversion, retarget it at `preferredCurrency`, label every converted figure as approximate with a rate date, and bring `balanceUtils`' comment and `SubscriptionsPage` into line. Better UX; the app then owns an accuracy claim it must maintain. *(This option does not require an FX API — Gemini's critique argued against a version of (b) that was never proposed.)*

Both reviewers independently recommend **(a)**. I agree: it removes a whole class of correctness problem for a personal-tracking app and matches what the code already documents as the rule. It remains a product call about what users want to see, so it is yours.
