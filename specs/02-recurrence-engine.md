# Spec 02 — Recurrence engine: one schema, one date module (W2)

> **You cannot run shell commands in this environment.** Do not attempt `npm`, `git`, `firebase`, `tsc`, or any test runner — the attempt is auto-denied and aborts your run with no output. Write files only. The orchestrator runs all gates and reports results back to you.

## Context

**Resolves:** F1 (Critical — the scheduled function can never fire), F13 (two divergent date-advance implementations), F20 (one interval per day catch-up), F32 (`reactivateRecurrence` re-anchors to today), F38 (per-user sequential walk), F45 (pre-migration documents misread today), and the dead `updateRecurrence` export from F25.

SubTracker lets a user define a **recurrence** — a rule that generates a transaction every N weeks/months/years. A daily Firebase Cloud Function is supposed to find due recurrences and create the transactions. **It has never worked**, because the client and the function disagree on the document schema in three independent ways.

This is not a function that was always wrong. Git history shows it was correct when written: commit `a3c0165` shipped a client writing `isActive` / `nextExecutionDate` / capitalised patterns, and the function matched. A later TypeScript migration (`da9f93f`, `2491940`) changed the client to `status` / `nextDate` / lowercase patterns and left the function behind.

Two consequences you must handle:
- **No recurrence has ever been processed** since that migration.
- **Documents written by the old client may still exist**, and today's mapper silently coerces them into plausible-looking-but-wrong objects.

### Current behaviour, precisely

The function queries `where("isActive","==",true)` — a field no current code writes — so it matches **zero** documents for every user, every day. It logs "Daily recurrence processing complete." and exits having done nothing.

## Scope

**Modify:**
- `functions/recurrenceProcessor.js`
- `functions/package.json` (module system — see Requirement 1)
- `functions/index.js` (only if the module system changes)
- `functions/dateLogic.test.js` (only if the module system changes)
- `src/services/recurrenceService.ts`
- `src/utils/dateUtils.ts`
- `src/models/recurrence.ts`
- `src/models/mappers.ts`
- `src/contexts/RecurrenceContext.tsx`

**Create:**
- `shared/recurrenceDates.js` (or `.mjs` — see Requirement 1) — the single shared date module
- `shared/recurrenceDates.test.js`
- `scripts/backfill-recurrences.js` — a migration script (written, **not run**)
- `src/models/__tests__/mappers.recurrence.test.ts`
- `functions/recurrenceProcessor.contract.test.js`

**Delete:**
- `functions/dateLogic.js` — replaced by the shared module

**Must NOT be touched:**
- `firestore.rules`, `firestore.indexes.json`, `storage.rules` — specs 01 and 05
- `.github/workflows/deploy.yml` — spec 01
- `src/pages/RecurrencesPage.tsx`, `src/components/finance/RecurrenceForm.tsx` — **except** the one-line `PATTERNS` change in Requirement 8 if you determine it is needed; otherwise leave them alone
- Any transaction, subscription, space, or category file

**Out of scope:** the confirm-dialog duplication in `RecurrencesPage` (spec 12), running the backfill (operator), i18n of new strings (spec 11).

## Existing code

### `functions/recurrenceProcessor.js` — complete
```js
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const { advanceDate } = require("./dateLogic");

initializeApp();
const db = getFirestore();

const processRecurrences = onSchedule("every day 00:00", async () => {
  const today = new Date().toISOString().slice(0, 10);

  const usersSnap = await db.collection("users").listDocuments();

  for (const userDoc of usersSnap) {
    const userId = userDoc.id;
    const recSnap = await db
      .collection("users").doc(userId).collection("recurrences")
      .where("isActive", "==", true)
      .where("nextExecutionDate", "<=", today)
      .get();

    for (const recDoc of recSnap.docs) {
      try {
        await db.runTransaction(async (tx) => {
          const freshSnap = await tx.get(recDoc.ref);
          if (!freshSnap.exists) return;
          const rec = freshSnap.data();
          if (!rec.isActive || rec.nextExecutionDate > today) return;

          const interval = typeof rec.interval === "number" ? rec.interval : 1;
          const nextDate = advanceDate(rec.nextExecutionDate, rec.pattern, interval);

          const txnRef = db
            .collection("users").doc(userId).collection("transactions").doc();
          tx.set(txnRef, {
            type: rec.type,
            spaceId: rec.spaceId,
            categoryId: rec.categoryId,
            amount: rec.amount,
            currency: rec.currency,
            transactionDate: rec.nextExecutionDate,
            recurrenceId: recDoc.id,
            notes: null,
            tags: [],
            attachmentUrl: null,
            attachmentMeta: null,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });

          if (rec.endDate && nextDate > rec.endDate) {
            tx.update(recDoc.ref, { isActive: false, updatedAt: FieldValue.serverTimestamp() });
          } else {
            tx.update(recDoc.ref, { nextExecutionDate: nextDate, updatedAt: FieldValue.serverTimestamp() });
          }
        });
        console.log(`Processed recurrence ${recDoc.id} for user ${userId}.`);
      } catch (err) {
        console.error(`Error processing recurrence ${recDoc.id} for user ${userId}:`, err);
      }
    }
  }

  console.log("Daily recurrence processing complete.");
});

module.exports = { processRecurrences };
```

### `functions/dateLogic.js` — complete (to be replaced)
```js
function addMonthsClamped(d, months) {
  const day = d.getUTCDate();
  const targetMonthIndex = d.getUTCMonth() + months;
  const result = new Date(Date.UTC(d.getUTCFullYear(), targetMonthIndex, 1));
  const daysInTargetMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(day, daysInTargetMonth));
  return result;
}

function advanceDate(dateStr, pattern, interval) {
  const d = new Date(dateStr + "T00:00:00Z");
  switch (pattern) {
    case "Weekly":  d.setUTCDate(d.getUTCDate() + 7 * interval); return d.toISOString().slice(0, 10);
    case "Monthly": return addMonthsClamped(d, interval).toISOString().slice(0, 10);
    case "Yearly":  return addMonthsClamped(d, interval * 12).toISOString().slice(0, 10);
    case "Custom":  d.setUTCDate(d.getUTCDate() + interval); return d.toISOString().slice(0, 10);
    default:        return addMonthsClamped(d, interval).toISOString().slice(0, 10);
  }
}

module.exports = { addMonthsClamped, advanceDate };
```

### `src/services/recurrenceService.ts` — the writer (lines 27–56 and 66–99)
```ts
export const addRecurrence = async (
  userId: string,
  data: RecurrenceInput,
): Promise<Recurrence> => {
  const nextExec = calculateNextExecutionDate(data.startDate, data.pattern, data.interval);
  const nextDate = toDateInputValue(nextExec);
  const docData = {
    type: data.type,
    spaceId: data.spaceId,
    categoryId: data.categoryId,
    amount: Math.round(data.amount * 100) / 100,
    currency: data.currency,
    pattern: data.pattern,
    interval: data.interval ?? 1,
    startDate: data.startDate,
    endDate: data.endDate ?? null,
    nextDate,
    status: data.status ?? "active",
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(colRef(userId), docData);
  return toRecurrence(ref.id, { ...docData, createdAt: new Date().toISOString() });
};

export const reactivateRecurrence = async (
  userId: string, recurrenceId: string, pattern: string, interval: number,
): Promise<void> => {
  const ref = doc(db, "users", userId, "recurrences", recurrenceId);
  const nextExec = calculateNextExecutionDate(new Date(), pattern, interval);
  await updateDoc(ref, {
    status: "active",
    nextDate: toDateInputValue(nextExec),
    updatedAt: serverTimestamp(),
  });
};

export const updateRecurrence = async (
  userId: string, recurrenceId: string, data: RecurrenceUpdate,
): Promise<void> => {
  const ref = doc(db, "users", userId, "recurrences", recurrenceId);
  await updateDoc(ref, { ...(data as Record<string, unknown>), updatedAt: serverTimestamp() });
};
```
`updateRecurrence` has **no callers anywhere in the codebase**.

### `src/utils/dateUtils.ts:154-174` — the client's duplicate implementation
```ts
export const calculateNextExecutionDate = (
  currentDate: Date | DateString,
  pattern: RecurrencePattern | string,
  interval = 1,
): Date => {
  const d = typeof currentDate === "string" ? parseISO(currentDate) : currentDate;
  const normalised = pattern.toLowerCase();
  switch (normalised) {
    case "weekly":  return addDays(d, 7 * interval);
    case "monthly": return addMonths(d, interval);
    case "yearly":  return addYears(d, interval);
    case "daily":   return addDays(d, interval);
    default:        return addMonths(d, interval);
  }
};
```
This uses `date-fns` in **local** time; the function's version is **UTC**. There is no `"custom"` case.

### `src/models/recurrence.ts` — the canonical model
```ts
export type RecurrenceStatus = "active" | "paused";
export type RecurrencePattern = "daily" | "weekly" | "monthly" | "yearly";

export interface Recurrence {
  id: string;
  spaceId: string;
  categoryId: string;
  type: TransactionType;      // "Income" | "Expense"
  amount: number;
  currency: CurrencyCode;
  pattern: RecurrencePattern;
  interval: number;           // >= 1
  startDate: DateString;      // "YYYY-MM-DD"
  endDate: DateString | null;
  nextDate: DateString;
  status: RecurrenceStatus;
  createdAt: ISOString;
}
export type RecurrenceInput = Omit<Recurrence, "id" | "createdAt" | "nextDate">;
export type RecurrenceUpdate = Partial<RecurrenceInput>;
```

### `src/models/mappers.ts` — the coercion helpers that hide legacy documents
```ts
const asString = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

const asRecurrenceStatus = (v: unknown): RecurrenceStatus =>
  v === "active" || v === "paused" ? v : "active";

const asRecurrencePattern = (v: unknown): RecurrencePattern => {
  const allowed: RecurrencePattern[] = ["daily", "weekly", "monthly", "yearly"];
  return allowed.includes(v as RecurrencePattern) ? (v as RecurrencePattern) : "monthly";
};

export function toRecurrence(id: string, data: DocumentData): Recurrence {
  return {
    id,
    spaceId: asString(data["spaceId"]),
    categoryId: asString(data["categoryId"]),
    type: asTransactionType(data["type"]),
    amount: asNumber(data["amount"]),
    currency: asCurrencyCode(data["currency"]),
    pattern: asRecurrencePattern(data["pattern"]),
    interval: asNumber(data["interval"], 1),
    startDate: asString(data["startDate"]) as DateString,
    endDate: asNullableString(data["endDate"]) as DateString | null,
    nextDate: asString(data["nextDate"]) as DateString,
    status: asRecurrenceStatus(data["status"]),
    createdAt: asISOString(data["createdAt"]),
  };
}
```
Feed this a legacy document `{ isActive: true, nextExecutionDate: "2025-03-01", pattern: "Monthly", ... }` and it returns `{ status: "active", nextDate: "", pattern: "monthly", ... }` — plausible and wrong.

### `src/contexts/RecurrenceContext.tsx:64-65` — a comment that is factually false
```tsx
// Note: legacy recurrenceService used isActive boolean; new typed model uses status union.
// The toRecurrence mapper converts both formats correctly.
```
`asRecurrenceStatus` never inspects `isActive`. Delete this comment.

### The old client's shape, for your backfill script (git `a3c0165`)
```js
const docData = {
  type, spaceId, categoryId, amount, currency,
  pattern: data.pattern,              // "Weekly" | "Monthly" | "Yearly" | "Custom"
  interval: data.interval || 1,
  startDate: data.startDate,
  endDate: data.endDate || null,
  nextExecutionDate: toDateInputValue(nextExec),
  isActive: true,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
};
```

## Requirements

1. **Decide and implement the module system first.** The repo root `package.json` has `"type": "module"` (ESM); `functions/` has no `type` field and is CommonJS. A module shared by both must resolve in both. **Convert `functions/` to ESM**: add `"type": "module"` to `functions/package.json`, and rewrite `functions/index.js`, `functions/recurrenceProcessor.js`, and `functions/dateLogic.test.js` to use `import`/`export`. Spec 01 bumps the runtime to Node 22, which supports this. If you conclude ESM conversion is not viable, **stop and report why** rather than silently choosing another option.

2. **Create `shared/recurrenceDates.js`** exporting `addMonthsClamped(date, months)` and `advanceDate(dateStr, pattern, interval)`. Port the **UTC implementation from `functions/dateLogic.js` verbatim** — its clamping is the correct behaviour and must not change. Then:
   - `advanceDate` accepts **lowercase** patterns only: `"daily"`, `"weekly"`, `"monthly"`, `"yearly"`.
   - `"daily"` advances by `interval` days. `"weekly"` by `7 * interval` days. `"monthly"` by `addMonthsClamped(interval)`. `"yearly"` by `addMonthsClamped(interval * 12)`.
   - An unrecognised pattern **throws** `new Error(\`Unknown recurrence pattern: ${pattern}\`)`. It must **not** silently default to monthly — silent defaulting is what hid this bug.
   - `interval` must be an integer `>= 1`; anything else throws.
   - The module has **no dependencies** — no `date-fns`, no Firebase. Plain `Date` arithmetic in UTC.

3. **Delete `functions/dateLogic.js`.** Update `functions/dateLogic.test.js` to import from `shared/recurrenceDates.js`; move it to `shared/recurrenceDates.test.js` and keep every existing assertion that is still valid, translating capitalised pattern names to lowercase. Existing assertions include `advanceDate("2026-01-01", "Weekly", 2) === "2026-01-15"` — the lowercase equivalent must still pass.

4. **`src/utils/dateUtils.ts` delegates to the shared module.** `calculateNextExecutionDate` keeps its current signature (returns a `Date`) but computes via `advanceDate` from `shared/recurrenceDates.js` and parses the result. Remove the duplicated `switch`. The `"custom"` gap disappears because the shared module throws on unknown patterns.

5. **`RecurrencePattern` gains no `"custom"` member.** `custom` is a *billing cycle* (subscriptions), not a recurrence pattern. Add a one-line comment in `src/models/recurrence.ts` saying so, so the next reader does not re-add it.

6. **The processor queries the canonical schema:**
   ```js
   .where("status", "==", "active")
   .where("nextDate", "<=", today)
   ```
   and reads `rec.nextDate`, `rec.status`, `rec.pattern` (lowercase). The generated transaction's `transactionDate` is the **occurrence date being generated**, not the post-advance date.

7. **The processor catches up a full backlog in one run (F20).** Inside the existing `db.runTransaction`, loop: while the recurrence is due (`nextDate <= today`) and still active and not past `endDate`, create one transaction per occurrence and advance. Constraints:
   - **Hard cap of 499 iterations, not 500.** A Firestore transaction permits at most **500 writes**. The loop emits one `tx.set` per occurrence plus one final `tx.update` on the recurrence document, so 500 occurrences would be 501 writes and the transaction would fail — at exactly the cap that exists to keep it safe. Define the cap as a named constant with a comment stating the Firestore limit and the +1 for the recurrence update.
   - **Exceeding the cap is treated as data corruption, not a backlog to drain.** A legitimate backlog is bounded by pattern and elapsed time: daily for two years is ~730, monthly for a decade is 120. Anything past 499 in one run means the document is wrong, and silently generating 499 per day until it drains would flood the user's Ledger over successive days. On hitting the cap: stop, write `status: "paused"` so generation halts, set `backlogTruncated: true` on the recurrence, `console.error` with the user id and recurrence id, and leave it for the user to inspect. Do **not** leave it in a state that resumes draining on the next run.
   - **The generated transaction's `transactionDate` comes from the loop's own cursor**, not from `rec.nextDate` re-read from the document. The document field is only the starting anchor; reading it inside the loop gives every back-filled transaction the same date and silently breaks the requirement that each is dated to its own period.
   - All writes stay inside the one Firestore transaction so a crash mid-backlog cannot half-apply.
   - **When the next computed date exceeds `endDate`, write `status: "completed"`** — a new terminal state, **not** `"paused"` and not `isActive: false`. See Requirement 7a.
   - Firestore transactions require all reads before any write — keep the existing `tx.get(recDoc.ref)` re-read first.

7a. **`RecurrenceStatus` gains a `"completed"` member.** `"paused"` is a reversible state the user chose; a recurrence past its end date is finished, and the two must not share a value — see `CONTEXT.md`, *Completed*. Without this, resuming an ended recurrence advances `nextDate` into the future while `endDate` stays in the past, and the next processor run immediately re-pauses it: the user's resume silently undoes itself. Update `src/models/recurrence.ts`, `asRecurrenceStatus` in `src/models/mappers.ts` (a `"completed"` document must map to `"completed"`, not fall back to `"active"`), and the `useMemo` filters in `src/contexts/RecurrenceContext.tsx`. `RecurrencesPage` must render a completed recurrence distinctly from a paused one and must not offer Resume on it.

8. **The processor uses a collection-group query (F38)** instead of `db.collection("users").listDocuments()` plus a per-user query. Use `db.collectionGroup("recurrences").where("status","==","active").where("nextDate","<=",today)`. Derive the owning user id from the document path (`recDoc.ref.parent.parent.id`) — you need it to write the transaction to the right subcollection. If `parent.parent` is null, skip the document and `console.error`.

9. **`reactivateRecurrence` advances from the stored anchor, not `new Date()` (F32).** Change its signature to accept the recurrence's current `nextDate` (or the whole `Recurrence`) and advance from that anchor repeatedly until the result is strictly in the future, preserving the day of the recurrence's own period. Update the caller in `src/pages/RecurrencesPage.tsx` **only** to pass the additional argument — no other change to that file.
   - **Guard the legacy case.** A pre-migration document holds its anchor in `nextExecutionDate`, so `nextDate` reads as `""` and advancing from it produces garbage. Resolve the anchor through the same legacy-aware path as Requirement 10, and refuse to reactivate a recurrence with no resolvable anchor rather than writing a bad date.
   - It must refuse outright on a `"completed"` recurrence (Requirement 7a).

10. **Legacy documents are normalised on read *and* flagged (F45).** These are not alternatives: the typed `Recurrence` model requires `nextDate` and `status` (`src/models/recurrence.ts:33-34`), so the mapper must still produce valid values or every consumer breaks. What changes is that the values come from the legacy fields rather than from silent fallbacks, and the document is marked so the UI can say so. In `toRecurrence`:
    - If the raw document has `nextExecutionDate` or `isActive` present **and** lacks `nextDate` or `status`, treat it as legacy.
    - Map legacy documents by reading `isActive === true ? "active" : "paused"` into `status`, `nextExecutionDate` into `nextDate`, and lowercasing `pattern`.
    - Add a `isLegacySchema: boolean` field to the `Recurrence` interface, `true` for such documents and `false` otherwise, so the UI can flag them later.
    - A document that is neither valid-canonical nor recognisably-legacy must still not crash the app — keep the existing defaults for that case, but set `isLegacySchema: true`.

10a. **Writing to a legacy document normalises it instead of appending to it.** `pauseRecurrence` writes only `status` and `reactivateRecurrence` writes only `status` + `nextDate` (`src/services/recurrenceService.ts:63,74-78`), neither removing `isActive` or `nextExecutionDate`. Pausing a pre-migration recurrence therefore produces a **hybrid** document carrying both schemas, belonging to neither — a state the processor and the mapper both have to guess about. Every write path that touches a recurrence must first convert the whole document to the canonical shape, deleting the legacy fields with `FieldValue.deleteField()`, so a document is never left half-migrated by an ordinary user action.

11. **Write `scripts/backfill-recurrences.js` — do not run it.** A Node script using `firebase-admin` that finds recurrences carrying `isActive`/`nextExecutionDate` and rewrites them to the canonical schema (`status`, `nextDate`, lowercase `pattern`), removing the old fields with `FieldValue.delete()`. It must:
    - accept `--dry-run` (default) and only write when `--apply` is passed
    - print a count of documents found and, in dry-run, the first 10 document paths
    - be idempotent — running twice changes nothing the second time
    - carry a header comment stating it must be run by an operator with admin credentials, and that a dry run should be inspected first

12. **Delete `updateRecurrence` from `src/services/recurrenceService.ts`** — it has no callers. Do not add a UI for it.

13. **Delete the false comment at `src/contexts/RecurrenceContext.tsx:64-65.**

## Conventions to follow

- **Service layer signature style** — every service function takes `userId` first and returns a typed promise:
  ```ts
  export const pauseRecurrence = async (userId: string, recurrenceId: string): Promise<void> => {
    const ref = doc(db, "users", userId, "recurrences", recurrenceId);
    await updateDoc(ref, { status: "paused", updatedAt: serverTimestamp() });
  };
  ```
- **Mappers never use `as` casts on raw data** — they use the `asX` helper family. Follow that when adding legacy handling; add a new helper rather than inlining a cast.
- **Function logging** — `console.log` on success with ids interpolated, `console.error` on failure with the error appended:
  ```js
  console.log(`Processed recurrence ${recDoc.id} for user ${userId}.`);
  console.error(`Error processing recurrence ${recDoc.id} for user ${userId}:`, err);
  ```
- **Test style** — Vitest with globals (no imports of `describe`/`it`/`expect`), one `describe` per exported function:
  ```js
  describe("advanceDate", () => {
    it("advances weekly by 7 * interval days", () => {
      expect(advanceDate("2026-01-01", "weekly", 2)).toBe("2026-01-15");
    });
  });
  ```

## Tests required

**`shared/recurrenceDates.test.js`** — all existing `dateLogic.test.js` cases translated to lowercase, plus:
- `advanceDate("2026-01-31", "monthly", 1)` → `"2026-02-28"` (clamping)
- `advanceDate("2024-02-29", "yearly", 1)` → `"2025-02-28"` (leap-day clamping)
- `advanceDate("2026-01-01", "daily", 1)` → `"2026-01-02"`
- unknown pattern throws
- `interval` of `0`, `-1`, and `1.5` each throw

**`functions/recurrenceProcessor.contract.test.js`** — the test that would have caught F1. It must assert against the **field names**, not mock them away: build the document object exactly as `addRecurrence` in `src/services/recurrenceService.ts` builds it, and assert the processor's query constraints and field reads target those same keys. If the two drift again, this test fails. Use a fake/stub Firestore; do not hit a real database or require the emulator.

**`src/models/__tests__/mappers.recurrence.test.ts`** — `toRecurrence` given:
- a canonical document → `isLegacySchema === false`, fields pass through
- a legacy document (`isActive: true`, `nextExecutionDate: "2025-03-01"`, `pattern: "Monthly"`) → `status === "active"`, `nextDate === "2025-03-01"`, `pattern === "monthly"`, `isLegacySchema === true`
- a legacy paused document (`isActive: false`) → `status === "paused"`
- an empty document → does not throw

**Backlog behaviour** — a recurrence three months overdue produces three transactions in one run, **each dated to its own period** (the Requirement 7 cursor test). A recurrence past the 499 cap stops, is left `"paused"` with `backlogTruncated: true`, and does not resume draining on a second run.

**Terminal state** — a recurrence whose next date passes `endDate` becomes `"completed"`, not `"paused"`; `reactivateRecurrence` refuses it.

**Hybrid documents** — pausing a legacy-shaped recurrence leaves a canonical document with `isActive` and `nextExecutionDate` removed (the Requirement 10a test).

## Definition of done

The orchestrator runs these:
```
npm run lint
npm run test
npm run build
```
plus, from `functions/`: `npm run test`.

`shared/` must be picked up by the root Vitest config (`vite.config.js` sets no `include`, so the default `**/*.test.*` applies). If your placement means the shared tests are not collected, say so.

## Constraints

- **No new dependencies without asking first.** `shared/recurrenceDates.js` must have zero imports. If you believe `firebase-functions` v6 requires an API change beyond `import` syntax, report it rather than adding packages.
- **No reformatting of untouched lines.**
- **No refactors beyond the listed files.** In particular `src/pages/RecurrencesPage.tsx` gets exactly one change: the extra argument in Requirement 9.
- **Do not run the backfill script and do not add it to CI.**
- Do not change `RecurrenceForm.tsx`'s `PATTERNS` array unless it is already lowercase-mismatched; it currently reads `["daily","weekly","monthly","yearly"]`, which is correct — leave it.

## Report back

1. The implementation.
2. Your approach — especially the ESM conversion and how the contract test detects schema drift.
3. Anything skipped, blocked, or decided differently. **Specifically: state whether the contract test would actually have failed against the pre-fix code, and how you convinced yourself of that without running it.**
